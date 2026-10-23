/**
 * Nautical & Water-Inspired Web Audio Engine
 * Lightweight procedural audio synthesizer for deep-sea aquatic soundscapes:
 * ocean wave swells, bubbles dive rush, water droplets, and glass chimes.
 * Derived from the underwater homepage audio synthesizer and the nautical timeline.
 */
class NauticalSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Ocean ambient sound nodes
  private oceanNoiseSource: AudioBufferSourceNode | null = null;
  private oceanGain: GainNode | null = null;
  private oceanLfo: OscillatorNode | null = null;
  private isOceanPlaying: boolean = false;

  // Harmonically tuned 14-note oceanic water scale across the 14 festival events
  private readonly WATER_FREQUENCIES = [
    311.13, // Event 1: Eb4 (Deep reef lagoon)
    349.23, // Event 2: F4
    392.00, // Event 3: G4
    440.00, // Event 4: A4
    466.16, // Event 5: Bb4
    523.25, // Event 6: C5 (Clear oceanic spring)
    587.33, // Event 7: D5
    622.25, // Event 8: Eb5
    698.46, // Event 9: F5
    783.99, // Event 10: G5
    880.00, // Event 11: A5
    932.33, // Event 12: Bb5
    1046.50, // Event 13: C6 (Sparkling crest)
    1174.66  // Event 14: D6 (High crystal droplet)
  ];

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isOceanPlaying) {
      this.stopOceanAmbience();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public isOceanAudioActive(): boolean {
    return this.isOceanPlaying;
  }

  /**
   * Deep Sea Oceanic Ambient Wave Audio Generator
   * Synthesizes continuous pink/white noise passed through a resonant lowpass filter
   * modulated by an LFO (0.14Hz, ~7s swell period) to replicate deep ocean current swells.
   */
  public startOceanAmbience() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.isOceanPlaying) return;

      const ctx = this.ctx;
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        output[i] = (b0 + b1 + b2) * 0.11;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, ctx.currentTime);
      filter.Q.setValueAtTime(2.2, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.14, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(120, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.28, ctx.currentTime + 2.0);

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);
      whiteNoise.start();

      this.oceanNoiseSource = whiteNoise;
      this.oceanGain = masterGain;
      this.oceanLfo = lfo;
      this.isOceanPlaying = true;
    } catch (err) {
      console.warn('Ocean audio could not be initialized:', err);
    }
  }

  public stopOceanAmbience() {
    if (!this.isOceanPlaying) return;
    try {
      if (this.oceanGain && this.ctx) {
        const ctx = this.ctx;
        this.oceanGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        setTimeout(() => {
          if (this.oceanNoiseSource) {
            try { this.oceanNoiseSource.stop(); } catch {}
            this.oceanNoiseSource.disconnect();
          }
          if (this.oceanLfo) {
            try { this.oceanLfo.stop(); } catch {}
            this.oceanLfo.disconnect();
          }
          this.oceanGain = null;
          this.oceanNoiseSource = null;
          this.oceanLfo = null;
          this.isOceanPlaying = false;
        }, 650);
      } else {
        this.isOceanPlaying = false;
      }
    } catch {
      this.isOceanPlaying = false;
    }
  }

  public toggleOceanAmbience(): boolean {
    if (this.isOceanPlaying) {
      this.stopOceanAmbience();
      return false;
    } else {
      this.startOceanAmbience();
      return true;
    }
  }

  /**
   * Effervescent Underwater Bubbles & Dive Surge Sound
   * Rapid cascade of rising micro-bubbles with resonant oceanic frequency sweeps.
   */
  public playBubbleDive() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Cluster of 6 ascending bubble plops
      for (let i = 0; i < 6; i++) {
        const offset = i * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startFreq = 280 + Math.random() * 200 + i * 90;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, now + offset);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 2.2, now + offset + 0.08);

        gain.gain.setValueAtTime(0.001, now + offset);
        gain.gain.linearRampToValueAtTime(0.08, now + offset + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.095);
      }
    } catch {}
  }

  /**
   * Organic Water Droplet Plop / Bubble Sound
   */
  public playWaterDrop(eventIndex: number = 0) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const baseFreq = this.WATER_FREQUENCIES[Math.abs(eventIndex) % this.WATER_FREQUENCIES.length];

      // Primary droplet bubble oscillator
      const dropOsc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();
      const dropFilter = this.ctx.createBiquadFilter();

      dropOsc.type = 'sine';
      dropOsc.frequency.setValueAtTime(baseFreq * 0.95, now);
      dropOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.95, now + 0.075);

      dropFilter.type = 'lowpass';
      dropFilter.frequency.setValueAtTime(Math.min(3200, baseFreq * 3.2), now);

      dropGain.gain.setValueAtTime(0.12, now);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      dropOsc.connect(dropFilter);
      dropFilter.connect(dropGain);
      dropGain.connect(this.ctx.destination);

      dropOsc.start(now);
      dropOsc.stop(now + 0.085);

      // Submerged body thump
      const bodyOsc = this.ctx.createOscillator();
      const bodyGain = this.ctx.createGain();

      bodyOsc.type = 'sine';
      bodyOsc.frequency.setValueAtTime(baseFreq * 0.55, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, now + 0.05);

      bodyGain.gain.setValueAtTime(0.08, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(this.ctx.destination);

      bodyOsc.start(now);
      bodyOsc.stop(now + 0.055);
    } catch {}
  }

  public playWaterTransition(eventIndex: number = 0) {
    this.playWaterDrop(eventIndex);
  }

  public playDroplet() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(1380, now + 0.07);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  public playSplash() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      filter.frequency.exponentialRampToValueAtTime(350, now + 0.25);
      filter.Q.setValueAtTime(2.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.26);
    } catch {}
  }

  public playHelmClick(spokeIndex: number = 0) {
    this.playWaterTransition(spokeIndex);
  }

  public playWaterBell(eventIndex: number = 0) {
    this.playWaterDrop(eventIndex);
  }

  public playSeaBell(pitchIndex: number = 0) {
    this.playWaterDrop(pitchIndex);
  }
}

export const soundEngine = new NauticalSoundEngine();
