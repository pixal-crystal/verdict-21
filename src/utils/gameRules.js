export const INITIAL_GAME_STATE = {
  roomCode: '',
  isHost: false,
  phase: 'LOBBY', // LOBBY, COUNTING_GAME, BOTTLE_SPIN, RPS_TIEBREAKER, QUESTION_SELECTION, ANSWER_TIMER, ANSWER_REVEAL, BENCH_PENALTY
  gameMode: '1-21', // '1-21' or 'BOTTLE_SPIN'
  players: [], // [{ id, name, avatar, color, isHost, isBenched, benchRoundsLeft, score }]
  benchedPlayers: {}, // { playerId: roundsRemaining }
  
  // 1 to 21 Counting Game state
  currentCount: 0,
  turnPlayerIndex: 0,
  countHistory: [], // [{ playerName, numbers: [1, 2] }]
  
  // Target & Asker state
  targetPlayerId: null,
  leadAskerId: null,
  choiceType: null,
  
  // RPS state
  rpsDuel: null, // { player1Id, player2Id }

  // Question & Voting state (Only User Input Questions!)
  proposedQuestions: [], // [{ id, authorId, text, type, votes: [playerIds] }]
  selectedQuestion: null,
  
  // Answer & Timer state
  timerSeconds: 30,
  answerText: '',
  answerSubmitted: false,
  
  // Anti screenshot protection
  screenshotProtectionActive: true
};

// 4:1 Ratio Question Phase Setup (100% User-Input Driven)
export function setupQuestionPhase(gameState) {
  const activePlayers = gameState.players.filter(p => !p.isBenched);
  const targetId = gameState.targetPlayerId;
  const nonTargetPlayers = activePlayers.filter(p => p.id !== targetId);

  // Designate 1 Lead Asker randomly from non-targets (4:1 principle)
  const leadAsker = nonTargetPlayers.length > 0
    ? nonTargetPlayers[Math.floor(Math.random() * nonTargetPlayers.length)]
    : activePlayers[0];

  return {
    ...gameState,
    phase: 'QUESTION_SELECTION',
    leadAskerId: leadAsker ? leadAsker.id : null,
    proposedQuestions: [], // Empty initially - 100% user input driven!
    selectedQuestion: null,
    choiceType: null
  };
}

// Round Advance & Bench Counter Manager
export function advanceGameRound(gameState) {
  const updatedBenched = { ...gameState.benchedPlayers };
  const updatedPlayers = gameState.players.map(player => {
    if (updatedBenched[player.id] !== undefined) {
      const remaining = updatedBenched[player.id] - 1;
      if (remaining <= 0) {
        delete updatedBenched[player.id];
        return { ...player, isBenched: false, benchRoundsLeft: 0 };
      } else {
        updatedBenched[player.id] = remaining;
        return { ...player, isBenched: true, benchRoundsLeft: remaining };
      }
    }
    return player;
  });

  return {
    ...gameState,
    players: updatedPlayers,
    benchedPlayers: updatedBenched,
    currentCount: 0,
    turnPlayerIndex: 0,
    countHistory: [],
    targetPlayerId: null,
    leadAskerId: null,
    choiceType: null,
    proposedQuestions: [],
    selectedQuestion: null,
    timerSeconds: 30,
    answerText: '',
    answerSubmitted: false,
    phase: 'MODE_SELECTION'
  };
}
