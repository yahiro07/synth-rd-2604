import WebAudioTinySynth from "webaudio-tinysynth";
import {
  createF0AnalyzerNodeModule,
  F0AnalyzerNodeModule,
} from "./f0-analyzer-node";
import {
  createF0ScriptProcessorModule,
  F0ScriptProcessorModule,
} from "./f0-script-processor";
import {
  createGeneralSpectrumModule,
  GeneralSpectrumModule,
} from "./general-spectrum";

export type AudioEngine = {
  actx: AudioContext;
  timbreNames: string[];
  f0AnalyzerNode: F0AnalyzerNodeModule;
  f0ScriptProcessor: F0ScriptProcessorModule;
  generalSpectrum: GeneralSpectrumModule;
  noteOn(noteNumber: number, velocity?: number): void;
  noteOff(noteNumber: number): void;
  setTimbre(index: number): void;
  setNoteNumber(noteNumber: number): void;
};

let audioEngine: AudioEngine | undefined;

export async function initAudioEngine(): Promise<AudioEngine> {
  if (audioEngine) return audioEngine;

  const actx = new AudioContext();

  // Tap GainNode: synth output → tapGain → destination + analyzers
  const tapGain = actx.createGain();
  tapGain.connect(actx.destination);

  // Create analysis modules
  const f0AnalyzerNode = createF0AnalyzerNodeModule(actx);
  const f0ScriptProcessor = createF0ScriptProcessorModule(actx);
  const generalSpectrum = createGeneralSpectrumModule(actx);

  // Wire tapGain to all analysis modules
  tapGain.connect(f0AnalyzerNode.node);
  tapGain.connect(f0ScriptProcessor.scriptProcessorNode);
  tapGain.connect(generalSpectrum.node);

  // ScriptProcessor output (silenced) must reach the destination to stay active
  f0ScriptProcessor.silentGainNode.connect(actx.destination);

  // Create TinySynth using our AudioContext, routing output into tapGain
  const synth = new WebAudioTinySynth({ internalcontext: 0, useReverb: 1 });
  synth.setAudioContext(actx, tapGain);

  const timbreNames = synth.program.map((p) => p.name);

  audioEngine = {
    actx,
    timbreNames,
    f0AnalyzerNode,
    f0ScriptProcessor,
    generalSpectrum,

    noteOn(noteNumber, velocity = 0.8) {
      if (actx.state === "suspended") void actx.resume();
      synth.noteOn(0, noteNumber, Math.round(velocity * 127));
    },

    noteOff(noteNumber) {
      synth.noteOff(0, noteNumber);
    },

    setTimbre(index) {
      synth.setProgram(0, index);
    },

    setNoteNumber(noteNumber) {
      f0AnalyzerNode.setNoteNumber(noteNumber);
      f0ScriptProcessor.setNoteNumber(noteNumber);
    },
  };

  return audioEngine;
}

export function getAudioEngine(): AudioEngine | undefined {
  return audioEngine;
}
