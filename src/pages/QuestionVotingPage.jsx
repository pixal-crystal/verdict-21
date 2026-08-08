import React from 'react';
import { QuestionVoting } from '../components/QuestionVoting';
import { IsolationChamber } from '../components/IsolationChamber';

export function QuestionVotingPage({ gameState, currentUser, onVoteQuestion, onSubmitCustomQuestion, onLockQuestion }) {
  // Target player sees isolation chamber, everyone else votes on questions
  if (gameState.targetPlayerId === currentUser.id) {
    const meInState = gameState.players.find(p => p.id === currentUser.id);
    return <IsolationChamber targetPlayer={meInState} />;
  }

  return (
    <QuestionVoting
      gameState={gameState}
      currentUser={currentUser}
      onVoteQuestion={onVoteQuestion}
      onSubmitCustomQuestion={onSubmitCustomQuestion}
      onLockQuestion={onLockQuestion}
    />
  );
}
