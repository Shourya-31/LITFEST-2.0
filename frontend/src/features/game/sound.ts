export const MILESTONE_METRES = 100;

/** Locally synthesized milestone chime. No downloads, music loop, or autoplay. */
export class MilestoneSound {
  enabled = true;
  private context: AudioContext | null = null;
  private lastMilestone = 0;
  private voices = new Set<{ oscillator: OscillatorNode; gain: GainNode }>();
  private createContext: () => AudioContext | null;

  constructor(
    createContext: () => AudioContext | null = () =>
      typeof window !== "undefined" && window.AudioContext
        ? new window.AudioContext()
        : null,
  ) { this.createContext = createContext; }

  /** Call synchronously from a play/resume/touch gesture to unlock browser audio. */
  unlock(): void {
    if (!this.enabled) return;
    try {
      this.context ??= this.createContext();
      if (this.context?.state === "suspended")
        void this.context.resume().catch(() => {});
    } catch {
      /* Audio support/permission must never prevent playing. */
    }
  }
  update(metres: number): void {
    if (!Number.isFinite(metres) || metres < 0) return;
    const milestone = Math.floor(metres / MILESTONE_METRES);
    if (milestone <= this.lastMilestone) return;
    this.lastMilestone = milestone;
    if (!this.enabled || !this.context || this.context.state !== "running")
      return;
    try {
      const context = this.context;
      [659.25, 830.61, 987.77].forEach((frequency, i) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = context.currentTime + i * 0.095;
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.075, start + 0.009);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        oscillator.connect(gain);
        gain.connect(context.destination);
        const voice = { oscillator, gain };
        this.voices.add(voice);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
          this.voices.delete(voice);
        };
        oscillator.start(start);
        oscillator.stop(start + 0.24);
      });
    } catch {
      this.stopNotes();
    }
  }
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.stopNotes();
  }
  reset(): void {
    this.stopNotes();
    this.lastMilestone = 0;
  }
  private stopNotes(): void {
    for (const voice of this.voices) {
      try {
        voice.oscillator.stop();
      } catch {
        /* Already finished. */
      }
      voice.oscillator.disconnect();
      voice.gain.disconnect();
    }
    this.voices.clear();
  }
  pause(): void {
    this.stopNotes();
    if (this.context && this.context.state !== "closed")
      void this.context.suspend().catch(() => {});
  }
  destroy(): void {
    this.stopNotes();
    if (this.context && this.context.state !== "closed")
      void this.context.close().catch(() => {});
    this.context = null;
  }
}
