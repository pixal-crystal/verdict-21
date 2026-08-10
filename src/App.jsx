import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Lobby } from './components/Lobby';
import { ModeSelection } from './components/ModeSelection';
import { TargetCategoryChoice } from './components/TargetCategoryChoice';
import { CountingGame } from './components/CountingGame';
import { BottleSpinner } from './components/BottleSpinner';
import { RpsTieBreaker } from './components/RpsTieBreaker';
import { IsolationChamber } from './components/IsolationChamber';
import { QuestionVoting } from './components/QuestionVoting';
import { AnswerTimer } from './components/AnswerTimer';
import { BenchPenaltyView } from './components/BenchPenaltyView';
import { ChatVoicePanel } from './components/ChatVoicePanel';
import { AntiScreenshotOverlay } from './components/AntiScreenshotOverlay';

import { LobbyPage } from './pages/LobbyPage';
import { ModeSelectionPage } from './pages/ModeSelectionPage';
import { GameSelectorPage } from './pages/GameSelectorPage';
import { CountingGamePage } from './pages/CountingGamePage';
import { BottleSpinPage } from './pages/BottleSpinPage';
import { RpsTieBreakerPage } from './pages/RpsTieBreakerPage';
import { TargetChoicePage } from './pages/TargetChoicePage';
import { QuestionVotingPage } from './pages/QuestionVotingPage';
import { AnswerPage } from './pages/AnswerPage';

