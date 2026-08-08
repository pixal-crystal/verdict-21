import React from 'react';
import { CountingGame } from '../components/CountingGame';

export function CountingGamePage({ gameState, currentUser, onCountMove }) {
  return (
    <CountingGame
      gameState={gameState}
      currentUser={currentUser}
      onCountMove={onCountMove}
    />
  );
}
