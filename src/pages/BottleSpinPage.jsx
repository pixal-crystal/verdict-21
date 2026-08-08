import React from 'react';
import { BottleSpinner } from '../components/BottleSpinner';

export function BottleSpinPage({ gameState, currentUser, onBottleLand }) {
  return (
    <BottleSpinner
      gameState={gameState}
      currentUser={currentUser}
      onBottleLand={onBottleLand}
    />
  );
}