import { INITIAL_GAME_STATE, setupQuestionPhase, advanceGameRound } from './utils/gameRules';
import { NetworkHub } from './utils/peerService';
import { soundEffects } from './utils/audioSynth';

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

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

  // Extract room parameter from URL on load if present
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const roomFromUrl = searchParams.get('room');
    if (roomFromUrl && !gameState.roomCode) {
      setGameState(prev => ({
        ...prev,
        roomCode: roomFromUrl.toUpperCase()
      }));
    }
  }, []);

  // Sync URL route with multiplayer game state phase and room code
  useEffect(() => {
    const PHASE_TO_PATH = {
      'LOBBY': '/',
      'MODE_SELECTION': '/mode-selection',
      'COUNTING_GAME': '/counting-game',
      'BOTTLE_SPIN': '/bottle-spin',
      'RPS_TIEBREAKER': '/rps-tiebreaker',
      'TARGET_CHOICE': '/target-choice',
      'QUESTION_SELECTION': '/question-selection',
      'ANSWER_TIMER': '/answer',
      'ANSWER_REVEAL': '/answer',
      'BENCH_PENALTY': '/bench-penalty'
    };

    const targetPath = PHASE_TO_PATH[gameState.phase] || '/';
    const roomQuery = gameState.roomCode ? `?room=${gameState.roomCode}` : '';
    const fullTarget = `${targetPath}${roomQuery}`;
    const currentFull = `${location.pathname}${location.search}`;

    if (currentFull !== fullTarget && location.pathname !== '/lobby') {
      navigate(fullTarget, { replace: true });
    }
  }, [gameState.phase, gameState.roomCode, navigate, location.pathname, location.search]);

  // Target Player chooses Truth or Dare category
  const handleTargetChooseCategory = (category) => {
    const nextState = {
      ...gameState,
      choiceType: category,
      phase: 'QUESTION_SELECTION'
    };
    setGameState(nextState);
    networkHub?.broadcastState(nextState);
  };

  // Host handles incoming client actions (e.g. JOIN_PLAYER, UPDATE_PLAYER_PROFILE)
  const handleClientAction = (action) => {
    if (!action) return;

    // Participant profile updates (Name, Avatar, Accent Color) - ONLY participant can change their own settings
    if (action.type === 'UPDATE_PLAYER_PROFILE' && action.player?.id) {
      setGameState((prevState) => {
        const updatedPlayers = prevState.players.map(p => {
          if (p.id === action.player.id) {
            return {
              ...p,
              name: action.player.name || p.name,
              avatar: action.player.avatar || p.avatar,
              color: action.player.color || p.color
            };
          }
          return p;
        });

        const nextState = { ...prevState, players: updatedPlayers };
        if (networkHub) {
          networkHub.broadcastState(nextState);
        }
        return nextState;
      });
      return;
    }

    if (action.type === 'JOIN_PLAYER' && action.player) {
      setGameState((prevState) => {
        const existingIdx = prevState.players.findIndex(p => p.id === action.player.id || p.name === action.player.name);
        let updatedPlayers = [...prevState.players];
        if (existingIdx >= 0) {
          updatedPlayers[existingIdx] = { ...updatedPlayers[existingIdx], ...action.player };
        } else {
          updatedPlayers.push({ ...action.player, isHost: false, isBenched: false, benchRoundsLeft: 0, score: 0 });
        }

        const nextState = {
          ...prevState,
          players: updatedPlayers
        };

        // Broadcast updated game state to all room members
        if (networkHub) {
          networkHub.setHostDetails(prevState.players[0]?.name || 'Host', updatedPlayers.length, prevState.gameMode);
          networkHub.broadcastState(nextState);
        }
        return nextState;
      });
    }
  };

  // Initialize Host Room (Transitions straight into In-Game Mode Selection)
  const handleCreateRoom = ({ name, avatar, color, gameMode }) => {
    const code = `TOD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const me = { id: currentUser.id, name, avatar, color, isHost: true, isBenched: false, benchRoundsLeft: 0, score: 0 };

    const players = [me];
    const nextState = {
      ...INITIAL_GAME_STATE,
      roomCode: code,
      isHost: true,
      gameMode: gameMode || '1-21',
      players,
      phase: 'MODE_SELECTION' // In-Game Gamemode Selection Screen
    };

    setGameState(nextState);

    const hub = new NetworkHub(
      code,
      true,
      (state) => setGameState(state),
      (msg) => setChatMessages(prev => [...prev, msg]),
      (action) => handleClientAction(action)
    );
    hub.setHostDetails(name, players.length, gameMode || '1-21');
    setNetworkHub(hub);
  };

  // Join Room
  const handleJoinRoom = ({ roomCode, name, avatar, color }) => {
    const me = { id: currentUser.id, name, avatar, color, isHost: false, isBenched: false, benchRoundsLeft: 0, score: 0 };
    
    // Update active user profile
    setCurrentUser(prev => ({ ...prev, name, avatar, color }));

    // Set initial client state with room code, add self to player list, and move out of lobby phase
    setGameState(prev => {
      const existingPlayers = prev.players.filter(p => p.id !== me.id);
      return {
        ...prev,
        roomCode,
        isHost: false,
        players: [...existingPlayers, me],
        phase: prev.phase === 'LOBBY' ? 'MODE_SELECTION' : prev.phase
      };
    });

    const hub = new NetworkHub(
      roomCode,
      false,
      (state) => setGameState(state),
      (msg) => setChatMessages(prev => [...prev, msg])
    );
    setNetworkHub(hub);

    // Send Join action to host
    setTimeout(() => {
      hub.broadcastAction({ type: 'JOIN_PLAYER', player: me });
    }, 100);
  };

  // Gamemode Switcher Handler (Called during the game - HOST ONLY)
  const handleSelectMode = (mode, launch = false) => {
    const isHost = gameState.isHost || (gameState.players.length > 0 && gameState.players[0].id === currentUser.id);
    if (!isHost) return; // Only room host can change or launch modes!

    const nextState = {
      ...gameState,
      gameMode: mode,
      phase: launch ? (mode === '1-21' ? 'COUNTING_GAME' : 'BOTTLE_SPIN') : 'MODE_SELECTION'
    };
    setGameState(nextState);
    networkHub?.broadcastState(nextState);
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
      answerSubmitted: true,
      phase: 'ANSWER_REVEAL'
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

  // Advance Next Round (Navigates to Mode Selection for next round)
  const handleNextRound = () => {
    const advancedState = advanceGameRound(gameState);
    setGameState(advancedState);
    networkHub?.broadcastState(advancedState);
  };

  const meInState = gameState.players.find(p => p.id === currentUser.id);
  const isMeBenched = meInState?.isBenched;

  const isLobbyPath = location.pathname === '/' || location.pathname === '/lobby';

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden font-body bg-black text-slate-100">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 z-10 flex flex-col justify-center items-center min-h-screen gap-10 sm:gap-16 py-8">

      {/* Anti-Screenshot Overlay */}
      <AntiScreenshotOverlay active={antiScreenshot && gameState.phase !== 'LOBBY'} />

      {/* Floating Navbar Header */}
      <Navbar
        gameState={gameState}
        currentUser={currentUser}
        onSwitchMode={() => handleSelectMode(gameState.gameMode, false)}
      />

      {/* Minimalist Hero Header (Visible in Lobby) */}
      {(gameState.phase === 'LOBBY' || isLobbyPath) && (
        <div className="flex flex-col items-center justify-center text-center space-y-3 w-full max-w-3xl mx-auto animate-in fade-in duration-500">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono font-medium text-slate-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            MULTIPLAYER • TRUTH OR DARE
          </div>

          <h1 className="text-4xl sm:text-5xl font-black font-hero tracking-tight text-white uppercase flex items-center justify-center gap-2">
            VERDICT <span className="text-slate-600 font-bold">21</span>
          </h1>
          
          <p className="text-slate-400 text-xs sm:text-sm font-body max-w-md text-center leading-relaxed">
            Minimalist, stealthy multiplayer target selection & custom truth or dare voting.
          </p>
        </div>
      )}

      {/* Main Content Arena */}
      <div className="w-full flex-1 flex flex-col relative justify-center">
        <main className="flex-1 pb-10 z-10">
          {isMeBenched && gameState.phase !== 'LOBBY' ? (
            <BenchPenaltyView roundsLeft={meInState.benchRoundsLeft} player={meInState} />
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  <LobbyPage
                    onCreateRoom={handleCreateRoom}
                    onJoinRoom={handleJoinRoom}
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                  />
                }
              />
              <Route
                path="/lobby"
                element={<Navigate to="/" replace />}
              />
              <Route
                path="/mode-selection"
                element={
                  <ModeSelectionPage
                    gameState={gameState}
                    currentUser={currentUser}
                    onSelectMode={handleSelectMode}
                  />
                }
              />
              <Route
                path="/game-selector"
                element={
                  <GameSelectorPage
                    gameState={gameState}
                    currentUser={currentUser}
                    onSelectMode={handleSelectMode}
                  />
                }
              />
              <Route
                path="/games"
                element={
                  <GameSelectorPage
                    gameState={gameState}
                    currentUser={currentUser}
                    onSelectMode={handleSelectMode}
                  />
                }
              />
              <Route
                path="/counting-game"
                element={
                  <CountingGamePage
                    gameState={gameState}
                    currentUser={currentUser}
                    onCountMove={handleCountMove}
                  />
                }
              />
              <Route
                path="/bottle-spin"
                element={
                  <BottleSpinPage
                    gameState={gameState}
                    currentUser={currentUser}
                    onBottleLand={handleBottleLand}
                  />
                }
              />
              <Route
                path="/rps-tiebreaker"
                element={
                  <RpsTieBreakerPage
                    gameState={gameState}
                    currentUser={currentUser}
                    onRpsComplete={handleRpsComplete}
                  />
                }
              />
              <Route
                path="/target-choice"
                element={
                  <TargetChoicePage
                    gameState={gameState}
                    currentUser={currentUser}
                    onChooseCategory={handleTargetChooseCategory}
                  />
                }
              />
              <Route
                path="/question-selection"
                element={
                  <QuestionVotingPage
                    gameState={gameState}
                    currentUser={currentUser}
                    onVoteQuestion={handleVoteQuestion}
                    onSubmitCustomQuestion={handleSubmitCustomQuestion}
                    onLockQuestion={handleLockQuestion}
                  />
                }
              />
              <Route
                path="/answer"
                element={
                  <AnswerPage
                    gameState={gameState}
                    currentUser={currentUser}
                    onAnswerSubmit={handleAnswerSubmit}
                    onTimeoutPenalty={handleTimeoutPenalty}
                    onNextRound={handleNextRound}
                  />
                }
              />
              <Route
                path="/bench-penalty"
                element={
                  <BenchPenaltyView
                    roundsLeft={2}
                    player={gameState.players.find(p => p.id === gameState.targetPlayerId)}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </main>

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
              networkHub={networkHub}
            />
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
