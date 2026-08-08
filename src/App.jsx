import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Lobby } from './components/Lobby';
import { CountingGame } from './components/CountingGame';
import { BottleSpinner } from './components/BottleSpinner';
import { RpsTieBreaker } from './components/RpsTieBreaker';
import { IsolationChamber } from './components/IsolationChamber';
import { QuestionVoting } from './components/QuestionVoting';
import { AnswerTimer } from './components/AnswerTimer';
import { BenchPenaltyView } from './components/BenchPenaltyView';
import { ChatVoicePanel } from './components/ChatVoicePanel';
import { AntiScreenshotOverlay } from './components/AntiScreenshotOverlay';

import { INITIAL_GAME_STATE, setupQuestionPhase, advanceGameRound } from './utils/gameRules';
import { NetworkHub } from './utils/peerService';
import { soundEffects } from './utils/audioSynth';

export function App() {
  const [currentUser, setCurrentUser] = useState({
    id: `user_${Math.floor(Math.random() * 10000)}`,
    name: 'Player 1',
    avatar: '😎',
    color: '#475569'
  });

  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [chatMessages, setChatMessages] = useState([]);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [antiScreenshot, setAntiScreenshot] = useState(true);
  const [networkHub, setNetworkHub] = useState(null);

  // Initialize Host Room
  const handleCreateRoom = ({ name, avatar, color, gameMode }) => {
    const code = `TOD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const me = { id: currentUser.id, name, avatar, color, isHost: true, isBenched: false, benchRoundsLeft: 0, score: 0 };

    const players = [me];
    const nextState = {
      ...INITIAL_GAME_STATE,
      roomCode: code,
      isHost: true,
      gameMode,
      players,
      phase: gameMode === '1-21' ? 'COUNTING_GAME' : 'BOTTLE_SPIN'
    };

    setGameState(nextState);

    const hub = new NetworkHub(code, true, (state) => setGameState(state), (msg) => setChatMessages(prev => [...prev, msg]));
    hub.setHostDetails(name, players.length, gameMode);
    setNetworkHub(hub);
  };

  // Join Room
  const handleJoinRoom = ({ roomCode, name, avatar, color }) => {
    const me = { id: currentUser.id, name, avatar, color, isHost: false, isBenched: false, benchRoundsLeft: 0, score: 0 };
    const hub = new NetworkHub(roomCode, false, (state) => setGameState(state), (msg) => setChatMessages(prev => [...prev, msg]));
    setNetworkHub(hub);

    hub.broadcastAction({ type: 'JOIN_PLAYER', player: me });
  };

  // 1-21 Counting Move Handler
  const handleCountMove = (increment) => {
    const activePlayers = gameState.players.filter(p => !p.isBenched);
    const turnIndex = gameState.turnPlayerIndex % activePlayers.length;
    const player = activePlayers[turnIndex];

    const newCount = (gameState.currentCount || 0) + increment;
    const numberSequence = Array.from({ length: increment }, (_, i) => gameState.currentCount + i + 1);
    const newHistory = [...(gameState.countHistory || []), { playerName: player.name, numbers: numberSequence }];

    if (newCount >= 21) {
      soundEffects.playBuzzer();

      if (activePlayers.length === 2) {
        setGameState(prev => ({
          ...prev,
          phase: 'RPS_TIEBREAKER',
          rpsDuel: { player1Id: activePlayers[0].id, player2Id: activePlayers[1].id }
        }));
      } else {
        const nextState = setupQuestionPhase({
          ...gameState,
          currentCount: 21,
          countHistory: newHistory,
          targetPlayerId: player.id
        });
        setGameState(nextState);
        networkHub?.broadcastState(nextState);
      }
    } else {
      const nextState = {
        ...gameState,
        currentCount: newCount,
        countHistory: newHistory,
        turnPlayerIndex: turnIndex + 1
      };
      setGameState(nextState);
      networkHub?.broadcastState(nextState);
    }
  };

  // Bottle Spinner Land Handler
  const handleBottleLand = (targetPlayer) => {
    const nextState = setupQuestionPhase({
      ...gameState,
      targetPlayerId: targetPlayer.id
    });
    setGameState(nextState);
    networkHub?.broadcastState(nextState);
  };

  // RPS Complete Handler
  const handleRpsComplete = (loserId) => {
    const nextState = setupQuestionPhase({
      ...gameState,
      targetPlayerId: loserId
    });
    setGameState(nextState);
    networkHub?.broadcastState(nextState);
  };

  // Question Vote Handler
  const handleVoteQuestion = (questionId) => {
    const updated = gameState.proposedQuestions.map(q => {
      if (q.id === questionId) {
        const hasVoted = q.votes.includes(currentUser.id);
        const votes = hasVoted ? q.votes.filter(id => id !== currentUser.id) : [...q.votes, currentUser.id];
        return { ...q, votes };
      }
      return q;
    });

    const nextState = { ...gameState, proposedQuestions: updated };
    setGameState(nextState);
    networkHub?.broadcastState(nextState);
  };

  // Custom Question Submit Handler
  const handleSubmitCustomQuestion = (newQuestion) => {
    const nextState = {
      ...gameState,
      proposedQuestions: [...gameState.proposedQuestions, newQuestion]
    };
    setGameState(nextState);
    networkHub?.broadcastState(nextState);
  };

  // Lock Question & Start Timer
  const handleLockQuestion = (selectedQ) => {
    const nextState = {
      ...gameState,
      phase: 'ANSWER_TIMER',
      selectedQuestion: selectedQ,
      timerSeconds: 30
    };
    setGameState(nextState);
    networkHub?.broadcastState(nextState);
  };

  // Answer Submission
  const handleAnswerSubmit = (text) => {
    const nextState = {
      ...gameState,
      answerText: text,
      answerSubmitted: true
    };
    setGameState(nextState);
    networkHub?.broadcastState(nextState);
  };

  // Timeout Penalty Handler (2-Round Suspension)
  const handleTimeoutPenalty = (targetId) => {
    const updatedBenched = { ...gameState.benchedPlayers, [targetId]: 2 };
    const updatedPlayers = gameState.players.map(p =>
      p.id === targetId ? { ...p, isBenched: true, benchRoundsLeft: 2 } : p
    );

    const nextState = {
      ...gameState,
      players: updatedPlayers,
      benchedPlayers: updatedBenched,
      phase: 'BENCH_PENALTY'
    };
    setGameState(nextState);
    networkHub?.broadcastState(nextState);

    setTimeout(() => {
      const advancedState = advanceGameRound(nextState);
      setGameState(advancedState);
      networkHub?.broadcastState(advancedState);
    }, 4000);
  };

  // Advance Next Round
  const handleNextRound = () => {
    const advancedState = advanceGameRound(gameState);
    setGameState(advancedState);
    networkHub?.broadcastState(advancedState);
  };

  const meInState = gameState.players.find(p => p.id === currentUser.id);
  const isMeBenched = meInState?.isBenched;

  const renderPhaseView = () => {
    if (isMeBenched && gameState.phase !== 'LOBBY') {
      return <BenchPenaltyView roundsLeft={meInState.benchRoundsLeft} player={meInState} />;
    }

    switch (gameState.phase) {
      case 'LOBBY':
        return (
          <Lobby
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        );
      case 'COUNTING_GAME':
        return (
          <CountingGame
            gameState={gameState}
            currentUser={currentUser}
            onCountMove={handleCountMove}
          />
        );
      case 'BOTTLE_SPIN':
        return (
          <BottleSpinner
            gameState={gameState}
            currentUser={currentUser}
            onBottleLand={handleBottleLand}
          />
        );
      case 'RPS_TIEBREAKER':
        return (
          <RpsTieBreaker
            gameState={gameState}
            currentUser={currentUser}
            onRpsComplete={handleRpsComplete}
          />
        );
      case 'QUESTION_SELECTION':
        if (gameState.targetPlayerId === currentUser.id) {
          return <IsolationChamber targetPlayer={meInState} />;
        }
        return (
          <QuestionVoting
            gameState={gameState}
            currentUser={currentUser}
            onVoteQuestion={handleVoteQuestion}
            onSubmitCustomQuestion={handleSubmitCustomQuestion}
            onLockQuestion={handleLockQuestion}
          />
        );
      case 'ANSWER_TIMER':
      case 'ANSWER_REVEAL':
        return (
          <AnswerTimer
            gameState={gameState}
            currentUser={currentUser}
            onAnswerSubmit={handleAnswerSubmit}
            onTimeoutPenalty={handleTimeoutPenalty}
            onNextRound={handleNextRound}
          />
        );
      case 'BENCH_PENALTY':
        const benchedPlayer = gameState.players.find(p => p.id === gameState.targetPlayerId);
        return <BenchPenaltyView roundsLeft={2} player={benchedPlayer} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden font-body bg-black text-slate-100">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 z-10 flex flex-col justify-center items-center min-h-screen gap-8 sm:gap-12 py-6">

      {/* Anti-Screenshot Overlay */}
      <AntiScreenshotOverlay active={antiScreenshot && gameState.phase !== 'LOBBY'} />

      {/* Floating Navbar Header (Now at the very top) */}
      <Navbar
        gameState={gameState}
        currentUser={currentUser}
        voiceMuted={voiceMuted}
        toggleVoiceMute={() => setVoiceMuted(!voiceMuted)}
        antiScreenshot={antiScreenshot}
        setAntiScreenshot={setAntiScreenshot}
      />

      {/* Hero Header on Black Background (Only visible in Lobby) */}
      {gameState.phase === 'LOBBY' && (
        <div className="flex flex-col items-center justify-center text-center space-y-3 w-full max-w-4xl mx-auto animate-in slide-in-from-top-4 duration-500">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black font-hero tracking-tighter uppercase leading-none text-slate-100 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <span>VERDICT</span> <span className="text-slate-500 font-extrabold">21</span>
          </h1>
          
          <p className="text-slate-400 text-sm sm:text-base md:text-lg font-heading font-medium max-w-2xl text-center">
            The most advanced multiplayer Truth or Dare experience. Pixel-perfect target selection and multi-device support.
          </p>
        </div>
      )}

      {/* Main Content Arena */}
      <div className="w-full flex-1 flex flex-col relative justify-center">
        <main className="flex-1 pb-8 z-10">{renderPhaseView()}</main>

        {/* Integrated Chat & Voice Panel */}
        {gameState.phase !== 'LOBBY' && (
          <div className="z-10 mt-auto">
            <ChatVoicePanel
              gameState={gameState}
              currentUser={currentUser}
              chatMessages={chatMessages}
              onSendMessage={(msg) => {
                setChatMessages(prev => [...prev, msg]);
                networkHub?.broadcastChat(msg);
              }}
              voiceMuted={voiceMuted}
              toggleVoiceMute={() => setVoiceMuted(!voiceMuted)}
            />
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
