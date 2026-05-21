import { settingsManager } from "@/core/SettingsManager";

class SoundSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  private musicInterval: ReturnType<typeof setInterval> | null = null;
  private musicTickIndex: number = 0;
  private isMusicPlaying: boolean = false;

  private init() {
    if (this.ctx) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();

    this.masterGain.connect(this.ctx.destination);
    this.sfxGain.connect(this.masterGain);
    this.musicGain.connect(this.masterGain);

    this.updateVolumes();
  }

  public updateVolumes() {
    this.init();
    if (!this.ctx || !this.masterGain || !this.sfxGain || !this.musicGain) return;

    const config = settingsManager.getAudio();
    const now = this.ctx.currentTime;

    // Standardized mixing levels modeled after professional audio channels
    const master = config.masterMuted ? 0 : config.masterVolume * 0.35;
    const sfx = config.sfxMuted ? 0 : config.sfxVolume * 0.85;
    const music = config.musicMuted ? 0 : config.musicVolume * 0.30;

    // Apply linear ramps to prevent audio clicks on slider adjustment
    this.masterGain.gain.linearRampToValueAtTime(master, now + 0.05);
    this.sfxGain.gain.linearRampToValueAtTime(sfx, now + 0.05);
    this.musicGain.gain.linearRampToValueAtTime(music, now + 0.05);
  }

  private resumeContext() {
    this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  /**
   * Generates a procedural pitch bend with an ADSR envelope
   */
  public playJump() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const envelope = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "triangle";
    filter.type = "lowpass";

    const now = this.ctx.currentTime;

    // Pitch envelope
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.12);

    // Resonant filter envelope
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.12);
    filter.Q.setValueAtTime(4.0, now);

    // Amplitude envelope (ADSR)
    envelope.gain.setValueAtTime(0.0, now);
    envelope.gain.linearRampToValueAtTime(0.6, now + 0.02); // Attack
    envelope.gain.exponentialRampToValueAtTime(0.1, now + 0.08); // Decay
    envelope.gain.setValueAtTime(0.1, now + 0.12); // Sustain
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.15); // Release

    osc.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  /**
   * Generates custom filtered white noise
   */
  public playDash() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const duration = 0.18;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(500, now + duration);
    filter.Q.setValueAtTime(2.5, now);

    const envelope = this.ctx.createGain();
    envelope.gain.setValueAtTime(0.0, now);
    envelope.gain.linearRampToValueAtTime(0.4, now + 0.01); // Snappy Attack
    envelope.gain.exponentialRampToValueAtTime(0.001, now + duration); // Release

    noiseNode.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.sfxGain);

    noiseNode.start(now);
    noiseNode.stop(now + duration);
  }

  public playSlash() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const envelope = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

    envelope.gain.setValueAtTime(0.0, now);
    envelope.gain.linearRampToValueAtTime(0.45, now + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(envelope);
    envelope.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playHitConfirm() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const envelope = this.ctx.createGain();

    osc1.type = "square";
    osc1.frequency.setValueAtTime(800, now);
    osc1.frequency.setValueAtTime(1200, now + 0.04);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(400, now);

    envelope.gain.setValueAtTime(0.0, now);
    envelope.gain.linearRampToValueAtTime(0.28, now + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc1.connect(envelope);
    osc2.connect(envelope);
    envelope.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.10);
    osc2.stop(now + 0.10);
  }

  public playPogo() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const envelope = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);

    envelope.gain.setValueAtTime(0.0, now);
    envelope.gain.linearRampToValueAtTime(0.65, now + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(envelope);
    envelope.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playHurt() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const envelope = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.16);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(280, now);
    filter.Q.setValueAtTime(2.0, now);

    envelope.gain.setValueAtTime(0.0, now);
    envelope.gain.linearRampToValueAtTime(0.85, now + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playSelectTick() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const envelope = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(620, now);

    envelope.gain.setValueAtTime(0.0, now);
    envelope.gain.linearRampToValueAtTime(0.15, now + 0.005);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(envelope);
    envelope.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playErrorTick() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const envelope = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(105, now);

    envelope.gain.setValueAtTime(0.0, now);
    envelope.gain.linearRampToValueAtTime(0.32, now + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(envelope);
    envelope.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playDialogueTick(speaker: "player" | "boss", char: string) {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const envelope = this.ctx.createGain();

    const charCode = char.charCodeAt(0) || 65;

    if (speaker === "player") {
      osc.type = "sine";
      const freq = 240 + (charCode % 6) * 35;
      osc.frequency.setValueAtTime(freq, now);

      envelope.gain.setValueAtTime(0.0, now);
      envelope.gain.linearRampToValueAtTime(0.15, now + 0.005);
      envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    } else {
      osc.type = "triangle";
      const freq = 70 + (charCode % 5) * 12;
      osc.frequency.setValueAtTime(freq, now);

      envelope.gain.setValueAtTime(0.0, now);
      envelope.gain.linearRampToValueAtTime(0.35, now + 0.01);
      envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    }

    osc.connect(envelope);
    envelope.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public startMusic() {
    this.resumeContext();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    const tempo = 135;
    const stepTime = 60 / tempo / 2;

    const basePitches = [
      [110.00, 130.81, 164.81],
      [98.00, 146.83, 196.00],
      [87.31, 130.81, 174.61],
      [82.41, 123.47, 164.81],
    ];

    this.musicInterval = setInterval(() => {
      if (!this.ctx || !this.musicGain) return;

      const chordIndex = Math.floor(this.musicTickIndex / 16) % basePitches.length;
      const notes = basePitches[chordIndex];
      const pattern = [0, 1, 2, 1, 0, 2, 1, 2];
      const stepInPattern = this.musicTickIndex % pattern.length;
      const baseFreq = notes[pattern[stepInPattern]];

      const octaveShift = stepInPattern % 4 === 0 ? 0.5 : 1;
      const freq = baseFreq * octaveShift;

      const osc = this.ctx.createOscillator();
      const envelope = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      envelope.gain.setValueAtTime(0.0, this.ctx.currentTime);
      envelope.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.01);
      envelope.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + stepTime - 0.02);

      osc.connect(envelope);
      envelope.connect(this.musicGain);

      osc.start();
      osc.stop(this.ctx.currentTime + stepTime);

      this.musicTickIndex++;
    }, stepTime * 1000);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }
}

export const soundSynth = new SoundSynth();