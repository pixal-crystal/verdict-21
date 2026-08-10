import React, { useState, useEffect } from 'react';
import { Plus, LogIn, Disc, Dices, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { scanLanRooms } from '../utils/peerService';
import { soundEffects } from '../utils/audioSynth';
import { DraggableToggleSwitch } from '../components/DraggableToggleSwitch';

export function RoomSetupPage({ onCreateRoom, onJoinRoom, currentUser }) {
  const navigate = useNavigate();
  const urlRoomCode = new URLSearchParams(window.location.search).get('room') || '';
  const [roomCodeInput, setRoomCodeInput] = useState(urlRoomCode.toUpperCase());
  const [gameMode, setGameMode] = useState('1-21');
  const [lanRooms, setLanRooms] = useState([]);
  const [isScanning, setIsScanning] = useState(true);
  const [lobbyTab, setLobbyTab] = useState(urlRoomCode ? 'JOIN' : 'CREATE'); // 'CREATE' for Host, 'JOIN' for Participant

  useEffect(() => {
    if (urlRoomCode) {
      setRoomCodeInput(urlRoomCode.toUpperCase());
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
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center my-auto min-h-[60vh] gap-8 animate-in fade-in duration-300">
      <div className="w-full glass-black p-8 sm:p-12 flex flex-col justify-between border border-slate-800/80 shadow-2xl space-y-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Navigation & Mode Toggle Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-6 gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                soundEffects.playTick();
                setLobbyTab('CREATE');
              }}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                lobbyTab === 'CREATE'
                  ? 'bg-slate-800 text-white border border-slate-600 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
              }`}
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>HOST (CREATE ROOM)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEffects.playTick();
                setLobbyTab('JOIN');
              }}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                lobbyTab === 'JOIN'
                  ? 'bg-slate-800 text-white border border-slate-600 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
              }`}
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>PARTICIPANT (JOIN ROOM)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEffects.playTick();
              navigate('/profile');
            }}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 underline flex items-center gap-1.5 cursor-pointer self-end sm:self-center"
          >
            <span>← EDIT PROFILE</span>
          </button>
        </div>

        {lobbyTab === 'CREATE' ? (
          /* Host View: Spacious & Elegant */
          <div className="space-y-10">
            {/* Gamemode Selector Switch */}
            <div className="flex flex-col items-center justify-center text-center space-y-6 p-8 rounded-2xl bg-black/60 border border-slate-800/80 shadow-xl">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
                SELECT TARGET SELECTION GAMEMODE
              </span>
              <DraggableToggleSwitch
                mode={gameMode}
                onChange={(newMode) => setGameMode(newMode)}
              />
            </div>

            {/* Mode Explanation Glass Card */}
            <div className="w-full bg-slate-950/90 rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-200 shadow-md">
                  {gameMode === '1-21' ? <Dices className="w-5 h-5" /> : <Disc className="w-5 h-5" />}
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  {gameMode === '1-21' ? '1 to 21 Mode' : 'Bottle Spin Mode'}
                </span>
              </div>

              <h4 className="text-lg font-bold font-heading text-slate-100">
                {gameMode === '1-21' ? '1 to 21 Counting Game' : 'Spin the Bottle'}
              </h4>

              <p className="text-slate-400 text-xs sm:text-sm font-body leading-relaxed max-w-2xl">
                {gameMode === '1-21'
                  ? 'Players take turns counting +1, +2, or +3. The player forced to count 21 gets selected as the Target for Truth or Dare.'
                  : 'The virtual bottle spins around the table and lands randomly on a player target.'}
              </p>
            </div>

            {/* Create Room Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleCreate}
                className="w-full btn-black-primary text-xs py-4 sm:py-5 rounded-xl shadow-2xl flex items-center justify-center gap-3 tracking-widest uppercase cursor-pointer hover:scale-[1.01] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>CREATE & LAUNCH ROOM</span>
              </button>
            </div>
          </div>
        ) : (
          /* Participant View: Ultra-Spacious & Elegant */
          <div className="space-y-12">
            {/* Manual Code Input Panel */}
            <div className="p-8 sm:p-12 rounded-2xl bg-black/80 border border-slate-800 space-y-6 shadow-2xl">
              <div className="space-y-2 border-b border-slate-800/60 pb-4">
                <label className="block text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  ENTER ROOM CODE
                </label>
                <p className="text-xs text-slate-400 font-body">
                  Enter the room code shared by your host to join the multiplayer session directly
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleJoin();
                }}
                className="flex flex-col sm:flex-row gap-5 pt-2"
              >
                <input
                  type="text"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE (e.g. TOD-8A2F)"
                  maxLength={10}
                  className="flex-1 bg-black border-2 border-slate-800 focus:border-slate-500 rounded-xl px-6 py-4.5 text-base font-mono text-slate-100 uppercase tracking-widest focus:outline-none shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!roomCodeInput.trim()}
                  className="btn-black-accent text-xs px-10 py-4.5 rounded-xl shadow-xl cursor-pointer disabled:opacity-50 hover:scale-105 transition-all flex items-center justify-center gap-3 uppercase font-mono font-bold"
                >
                  <LogIn className="w-4 h-4" />
                  <span>JOIN ROOM</span>
                </button>
              </form>
            </div>

            {/* LAN Network Connection Panel */}
            <div className="p-8 sm:p-10 rounded-2xl bg-black/80 border border-slate-800 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/60 gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border border-slate-800">
                    <RefreshCw className={`w-4 h-4 text-emerald-400 ${isScanning ? 'animate-spin' : ''}`} />
                    {isScanning && (
                      <span className="absolute w-8 h-8 rounded-full bg-emerald-500/20 animate-ping" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                      LOCAL NETWORK (LAN) DISCOVERY
                    </h4>
                    <p className="text-xs text-slate-400 font-body mt-0.5">
                      Auto-detect active room broadcasts hosted on your local network
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsScanning(true);
                    scanLanRooms((rooms) => {
                      setLanRooms(rooms);
                      setIsScanning(false);
                    });
                    setTimeout(() => setIsScanning(false), 2500);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono font-bold hover:bg-slate-800 hover:text-white transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'SCANNING...' : 'SCAN AGAIN'}</span>
                </button>
              </div>

              {isScanning ? (
                <div className="p-6 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    SCANNING SUBNET & BROADCAST CHANNEL
                  </div>
                  <p className="text-xs text-slate-400">Searching for nearby room signals across active peers...</p>
                </div>
              ) : lanRooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {lanRooms.map((room) => (
                    <div
                      key={room.roomCode}
                      onClick={() => handleJoin(room.roomCode)}
                      className="p-5 rounded-xl bg-slate-950/90 border border-slate-700/80 hover:border-slate-500 transition-all cursor-pointer flex items-center justify-between group shadow-xl"
                    >
                      <div className="space-y-1">
                        <div className="font-mono text-sm font-bold text-slate-100 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{room.roomCode}</span>
                        </div>
                        <div className="text-xs text-slate-400">{room.hostName}'s Match</div>
                      </div>
                      <button className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold font-mono transition-all shadow-md">
                        CONNECT
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                  <span>No active LAN rooms broadcasted nearby. Enter a room code above to join directly.</span>
                  <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 uppercase font-bold shrink-0">
                    LAN SCANNER ACTIVE
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
