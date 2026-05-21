import * as Tone from "tone";
import { AudioContextManager } from "./AudioContextManager";
import { settingsManager } from "@/core/SettingsManager";

export class MusicSequencer {
  private ctxManager: AudioContextManager;
  
  private musicBassSynth!: Tone.MonoSynth;
  public musicArpSynth!: Tone.PolySynth;
  private bassSeq!: Tone.Sequence<string>;
  private arpSeq!: Tone.Sequence<string>;

  public isMusicPlaying: boolean = false;

  constructor(ctxManager: AudioContextManager) {
    this.ctxManager = ctxManager;
    this.ctxManager.registerOnInit(() => this.init());
  }

  private init() {
    const musicGain = this.ctxManager.musicGain;

    this.musicBassSynth = new Tone.MonoSynth({
      oscillator: { type: "sawtooth" },
      filter: { type: "lowpass", frequency: 350, Q: 1.0 },
      envelope: { attack: 0.02, decay: 0.12, sustain: 0.4, release: 0.15 },
      filterEnvelope: { attack: 0.02, decay: 0.15, sustain: 0.3, release: 0.15, baseFrequency: 350, octaves: 1.5 }
    }).connect(musicGain);

    this.musicArpSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.1, release: 0.25 }
    }).connect(musicGain);

    const delay = new Tone.FeedbackDelay("8n.", 0.35).connect(musicGain);
    this.musicArpSynth.connect(delay);

    this.setupMusicSequences();

    if (this.isMusicPlaying) {
      this.bassSeq.start(0);
      this.arpSeq.start(0);
      Tone.getTransport().start();
      this.fadeInMusic(0.4);
    }
  }

  private setupMusicSequences() {
    const bassNotes = ["C2", "C2", "D#2", "D#2", "F2", "F2", "A#1", "A#1"];
    this.bassSeq = new Tone.Sequence<string>(
      (time, note) => {
        this.musicBassSynth.triggerAttackRelease(note, "8n", time);
      },
      bassNotes,
      "4n"
    );

    const arpProgression = ["C4", "C4", "G3", "G3", "F3", "F3", "G#3", "A#3"];
    this.arpSeq = new Tone.Sequence<string>(
      (time, baseNote) => {
        const chord = (baseNote === "G3" || baseNote === "A#3")
          ? [baseNote, Tone.Frequency(baseNote).transpose(4).toNote(), Tone.Frequency(baseNote).transpose(7).toNote()]
          : [baseNote, Tone.Frequency(baseNote).transpose(3).toNote(), Tone.Frequency(baseNote).transpose(7).toNote()];

        chord.forEach((note, index) => {
          this.musicArpSynth.triggerAttackRelease(note, "8n", time + index * 0.05);
        });
      },
      arpProgression,
      "2n"
    );

    Tone.getTransport().bpm.value = 135;
  }

  public startMusic() {
    this.ctxManager.resumeContext();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    if (this.ctxManager.initialized) {
      this.bassSeq.start(0);
      this.arpSeq.start(0);
      Tone.getTransport().start();
      this.fadeInMusic(0.4);
    }
  }

  public stopMusic() {
    if (this.ctxManager.initialized) {
      this.bassSeq.stop();
      this.arpSeq.stop();
      Tone.getTransport().stop();
    }
    this.isMusicPlaying = false;
  }

  public fadeOutMusic(duration: number = 1.5) {
    if (!this.ctxManager.initialized || !this.isMusicPlaying) return;
    this.ctxManager.musicGain.volume.rampTo(-120, duration);
    setTimeout(() => {
      this.stopMusic();
      this.ctxManager.updateVolumes();
    }, duration * 1000 + 100);
  }

  public fadeInMusic(duration: number = 0.4) {
    if (!this.ctxManager.initialized || !this.isMusicPlaying) return;
    const config = settingsManager.getAudio();
    const targetDb = config.musicVolume <= 0 ? -120 : Tone.gainToDb(config.musicVolume * 0.30);
    
    this.ctxManager.musicGain.volume.setValueAtTime(-120, Tone.now());
    this.ctxManager.musicGain.volume.rampTo(targetDb, duration);
  }
}
