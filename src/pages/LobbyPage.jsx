import React from 'react';
import { Lobby } from '../components/Lobby';

export function LobbyPage({ onCreateRoom, onJoinRoom, currentUser, setCurrentUser }) {
  return (
    <Lobby
      onCreateRoom={onCreateRoom}
      onJoinRoom={onJoinRoom}
      currentUser={currentUser}
      setCurrentUser={setCurrentUser}
    />
  );
}
