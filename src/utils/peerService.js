// LAN BroadcastChannel & Peer Networking Hub
export class NetworkHub {
  constructor(roomCode, isHost = false, onStateUpdate = null, onChatMessage = null, onClientAction = null) {
    this.roomCode = roomCode;
    this.isHost = isHost;
    this.onStateUpdate = onStateUpdate;
    this.onChatMessage = onChatMessage;
    this.onClientAction = onClientAction;
    
    this.channelName = `TOD_ROOM_${roomCode}`;
    this.broadcastChannel = new BroadcastChannel(this.channelName);
    
    this.broadcastChannel.onmessage = (event) => {
      this.handleIncomingPacket(event.data);
    };

    // Storage fallback for cross-tab sync
    this.storageKey = `TOD_SYNC_${roomCode}`;
    this.handleStorageEvent = (event) => {
      if (event.key === this.storageKey && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          this.handleIncomingPacket(parsed);
        } catch (e) {
          // ignore error
        }
      }
    };
    window.addEventListener('storage', this.handleStorageEvent);

    // LAN Discovery Channel
    this.discoveryChannel = new BroadcastChannel('TOD_LAN_DISCOVERY');
    this.discoveryChannel.onmessage = (event) => {
      if (this.isHost && (event.data.type === 'PING_LAN_ROOMS' || event.data.type === 'ANNOUNCE_LAN_ROOM')) {
        this.discoveryChannel.postMessage({
          type: 'ANNOUNCE_LAN_ROOM',
          roomCode: this.roomCode,
          hostName: this.hostName || 'Host',
          playerCount: this.playerCount || 1,
          gameMode: this.gameMode || '1-21'
        });
      }
    };
  }

  setHostDetails(hostName, playerCount, gameMode) {
    this.hostName = hostName;
    this.playerCount = playerCount;
    this.gameMode = gameMode;
  }

  broadcastState(gameState) {
    const packet = {
      type: 'STATE_UPDATE',
      state: gameState,
      _ts: Date.now()
    };
    this.broadcastChannel.postMessage(packet);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(packet));
    } catch (e) {}
  }

  broadcastChat(chatItem) {
    const packet = {
      type: 'CHAT_MESSAGE',
      chat: chatItem,
      _ts: Date.now()
    };
    this.broadcastChannel.postMessage(packet);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(packet));
    } catch (e) {}
  }

  broadcastAction(actionPayload) {
    const packet = {
      type: 'CLIENT_ACTION',
      action: actionPayload,
      _ts: Date.now()
    };
    this.broadcastChannel.postMessage(packet);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(packet));
    } catch (e) {}
  }

  handleIncomingPacket(data) {
    if (!data) return;
    if (data.type === 'STATE_UPDATE' && this.onStateUpdate) {
      this.onStateUpdate(data.state);
    } else if (data.type === 'CHAT_MESSAGE' && this.onChatMessage) {
      this.onChatMessage(data.chat);
    } else if (data.type === 'CLIENT_ACTION' && this.isHost && this.onClientAction) {
      this.onClientAction(data.action);
    }
  }

  destroy() {
    if (this.broadcastChannel) this.broadcastChannel.close();
    if (this.discoveryChannel) this.discoveryChannel.close();
    if (this.handleStorageEvent) window.removeEventListener('storage', this.handleStorageEvent);
  }
}

// Function to scan for LAN rooms active in browser/network
export const scanLanRooms = (callback) => {
  const discovered = new Map();
  const discoveryChannel = new BroadcastChannel('TOD_LAN_DISCOVERY');

  discoveryChannel.onmessage = (event) => {
    if (event.data.type === 'ANNOUNCE_LAN_ROOM') {
      discovered.set(event.data.roomCode, event.data);
      callback(Array.from(discovered.values()));
    }
  };

  // Ping active hosts
  discoveryChannel.postMessage({ type: 'PING_LAN_ROOMS' });

  return () => discoveryChannel.close();
};
