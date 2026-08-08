import React, { useState, useEffect } from 'react';
import { Play, Plus, LogIn, Users, Disc, Dices, RefreshCw } from 'lucide-react';
import { scanLanRooms } from '../utils/peerService';
import { soundEffects } from '../utils/audioSynth';
import { DraggableToggleSwitch } from './DraggableToggleSwitch';

const AVATARS = ['😎', '🔥', '👑', '⚡', '🎮', '🚀', '🔮', '🎭', '👾', '👤'];
const STEALTH_ACCENTS = ['#475569', '#334155', '#1e293b', '#64748b', '#94a3b8', '#cbd5e1'];

export function Lobby({ onCreateRoom, onJoinRoom, currentUser, setCurrentUser }) {
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [gameMode, setGameMode] = useState('1-21');
  const [lanRooms, setLanRooms] = useState([]);
  const [isScanning, setIsScanning] = useState(true);

  const [showSetup, setShowSetup] = useState(false);

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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-6 sm:gap-8">

      {!showSetup ? (
        <div className="w-full glass-black p-8 sm:p-12 pb-16 sm:pb-20 flex flex-col items-center gap-10 sm:gap-12 shadow-2xl">
          <div className="text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-100 uppercase tracking-wide">
              How It Works
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              VERDICT 21 is a stealthy, high-stakes multiplayer Truth or Dare experience designed for seamless real-time play. No bots, no AI—just you and your friends.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full text-center">
            <div className="flex flex-col items-center justify-center text-center space-y-4 p-6 sm:p-7 rounded-xl border border-slate-800 bg-black/60 shadow-lg">
              <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700">
                <Users className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 uppercase">1. Join a Lobby</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Create a room or join your friends using a secure room code.</p>
            </div>
            
            <div className="flex flex-col items-center justify-center text-center space-y-4 p-6 sm:p-7 rounded-xl border border-slate-800 bg-black/60 shadow-lg">
              <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700">
                <Dices className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 uppercase">2. Select a Target</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Play the tension-filled 1-to-21 counting game or spin the bottle to pick the victim.</p>
            </div>

            <div className="flex flex-col items-center justify-center text-center space-y-4 p-6 sm:p-7 rounded-xl border border-slate-800 bg-black/60 shadow-lg">
              <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700">
                <Play className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 uppercase">3. Face the Verdict</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Players submit custom questions. The group votes. The target answers.</p>
            </div>
          </div>

          <button
            onClick={() => setShowSetup(true)}
            className="mt-6 mb-6 px-14 py-4 sm:py-5 btn-black-primary text-base sm:text-lg font-black tracking-widest shadow-2xl scale-105 hover:scale-110 transition-all"
          >
            PLAY NOW
          </button>
        </div>
      ) : (
        <>
          {/* Main Grid: Fills space evenly with clean box padding */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 w-full items-stretch animate-in fade-in zoom-in duration-300 my-6">
            {/* Left Column: Player Identity */}
            <div className="lg:col-span-5 glass-black p-6 sm:p-8 flex flex-col justify-between border border-slate-800/80 shadow-2xl space-y-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                    <Users className="w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold font-heading text-slate-100 uppercase">Player Identity</h2>
                    <span className="text-[11px] text-slate-400">Set your display name and avatar</span>
                  </div>
                </div>

                {/* Name Input */}
                <div className="space-y-2.5 my-4">
                  <label className="block text-[11px] font-heading font-bold text-slate-300 uppercase tracking-wider">
                    DISPLAY NAME
                  </label>
                  <input
                    type="text"
                    value={currentUser.name}
                    onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                    placeholder="Enter your name..."
                    maxLength={14}
                    className="w-full bg-black border-2 border-slate-800 focus:border-slate-500 rounded-xl px-4 py-3 text-slate-100 font-bold text-sm focus:outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Avatar Selector */}
                <div className="space-y-2.5 my-6">
                  <label className="block text-[11px] font-heading font-bold text-slate-300 uppercase tracking-wider">
                    CHOOSE AVATAR
                  </label>
                  <div className="grid grid-cols-5 gap-3 sm:gap-4 p-4 bg-black/50 border border-slate-800/80 rounded-2xl">
                    {AVATARS.map((av) => (
                      <button
                        key={av}
                        onClick={() => setCurrentUser({ ...currentUser, avatar: av })}
                        className={`text-xl p-2 rounded-xl border-2 transition-all flex items-center justify-center aspect-square ${
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

                {/* Accent Color Selector */}
                <div className="space-y-2.5 my-6">
                  <label className="block text-[11px] font-heading font-bold text-slate-300 uppercase tracking-wider">
                    ACCENT COLOR
                  </label>
                  <div className="flex items-center gap-3 sm:gap-4 p-4 bg-black/50 border border-slate-800/80 rounded-2xl justify-around">
                    {STEALTH_ACCENTS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCurrentUser({ ...currentUser, color: c })}
                        style={{ backgroundColor: c }}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          currentUser.color === c ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-75'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Game Selection */}
            <div className="lg:col-span-7 glass-black-highlight p-6 sm:p-8 flex flex-col justify-between border border-slate-700/80 shadow-2xl space-y-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                    <Play className="w-4 h-4 text-slate-300 fill-current" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold font-heading text-slate-100 uppercase">Game Selection</h2>
                    <span className="text-[11px] text-slate-400">Choose how the target player is selected</span>
                  </div>
                </div>

                {/* Mode Header & Draggable Switch in Middle */}
                <div className="flex flex-col items-center justify-center text-center pt-2 pb-2">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-[10px] font-bold px-3 py-1 bg-slate-800 rounded-full text-slate-300 border border-slate-700">🌈 Multiple mode support</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-heading text-slate-300 mb-2">
                    Switch between <span className="text-white">multiple modes</span><br/>and targets instantly
                  </h3>
                  
                  {/* Draggable Switch Centered Right in the Middle */}
                  <DraggableToggleSwitch
                    mode={gameMode}
                    onChange={(newMode) => setGameMode(newMode)}
                  />
                </div>

                {/* The White Dynamic Content Card */}
                <div className="w-full bg-white rounded-[24px] p-6 sm:p-8 shadow-xl transition-all duration-300 relative overflow-hidden group border border-slate-200 my-6">
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner ${gameMode === '1-21' ? 'bg-blue-100 text-blue-500' : 'bg-pink-100 text-pink-500'}`}>
                      {gameMode === '1-21' ? <Dices className="w-6 h-6" /> : <Disc className="w-6 h-6" />}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${gameMode === '1-21' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                      {gameMode === '1-21' ? '1 to 21' : 'Bottle Spin'}
                    </span>
                  </div>
                  
                  <div className="relative z-10">
                    <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                      {gameMode === '1-21' ? 'Counting Game' : 'Spin the Bottle'}
                    </h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                      {gameMode === '1-21' 
                        ? 'Take turns adding +1, +2, or +3. Whoever hits 21 loses and becomes the target.' 
                        : 'The bottle spins and lands randomly on a player. The chosen player becomes the target.'}
                    </p>
                  </div>

                  {/* Colorful Abstract Background Blobs */}
                  <div className={`absolute top-[-20%] right-[-10%] w-48 h-48 blur-[40px] rounded-full transition-all duration-700 opacity-30 ${gameMode === '1-21' ? 'bg-blue-400' : 'bg-pink-400'}`} />
                  <div className={`absolute bottom-[-20%] left-[-10%] w-32 h-32 blur-[30px] rounded-full transition-all duration-700 opacity-30 ${gameMode === '1-21' ? 'bg-purple-400' : 'bg-orange-400'}`} />
                </div>

                {/* Create Room Button */}
                <button
                  onClick={handleCreate}
                  className="w-full btn-black-primary text-xs sm:text-sm py-4 rounded-xl shadow-lg my-6"
                >
                  <Plus className="w-4 h-4" />
                  CREATE ROOM ({gameMode === '1-21' ? '1 to 21' : 'Bottle Spin'})
                </button>
              </div>

              {/* Join by Code Section */}
              <div className="border-t border-slate-800 pt-6 space-y-3 mt-8">
                <label className="block text-[11px] font-heading font-bold text-slate-400 uppercase tracking-wider">
                  JOIN EXISTING ROOM VIA CODE
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE (e.g. TOD-8A2F)"
                    maxLength={10}
                    className="flex-1 bg-black border-2 border-slate-800 focus:border-slate-500 rounded-xl px-4 py-3 text-xs font-mono text-slate-100 uppercase tracking-widest focus:outline-none"
                  />
                  <button
                    onClick={() => handleJoin()}
                    disabled={!roomCodeInput.trim()}
                    className="btn-black-accent text-xs px-6 py-3 rounded-xl"
                  >
                    <LogIn className="w-4 h-4" />
                    JOIN
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Discovered LAN Rooms Card */}
          <div className="glass-black p-6 sm:p-8 space-y-5 w-full my-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 border border-slate-800/80 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold font-heading text-slate-200">
                <RefreshCw className={`w-4 h-4 text-slate-400 ${isScanning ? 'animate-spin' : ''}`} />
                <span>DISCOVERED LAN ROOMS ({lanRooms.length})</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Auto-Detecting Local Peers</span>
            </div>

            {lanRooms.length === 0 ? (
              <div className="p-5 rounded-xl bg-black/80 border border-slate-800/80 text-center text-xs text-slate-400 font-medium my-2">
                No active local rooms found on this network. Create a room above or join via code.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-2">
                {lanRooms.map((room) => (
                  <div
                    key={room.roomCode}
                    onClick={() => handleJoin(room.roomCode)}
                    className="p-4 rounded-xl bg-black border border-slate-700/80 hover:border-slate-500 transition-all cursor-pointer flex items-center justify-between group shadow-md"
                  >
                    <div>
                      <div className="font-mono text-xs font-black text-slate-300 tracking-wider">{room.roomCode}</div>
                      <div className="text-xs text-slate-200 font-bold">{room.hostName}'s Game</div>
                      <div className="text-[10px] text-slate-400">{room.gameMode} • {room.playerCount} Players</div>
                    </div>
                    <button className="px-3 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold font-heading group-hover:bg-slate-700 transition-all shadow">
                      Join
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
