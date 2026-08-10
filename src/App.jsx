import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { BenchPenaltyView } from './components/BenchPenaltyView';
import { ChatVoicePanel } from './components/ChatVoicePanel';
import { AntiScreenshotOverlay } from './components/AntiScreenshotOverlay';

import { ProfilePage } from './pages/ProfilePage';
import { RoomSetupPage } from './pages/RoomSetupPage';
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

  // Extract room parameter from URL on load if present — store it but stay on front page
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
    const isLobbyPath = location.pathname === '/' || location.pathname === '/room-setup' || location.pathname === '/join' || location.pathname === '/profile' || location.pathname === '/lobby';
    
    if (gameState.phase === 'LOBBY') {
      // Allow only profile page (/) and room setup page (/room-setup) when not in active game
      if (location.pathname !== '/' && location.pathname !== '/room-setup') {
        navigate('/', { replace: true });
      }
      return;
    }

    const PHASE_TO_PATH = {
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

    const targetPath = PHASE_TO_PATH[gameState.phase] || '/room-setup';
    const roomQuery = gameState.roomCode ? `?room=${gameState.roomCode}` : '';
    const fullTarget = `${targetPath}${roomQuery}`;
    const currentFull = `${location.pathname}${location.search}`;

    if (currentFull !== fullTarget) {
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

  const isLobbyPath = location.pathname === '/' || location.pathname === '/profile' || location.pathname === '/room-setup' || location.pathname === '/join' || location.pathname === '/lobby';

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden font-body bg-black text-slate-100">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 z-10 flex flex-col justify-center items-center min-h-screen gap-10 sm:gap-14 md:gap-18 py-10 sm:py-14">

      {/* Anti-Screenshot Overlay */}
      <AntiScreenshotOverlay active={antiScreenshot && gameState.phase !== 'LOBBY'} />

      {/* Floating Navbar Header */}
      <Navbar
        gameState={gameState}
        currentUser={currentUser}
        onSwitchMode={() => handleSelectMode(gameState.gameMode, false)}
      />

      {/* Main Content Arena (Centered vertically and horizontally) */}
      <div className="w-full flex-1 flex flex-col relative justify-center items-center my-auto">
        <main className="flex-1 pb-10 z-10 w-full flex flex-col justify-center items-center my-auto">
          {isMeBenched && gameState.phase !== 'LOBBY' ? (
            <BenchPenaltyView roundsLeft={meInState.benchRoundsLeft} player={meInState} />
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  <ProfilePage
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                  />
                }
              />
              <Route
                path="/profile"
                element={
                  <ProfilePage
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                  />
                }
              />
              <Route
                path="/room-setup"
                element={
                  <RoomSetupPage
                    onCreateRoom={handleCreateRoom}
                    onJoinRoom={handleJoinRoom}
                    currentUser={currentUser}
                  />
                }
              />
              <Route path="/join" element={<Navigate to="/room-setup" replace />} />
              <Route path="/lobby" element={<Navigate to="/profile" replace />} />
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
              <Route path="/games" element={<Navigate to="/game-selector" replace />} />
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
