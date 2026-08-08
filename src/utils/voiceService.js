// Web Audio Voice Activity Detection (VAD) Service
export class VoiceChatService {
  constructor(onTalkingStateChange) {
    this.onTalkingStateChange = onTalkingStateChange;
    this.mediaStream = null;
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.animFrameId = null;
    this.isMicActive = false;
    this.isCurrentlyTalking = false;
  }

  async startMicrophone() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.microphone.connect(this.analyser);

      this.isMicActive = true;
      this.monitorAudioLevel();
      return true;
    } catch (err) {
      console.warn('Microphone access error or denied:', err);
      this.isMicActive = false;
      return false;
    }
  }

  stopMicrophone() {
    this.isMicActive = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.isCurrentlyTalking) {
      this.isCurrentlyTalking = false;
      if (this.onTalkingStateChange) this.onTalkingStateChange(false, 0);
    }
  }

  monitorAudioLevel() {
    if (!this.analyser || !this.isMicActive) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const checkVolume = () => {
      if (!this.isMicActive || !this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const volumeLevel = Math.min(100, Math.round((average / 128) * 100));

      const isTalking = volumeLevel > 12; // Threshold for speaking

      if (isTalking !== this.isCurrentlyTalking) {
        this.isCurrentlyTalking = isTalking;
      }
      if (this.onTalkingStateChange) {
        this.onTalkingStateChange(this.isCurrentlyTalking, volumeLevel);
      }

      this.animFrameId = requestAnimationFrame(checkVolume);
    };

    checkVolume();
  }
}
