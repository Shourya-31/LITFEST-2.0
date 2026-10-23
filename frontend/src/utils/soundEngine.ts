/**
 * Nautical & Water-Inspired Web Audio Engine
 * Lightweight, zero-dependency procedural audio synthesizer for aquatic soundscapes:
 * water droplets, bubble plops, oceanic glass chimes, and gentle sea waves.
 */
class NauticalSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

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
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Organic Water Droplet Plop / Bubble Sound
   * Synthesized using acoustic Minnaert bubble resonance:
   * an upward frequency chirp combined with a submerged liquid cavity thump.
   */
  public playWaterDrop(eventIndex: number = 0) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const baseFreq = this.WATER_FREQUENCIES[Math.abs(eventIndex) % this.WATER_FREQUENCIES.length];

      // 1. Primary droplet bubble oscillator (upward frequency chirp)
      const dropOsc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();
      const dropFilter = this.ctx.createBiquadFilter();

      dropOsc.type = 'sine';
      dropOsc.frequency.setValueAtTime(baseFreq * 0.95, now);
      dropOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.95, now + 0.075);

      dropFilter.type = 'lowpass';
      dropFilter.frequency.setValueAtTime(Math.min(3200, baseFreq * 3.2), now);

      dropGain.gain.setValueAtTime(0.14, now);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      dropOsc.connect(dropFilter);
      dropFilter.connect(dropGain);
      dropGain.connect(this.ctx.destination);

      dropOsc.start(now);
      dropOsc.stop(now + 0.085);

      // 2. Submerged liquid cavity body thump (creates that rich organic "plop" feel)
      const bodyOsc = this.ctx.createOscillator();
      const bodyGain = this.ctx.createGain();

      bodyOsc.type = 'sine';
      bodyOsc.frequency.setValueAtTime(baseFreq * 0.55, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, now + 0.05);

      bodyGain.gain.setValueAtTime(0.09, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(this.ctx.destination);

      bodyOsc.start(now);
      bodyOsc.stop(now + 0.055);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Primary Water Transition sound when moving between timeline event checkpoints
   */
  public playWaterTransition(eventIndex: number = 0) {
    this.playWaterDrop(eventIndex);
  }

  /**
   * Resonant underwater sea glass chime / oceanic marine bell
   * Pure singing harmonic tone filtered through oceanic acoustics
   */
  public playWaterBell(pitchIndex: number = 0) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const baseFreq = this.WATER_FREQUENCIES[Math.abs(pitchIndex) % this.WATER_FREQUENCIES.length];

      // Dual harmonic oscillators with gentle detune for watery shimmer
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq, now);

      // Glass overtone (2.756x crystal harmonic)
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq * 2.756 + 1.2, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, now);
      filter.Q.setValueAtTime(1.8, now);

      // Smooth attack and lingering oceanic decay
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.72);
      osc2.stop(now + 0.72);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Crisp water droplet for UI interactions (accordion toggle, button clicks)
   */
  public playDroplet() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(1240, now + 0.07);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Soft oceanic wave wash / spray
   */
  public playSplash() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.25;
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
    } catch {
      // Graceful fallback
    }
  }

  // Backwards compatibility aliases
  public playHelmClick(spokeIndex: number = 0) {
    this.playWaterTransition(spokeIndex);
  }

  public playSeaBell(pitchIndex: number = 0) {
    this.playWaterBell(pitchIndex);
  }
}

export const soundEngine = new NauticalSoundEngine();
