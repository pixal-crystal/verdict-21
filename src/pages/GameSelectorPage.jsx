import React from 'react';
import { ModeSelection } from '../components/ModeSelection';

export function GameSelectorPage({ gameState, currentUser, onSelectMode }) {
  return (
    <ModeSelection
      gameState={gameState}
      currentUser={currentUser}
      onSelectMode={onSelectMode}
    />
  );
}
