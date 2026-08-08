import React from 'react';
import { TargetCategoryChoice } from '../components/TargetCategoryChoice';

export function TargetChoicePage({ gameState, currentUser, onChooseCategory }) {
  return (
    <TargetCategoryChoice
      gameState={gameState}
      currentUser={currentUser}
      onChooseCategory={onChooseCategory}
    />
  );
}
