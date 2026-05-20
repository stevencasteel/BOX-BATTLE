import { settingsManager } from "@/core/SettingsManager";

class SoundSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  private musicInterval: any = null;
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

    const master = config.masterMuted ? 0 : config.masterVolume * 0.25;
    const sfx = config.sfxMuted ? 0 : config.sfxVolume;
    const music = config.musicMuted ? 0 : config.musicVolume * 0.4;

    this.masterGain.gain.setValueAtTime(master, now);
    this.sfxGain.gain.setValueAtTime(sfx, now);
    this.musicGain.gain.setValueAtTime(music, now);
  }

  private resumeContext() {
    this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public playJump() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playDash() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const duration = 0.15;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noiseNode.start(now);
    noiseNode.stop(now + duration);
  }

  public playSlash() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playHitConfirm() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "square";
    osc1.frequency.setValueAtTime(800, now);
    osc1.frequency.setValueAtTime(1200, now + 0.04);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(400, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.09);
    osc2.stop(now + 0.09);
  }

  public playPogo() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playHurt() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(250, now);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playSelectTick() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playErrorTick() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(110, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
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
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + stepTime - 0.02);

      osc.connect(gain);
      gain.connect(this.musicGain);

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
