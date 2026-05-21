import { settingsManager } from "@/core/SettingsManager";

interface FrictionVoice {
  source: AudioBufferSourceNode;
  filter: BiquadFilterNode;
  gain: GainNode;
}

interface DroneVoice {
  osc: OscillatorNode;
  filter: BiquadFilterNode;
  gain: GainNode;
}

class SoundSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private cabinetFilter: BiquadFilterNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;

  private musicInterval: ReturnType<typeof setInterval> | null = null;
  private musicTickIndex: number = 0;
  private isMusicPlaying: boolean = false;

  private noiseBuffer: AudioBuffer | null = null;
  private activeSlides: Map<string, FrictionVoice> = new Map();
  private healDrone: DroneVoice | null = null;

  private hasUserGestured: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const resumeOnGesture = () => {
        this.hasUserGestured = true;
        this.resumeContext();
        
        window.removeEventListener("click", resumeOnGesture);
        window.removeEventListener("keydown", resumeOnGesture);
        window.removeEventListener("touchstart", resumeOnGesture);
        window.removeEventListener("mousedown", resumeOnGesture);
      };
      window.addEventListener("click", resumeOnGesture, { passive: true });
      window.addEventListener("keydown", resumeOnGesture, { passive: true });
      window.addEventListener("touchstart", resumeOnGesture, { passive: true });
      window.addEventListener("mousedown", resumeOnGesture, { passive: true });
    }
  }

  private init() {
    if (this.ctx) return;
    if (!this.hasUserGestured) return;

    const AudioContextClass = window.AudioContext || (window as unknown as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.cabinetFilter = this.ctx.createBiquadFilter();
    this.limiter = this.ctx.createDynamicsCompressor();

    this.cabinetFilter.type = "lowpass";
    this.cabinetFilter.frequency.setValueAtTime(20000, this.ctx.currentTime);
    this.cabinetFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

    this.limiter.threshold.setValueAtTime(-12, this.ctx.currentTime);
    this.limiter.knee.setValueAtTime(30, this.ctx.currentTime);
    this.limiter.ratio.setValueAtTime(12, this.ctx.currentTime);
    this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.limiter.release.setValueAtTime(0.08, this.ctx.currentTime);

    this.sfxGain.connect(this.cabinetFilter);
    this.musicGain.connect(this.cabinetFilter);
    this.cabinetFilter.connect(this.limiter);
    this.limiter.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.updateVolumes();
  }

  public updateVolumes() {
    if (!this.ctx || !this.masterGain || !this.sfxGain || !this.musicGain) return;

    const config = settingsManager.getAudio();
    const now = this.ctx.currentTime;

    const master = config.masterMuted ? 0 : Math.pow(config.masterVolume, 2) * 0.35;
    const sfx = config.sfxMuted ? 0 : Math.pow(config.sfxVolume, 2) * 0.85;
    const music = config.musicMuted ? 0 : Math.pow(config.musicVolume, 2) * 0.30;

    this.masterGain.gain.setTargetAtTime(master, now, 0.05);
    this.sfxGain.gain.setTargetAtTime(sfx, now, 0.05);
    this.musicGain.gain.setTargetAtTime(music, now, 0.05);
  }

  public setCabinetMuffle(active: boolean) {
    this.init();
    if (!this.ctx || !this.cabinetFilter) return;

    const now = this.ctx.currentTime;
    const targetFreq = active ? 600 : 20000;

    this.cabinetFilter.frequency.cancelScheduledValues(now);
    const currentVal = Math.max(0.1, this.cabinetFilter.frequency.value);
    this.cabinetFilter.frequency.setValueAtTime(currentVal, now);
    this.cabinetFilter.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.3);
  }

  public resumeContext() {
    this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  private getNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    if (this.noiseBuffer) return this.noiseBuffer;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  public handleEntitySlide(id: string, width: number, height: number, speed: number, shouldSlide: boolean) {
    if (!shouldSlide) {
      this.stopFrictionSlide(id);
      return;
    }

    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    let voice = this.activeSlides.get(id);

    if (!voice) {
      const buffer = this.getNoiseBuffer();
      if (!buffer) return;

      const volume = width * height;
      const baseFreq = Math.max(120, 1600 - (volume - 1000) * 0.45);

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.setValueAtTime(2.0, this.ctx.currentTime);
      filter.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      source.start(0);

      voice = { source, filter, gain };
      this.activeSlides.set(id, voice);
    }

    const maxSpeed = 450;
    const ratio = Math.min(1.0, speed / maxSpeed);
    const targetGain = ratio * 0.15;

    voice.gain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
  }

  private stopFrictionSlide(id: string) {
    if (!this.ctx) return;
    const voice = this.activeSlides.get(id);
    if (!voice) return;

    const now = this.ctx.currentTime;
    voice.gain.gain.setValueAtTime(0, now);

    const source = voice.source;
    const filter = voice.filter;
    const gain = voice.gain;

    setTimeout(() => {
      try {
        source.stop();
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch (err) {
        // Safe disconnection handling
      }
    }, 80);

    this.activeSlides.delete(id);
  }

  public clearAllSlides() {
    const ids = Array.from(this.activeSlides.keys());
    for (const id of ids) {
      this.stopFrictionSlide(id);
    }
  }

  public playBossTelegraph() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    // High-pitched warning alarm sweep representing weapon charging sequence
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.35);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + 0.35);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.42, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playBossLunge() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const duration = 0.45;

    const noiseBuffer = this.getNoiseBuffer();
    if (!noiseBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1100, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + duration);
    filter.Q.setValueAtTime(3.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.72, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    source.start(now);
    source.stop(now + duration + 0.01);
  }

  public playDashRecharge() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.setValueAtTime(1174.66, now + 0.04);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1320, now);
    osc2.frequency.setValueAtTime(1760, now + 0.04);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.13);
    osc2.stop(now + 0.13);
  }

  public playBossSwipe() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.22);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.22);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.50, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  public playMinionSpawning() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.3);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.3);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.40, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.31);
  }

  public playMinionDeconstruct() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.28);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.28);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.29);
  }

  public playBossPhaseShift() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.8);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(15, now);
    lfoGain.gain.setValueAtTime(30, now);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(350, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.8);
    filter.Q.setValueAtTime(4.0, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.55, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    lfo.start(now);
    osc.start(now);

    lfo.stop(now + 0.82);
    osc.stop(now + 0.82);
  }

  public playBossExplosion() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const delay = i * 0.25;
      const ringNow = now + delay;

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140 - i * 20, ringNow);
      osc.frequency.exponentialRampToValueAtTime(40, ringNow + 0.35);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(600, ringNow);
      filter.frequency.exponentialRampToValueAtTime(150, ringNow + 0.35);

      gain.gain.setValueAtTime(0, ringNow);
      gain.gain.linearRampToValueAtTime(0.45, ringNow + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ringNow + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(ringNow);
      osc.stop(ringNow + 0.36);

      const noise = this.getNoiseBuffer();
      if (noise) {
        const src = this.ctx.createBufferSource();
        src.buffer = noise;
        const nGain = this.ctx.createGain();
        const nFilter = this.ctx.createBiquadFilter();

        nFilter.type = "lowpass";
        nFilter.frequency.setValueAtTime(400, ringNow);

        nGain.gain.setValueAtTime(0, ringNow);
        nGain.gain.linearRampToValueAtTime(0.25, ringNow + 0.01);
        nGain.gain.exponentialRampToValueAtTime(0.001, ringNow + 0.2);

        src.connect(nFilter);
        nFilter.connect(nGain);
        nGain.connect(this.sfxGain);

        src.start(ringNow);
        src.stop(ringNow + 0.21);
      }
    }

    const finalNow = now + 0.85;
    const finalOsc = this.ctx.createOscillator();
    const finalGain = this.ctx.createGain();

    finalOsc.type = "triangle";
    finalOsc.frequency.setValueAtTime(90, finalNow);
    finalOsc.frequency.exponentialRampToValueAtTime(25, finalNow + 0.6);

    finalGain.gain.setValueAtTime(0, finalNow);
    finalGain.gain.linearRampToValueAtTime(0.70, finalNow + 0.05);
    finalGain.gain.exponentialRampToValueAtTime(0.001, finalNow + 0.6);

    finalOsc.connect(finalGain);
    finalGain.connect(this.sfxGain);

    finalOsc.start(finalNow);
    finalOsc.stop(finalNow + 0.61);
  }

  public playPlayerExplosion() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.8);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.linearRampToValueAtTime(60, now + 0.8);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.60, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.81);
  }

  public playHealStart() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;
    this.stopHealDrone();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 2.0);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(440, now);
    filter.frequency.exponentialRampToValueAtTime(1320, now + 2.0);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);

    this.healDrone = { osc, filter, gain };
  }

  public stopHealDrone() {
    if (!this.ctx || !this.healDrone) return;
    const now = this.ctx.currentTime;
    const { osc, filter, gain } = this.healDrone;

    gain.gain.setTargetAtTime(0, now, 0.05);
    setTimeout(() => {
      try {
        osc.stop();
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch (e) {
        // Safe cleanup
      }
    }, 150);

    this.healDrone = null;
  }

  public playHealComplete() {
    this.stopHealDrone();
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.04 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.28);
    });
  }

  public playHealCancel() {
    this.stopHealDrone();
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playSpikeStrike() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = "square";
    osc1.frequency.setValueAtTime(1400, now);
    osc1.frequency.exponentialRampToValueAtTime(700, now + 0.12);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(850, now);
    osc2.frequency.exponentialRampToValueAtTime(300, now + 0.12);

    filter.type = "highpass";
    filter.frequency.setValueAtTime(900, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.16);
    osc2.stop(now + 0.16);
  }

  public playLanding() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const envelope = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.11);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, now);

    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.42, now + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.14);

    const noiseBuffer = this.getNoiseBuffer();
    if (noiseBuffer) {
      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(1100, now);
      noiseFilter.Q.setValueAtTime(2.0, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(0.12, now + 0.01);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      noiseNode.start(now);
      noiseNode.stop(now + 0.09);
    }
  }

  public playFireballLvl1() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const envelope = this.ctx.createGain();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(440, now);
    osc1.frequency.exponentialRampToValueAtTime(160, now + 0.15);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(220, now);
    osc2.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(650, now);

    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.38, now + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.17);
    osc2.stop(now + 0.17);
  }

  public playFireballLvl2() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const envelope = this.ctx.createGain();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.exponentialRampToValueAtTime(80, now + 0.25);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(110, now);
    osc2.frequency.exponentialRampToValueAtTime(40, now + 0.25);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, now);

    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.65, now + 0.02);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.29);
    osc2.stop(now + 0.29);
  }

  public playJump() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const envelope = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "triangle";
    filter.type = "lowpass";

    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.12);

    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(900, now + 0.12);
    filter.Q.setValueAtTime(4.0, now);

    envelope.gain.setValueAtTime(0.0, now);
    envelope.gain.linearRampToValueAtTime(0.55, now + 0.02);
    envelope.gain.exponentialRampToValueAtTime(0.1, now + 0.08);
    envelope.gain.setValueAtTime(0.1, now + 0.12);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

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
    envelope.gain.linearRampToValueAtTime(0.4, now + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);

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
    if (!this.ctx || !this.sfxGain || !char) return;

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
      envelope.gain.linearRampToValueAtTime(0.70, now + 0.01);
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
