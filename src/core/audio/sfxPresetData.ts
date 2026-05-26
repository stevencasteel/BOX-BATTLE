export type BasicOscillatorType = "sine" | "sawtooth" | "triangle" | "square";

export interface SFXPreset {
  frequency: number;
  targetFrequency?: number;
  rampDuration?: number;
  decay: number;
  sustain?: number;
  release?: number;
  oscillatorType: BasicOscillatorType;
  filterType?: "lowpass" | "highpass" | "bandpass";
  filterFrequency?: number;
  filterTargetFrequency?: number;
  filterQ?: number;
  noiseType?: "white" | "pink" | "brown";
}

export const SFX_PRESETS = {
  player: {
    jump: {
      frequency: 240,
      targetFrequency: 580,
      rampDuration: 0.12,
      decay: 0.12,
      oscillatorType: "sine" as BasicOscillatorType,
    },
    dash_recharge: {
      lowNote: "A5",
      highNote: "E6",
      decay: 0.06,
    },
    heal_cancel: {
      frequency: 180,
      decay: 0.12,
      oscillatorType: "sawtooth" as BasicOscillatorType,
    },
    pogo: {
      frequency: 320,
      targetFrequency: 140,
      rampDuration: 0.09,
      decay: 0.1,
      oscillatorType: "sine" as BasicOscillatorType,
    },
    hurt: {
      frequency: 180,
      targetFrequency: 45,
      rampDuration: 0.16,
      decay: 0.16,
      oscillatorType: "sawtooth" as BasicOscillatorType,
    },
    fireball_lvl1: {
      frequency: 440,
      targetFrequency: 160,
      rampDuration: 0.15,
      decay: 0.12,
      oscillatorType: "triangle" as BasicOscillatorType,
    },
    fireball_lvl2: {
      frequency: 220,
      targetFrequency: 80,
      rampDuration: 0.25,
      decay: 0.25,
      oscillatorType: "sawtooth" as BasicOscillatorType,
    },
    landing: {
      synthFreq: 160,
      synthTargetFreq: 65,
      synthDuration: 0.11,
      noiseFreq: 1100,
      noiseDecay: 0.08,
      noiseQ: 2.0,
    },
    dash: {
      noiseFreq: 1400,
      noiseTargetFreq: 500,
      noiseDuration: 0.18,
      noiseDecay: 0.18,
      noiseQ: 2.5,
    },
    slash_side: {
      noiseFreq: 2200,
      noiseTargetFreq: 1000,
      noiseDuration: 0.14,
      noiseDecay: 0.15,
    },
    slash_puff: {
      synthFreq: 220,
      synthTargetFreq: 90,
      synthDuration: 0.15,
      noiseFreq: 650,
      noiseDecay: 0.18,
      noiseQ: 1.2,
    },
  },
  boss: {
    telegraph: {
      frequency: 320,
      targetFrequency: 680,
      rampDuration: 0.35,
      decay: 0.12,
      oscillatorType: "sine" as BasicOscillatorType,
    },
    lunge: {
      frequency: 120,
      targetFrequency: 40,
      rampDuration: 0.45,
      decay: 0.5,
      oscillatorType: "sawtooth" as BasicOscillatorType,
    },
    swipe: {
      frequency: 180,
      targetFrequency: 50,
      rampDuration: 0.22,
      decay: 0.16,
      oscillatorType: "sawtooth" as BasicOscillatorType,
    },
    minion_spawn: {
      frequency: 180,
      targetFrequency: 720,
      rampDuration: 0.3,
      decay: 0.3,
      oscillatorType: "triangle" as BasicOscillatorType,
    },
    minion_deconstruct: {
      frequency: 280,
      targetFrequency: 60,
      rampDuration: 0.28,
      decay: 0.28,
      oscillatorType: "sawtooth" as BasicOscillatorType,
    },
    phase_shift: {
      frequency: 80,
      targetFrequency: 320,
      rampDuration: 0.8,
      decay: 0.8,
      oscillatorType: "sawtooth" as BasicOscillatorType,
    },
    spike_strike: {
      frequency: 1400,
      targetFrequency: 700,
      rampDuration: 0.12,
      decay: 0.12,
      oscillatorType: "square" as BasicOscillatorType,
    },
    hit_confirm: {
      metalNote: "C6",
      synthFreq: 880,
      synthDelay: 0.04,
    },
  },
  interface: {
    select_tick: {
      note1: 880,
      note2: 1250,
      delay: 0.025,
    },
    error_tick: {
      note1: 260,
      note2: 160,
      delay: 0.05,
    },
    menu_confirm: {
      startFreq: 440,
      targetFreq: 880,
      duration: 0.12,
    },
    menu_back: {
      startFreq: 587,
      targetFreq: 293,
      duration: 0.12,
    },
  },
};
