// Web Audio API generator for serene chimes, bells, and ambient relaxation sounds

class SoundManager {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientSource: AudioNode | null = null;
  private currentAmbient: string = 'off';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a soft Tibetan singing bowl / meditation chime
  playBreakPromptChime() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const frequencies = [528, 792, 1056]; // Solfeggio 528Hz love & transformation frequency

      frequencies.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(0, now + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.18 / (idx + 1), now + idx * 0.15 + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 2.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 2.6);
      });
    } catch {
      // Audio context may be restricted by browser policy before first interaction
    }
  }

  // Gentle confirmation click / start chime
  playStartTone() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.18);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.32);
    } catch {
      // Ignore
    }
  }

  // Play gentle completion harp / celebration
  playBreakCompletedChime() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio

      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.15, now + i * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 1.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 1.9);
      });
    } catch {
      // Ignore
    }
  }

  // Ambient sound generator (Rain / Forest breeze / Chimes)
  setAmbientSound(type: 'off' | 'rain' | 'forest' | 'chimes') {
    if (this.currentAmbient === type) return;
    this.stopAmbientSound();
    this.currentAmbient = type;

    if (type === 'off') return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      // Pink/Brown noise generator
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'rain') {
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        } else {
          // Forest breeze
          output[i] = (lastOut + 0.05 * white) / 1.05;
          lastOut = output[i];
          output[i] *= 2.5;
        }
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      // Filter for ambient softening
      const filter = this.ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.value = type === 'rain' ? 800 : 400;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 1.5);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(0);
      this.ambientSource = whiteNoise;
      this.ambientGain = gain;
    } catch {
      // Ignore
    }
  }

  stopAmbientSound() {
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      } catch {
        // Ignore
      }
    }
    if (this.ambientSource) {
      try {
        (this.ambientSource as AudioBufferSourceNode).stop();
      } catch {
        // Ignore
      }
      this.ambientSource = null;
    }
    this.currentAmbient = 'off';
  }
}

export const soundManager = new SoundManager();
