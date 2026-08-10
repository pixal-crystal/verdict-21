import React, { useState, useEffect } from 'react';
import { Play, Plus, LogIn, Users, Disc, Dices, RefreshCw } from 'lucide-react';
import { scanLanRooms } from '../utils/peerService';
import { soundEffects } from '../utils/audioSynth';
import { DraggableToggleSwitch } from './DraggableToggleSwitch';

const AVATARS = ['😎', '🔥', '👑', '⚡', '🎮', '🚀', '🔮', '🎭', '👾', '👤'];
const STEALTH_ACCENTS = ['#475569', '#334155', '#1e293b', '#64748b', '#94a3b8', '#cbd5e1'];

export function Lobby({ onCreateRoom, onJoinRoom, currentUser, setCurrentUser }) {
  const urlRoomCode = new URLSearchParams(window.location.search).get('room') || '';
  const [roomCodeInput, setRoomCodeInput] = useState(urlRoomCode.toUpperCase());
  const [gameMode, setGameMode] = useState('1-21');
  const [lanRooms, setLanRooms] = useState([]);
  const [isScanning, setIsScanning] = useState(true);
  const [activeSegment, setActiveSegment] = useState(urlRoomCode ? 'ROOM' : 'PROFILE'); // 'PROFILE' or 'ROOM'
  const [lobbyTab, setLobbyTab] = useState(urlRoomCode ? 'JOIN' : 'CREATE'); // 'CREATE' for Host, 'JOIN' for Participant

  useEffect(() => {
    if (urlRoomCode) {
      setRoomCodeInput(urlRoomCode.toUpperCase());
      setActiveSegment('ROOM');
      setLobbyTab('JOIN');
    }
  }, [urlRoomCode]);

  useEffect(() => {
    const stopScanning = scanLanRooms((rooms) => {
      setLanRooms(rooms);
      setIsScanning(false);
    });
    const timer = setTimeout(() => setIsScanning(false), 2000);

    return () => {
      stopScanning();
      clearTimeout(timer);
    };
  }, []);

  const handleCreate = () => {
    soundEffects.playSuccessChime();
    onCreateRoom({
      name: currentUser.name || 'Player 1',
      avatar: currentUser.avatar,
      color: currentUser.color || '#475569',
      gameMode
    });
  };

  const handleJoin = (code) => {
    soundEffects.playTick();
    onJoinRoom({
      roomCode: code || roomCodeInput.trim().toUpperCase(),
      name: currentUser.name || 'Guest',
      avatar: currentUser.avatar,
      color: currentUser.color || '#475569'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2 flex flex-col items-center justify-center my-auto min-h-[60vh] gap-6 animate-in fade-in duration-300">
      {/* 2-Segment Switcher Navigation Header */}
      <div className="flex justify-center my-2">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl gap-2">
          <button
            type="button"
            onClick={() => {
              soundEffects.playTick();
              setActiveSegment('PROFILE');
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-all ${
              activeSegment === 'PROFILE'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>1. PLAYER PROFILE</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects.playTick();
              setActiveSegment('ROOM');
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-all ${
              activeSegment === 'ROOM'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
            <span>2. ROOM SETUP & JOIN</span>
          </button>
        </div>
      </div>

      {/* SEGMENT 1: PLAYER PROFILE */}
      {activeSegment === 'PROFILE' && (
        <div className="w-full glass-black p-8 sm:p-10 flex flex-col justify-between border border-slate-800/80 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                <Users className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <h2 className="text-base font-bold font-heading text-slate-100 uppercase">Player Identity</h2>
                <span className="text-[11px] text-slate-400">Set your name, avatar, and color styling</span>
              </div>
            </div>
            <div className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800">
              {currentUser.avatar}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Display Name */}
            <div className="space-y-3">
              <label className="block text-[11px] font-heading font-bold text-slate-300 uppercase tracking-wider">
                DISPLAY NAME
              </label>
              <input
                type="text"
                value={currentUser.name}
                onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                placeholder="Enter your name..."
                maxLength={24}
                className="w-full bg-black border-2 border-slate-800 focus:border-slate-500 rounded-xl px-5 py-3.5 text-slate-100 font-bold text-sm focus:outline-none transition-all shadow-inner"
              />
            </div>

            {/* Accent Color */}
            <div className="space-y-3">
              <label className="block text-[11px] font-heading font-bold text-slate-300 uppercase tracking-wider">
                ACCENT COLOR
              </label>
              <div className="flex items-center gap-4 p-3 bg-black/60 border border-slate-800 rounded-xl justify-around">
                {STEALTH_ACCENTS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrentUser({ ...currentUser, color: c })}
                    style={{ backgroundColor: c }}
                    className={`w-8 h-8 rounded-lg border-2 transition-all cursor-pointer ${
                      currentUser.color === c ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Avatar Grid */}
          <div className="space-y-3 pt-2">
            <label className="block text-[11px] font-heading font-bold text-slate-300 uppercase tracking-wider">
              CHOOSE AVATAR
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 p-4 bg-black/50 border border-slate-800 rounded-2xl">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setCurrentUser({ ...currentUser, avatar: av })}
                  className={`text-xl p-2.5 rounded-xl border-2 transition-all flex items-center justify-center aspect-square cursor-pointer ${
                    currentUser.avatar === av
                      ? 'bg-slate-800 border-slate-400 scale-105 shadow-md'
                      : 'bg-black border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Segment 1 Action Button */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => {
                soundEffects.playTick();
                setActiveSegment('ROOM');
              }}
              className="btn-black-primary text-xs py-3.5 px-8 rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-all"
            >
              <span>NEXT: ROOM SETUP & JOIN</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>
      )}

      {/* SEGMENT 2: ROOM SETUP & JOIN */}
      {activeSegment === 'ROOM' && (
        <div className="w-full glass-black p-8 sm:p-10 flex flex-col justify-between border border-slate-800/80 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Inner Host vs Participant Selector */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playTick();
                  setLobbyTab('CREATE');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase transition-all ${
                  lobbyTab === 'CREATE'
                    ? 'bg-slate-800 text-white border border-slate-600'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>HOST (CREATE)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playTick();
                  setLobbyTab('JOIN');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase transition-all ${
                  lobbyTab === 'JOIN'
                    ? 'bg-slate-800 text-white border border-slate-600'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>PARTICIPANT (JOIN)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveSegment('PROFILE')}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 underline flex items-center gap-1 cursor-pointer"
            >
              <span>← EDIT PROFILE</span>
            </button>
          </div>

          {lobbyTab === 'CREATE' ? (
            /* Host View */
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <h3 className="text-base font-bold font-heading text-slate-200 uppercase">
                  Select Target Selection Gamemode
                </h3>
                <DraggableToggleSwitch
                  mode={gameMode}
                  onChange={(newMode) => setGameMode(newMode)}
                />
              </div>

              <div className="w-full bg-white rounded-2xl p-5 shadow-lg relative overflow-hidden border border-slate-200 my-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${gameMode === '1-21' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                    {gameMode === '1-21' ? <Dices className="w-5 h-5" /> : <Disc className="w-5 h-5" />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${gameMode === '1-21' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                    {gameMode === '1-21' ? '1 to 21' : 'Bottle Spin'}
                  </span>
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-1">
                  {gameMode === '1-21' ? '1 to 21 Counting Game' : 'Spin the Bottle'}
                </h4>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                  {gameMode === '1-21'
                    ? 'Take turns adding +1, +2, or +3. Whoever hits 21 loses and becomes target.'
                    : 'The virtual bottle spins and lands randomly on a player target.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCreate}
                className="w-full btn-black-primary text-xs py-4 rounded-xl shadow-xl flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>CREATE & LAUNCH ROOM</span>
              </button>
            </div>
          ) : (
            /* Participant View */
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-black/80 border border-slate-800 space-y-4 shadow-xl">
                <label className="block text-xs font-heading font-bold text-slate-300 uppercase tracking-wider">
                  ENTER ROOM CODE
                </label>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleJoin();
                  }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE (e.g. TOD-8A2F)"
                    maxLength={10}
                    className="flex-1 bg-black border-2 border-slate-800 focus:border-slate-500 rounded-xl px-5 py-3.5 text-sm font-mono text-slate-100 uppercase tracking-widest focus:outline-none shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!roomCodeInput.trim()}
                    className="btn-black-accent text-xs px-8 py-3.5 rounded-xl shadow-lg cursor-pointer disabled:opacity-50 hover:scale-105 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>JOIN ROOM</span>
                  </button>
                </form>
              </div>

              {/* LAN Rooms */}
              {lanRooms.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>DISCOVERED LOCAL ROOMS ({lanRooms.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lanRooms.map((room) => (
                      <div
                        key={room.roomCode}
                        onClick={() => handleJoin(room.roomCode)}
                        className="p-3 rounded-lg bg-black border border-slate-700/80 hover:border-slate-500 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="font-mono text-xs font-bold text-slate-200">{room.roomCode}</div>
                          <div className="text-[10px] text-slate-400">{room.hostName}'s Game</div>
                        </div>
                        <button className="px-3 py-1 rounded bg-slate-800 text-white text-[11px] font-bold">
                          Join
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
