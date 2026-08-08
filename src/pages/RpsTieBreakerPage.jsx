import React from 'react';
import { RpsTieBreaker } from '../components/RpsTieBreaker';

export function RpsTieBreakerPage({ gameState, currentUser, onRpsComplete }) {
  return (
    <RpsTieBreaker
      gameState={gameState}
      currentUser={currentUser}
      onRpsComplete={onRpsComplete}
    />
  );
}
