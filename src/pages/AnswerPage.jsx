import React from 'react';
import { AnswerTimer } from '../components/AnswerTimer';

export function AnswerPage({ gameState, currentUser, onAnswerSubmit, onTimeoutPenalty, onNextRound }) {
  return (
    <AnswerTimer
      gameState={gameState}
      currentUser={currentUser}
      onAnswerSubmit={onAnswerSubmit}
      onTimeoutPenalty={onTimeoutPenalty}
      onNextRound={onNextRound}
    />
  );
}
