import { getAudioEngine, initAudioEngine } from "./audio/audio-engine";
import { setStore, store } from "./store";
import { setupMidiKeyboardInput } from "./utils/midi-keyboard-input";

const DEFAULT_NOTE = 57;

let animationFrameId: number | null = null;

function startAnalysisLoop(): void {
  if (animationFrameId !== null) return;
  function tick() {
    const engine = getAudioEngine();
    if (engine) {
      setStore("harmonics1", engine.f0AnalyzerNode.analyze());
      setStore("harmonics2", engine.f0ScriptProcessor.getHarmonics());
      setStore("spectrum", engine.generalSpectrum.getSpectrum());
    }
    animationFrameId = requestAnimationFrame(tick);
  }
  animationFrameId = requestAnimationFrame(tick);
}

export const appActions = {
  async initialize(): Promise<void> {
    const engine = await initAudioEngine();
    setStore("timbreNames", engine.timbreNames);
    setStore("initialized", true);

    setupMidiKeyboardInput({
      connectionStateCallback(connected) {
        setStore("midiConnected", connected);
      },
      noteOn(noteNumber, velocity) {
        appActions.noteOn(noteNumber, velocity);
      },
      noteOff(noteNumber) {
        appActions.noteOff(noteNumber);
      },
    });

    startAnalysisLoop();
  },

  noteOn(noteNumber: number, velocity = 0.8): void {
    const engine = getAudioEngine();
    if (!engine) return;
    if (engine.actx.state === "suspended") {
      void engine.actx.resume();
    }
    engine.setNoteNumber(noteNumber);
    engine.noteOn(noteNumber, velocity);
  },

  noteOff(noteNumber: number): void {
    getAudioEngine()?.noteOff(noteNumber);
  },

  nextTimbre(): void {
    const engine = getAudioEngine();
    if (!engine) return;
    const next = (store.timbreIndex + 1) % engine.timbreNames.length;
    setStore("timbreIndex", next);
    engine.setTimbre(next);
  },

  prevTimbre(): void {
    const engine = getAudioEngine();
    if (!engine) return;
    const prev =
      (store.timbreIndex - 1 + engine.timbreNames.length) %
      engine.timbreNames.length;
    setStore("timbreIndex", prev);
    engine.setTimbre(prev);
  },

  setTimbre(index: number): void {
    const engine = getAudioEngine();
    if (!engine) return;
    setStore("timbreIndex", index);
    engine.setTimbre(index);
  },

  get defaultNote(): number {
    return DEFAULT_NOTE;
  },
};
