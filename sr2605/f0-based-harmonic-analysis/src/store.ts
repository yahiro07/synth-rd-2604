import { createStore } from "solid-js/store";

export type AppStore = {
  initialized: boolean;
  timbreIndex: number;
  timbreNames: string[];
  harmonics1: number[]; // F0 AnalyzerNode-based (128 values, harmonic 1–128)
  harmonics2: number[]; // F0 ScriptProcessor-based (128 values, harmonic 1–128)
  spectrum: number[]; // General spectrum (512 values)
  midiConnected: boolean;
};

export const [store, setStore] = createStore<AppStore>({
  initialized: false,
  timbreIndex: 0,
  timbreNames: [],
  harmonics1: new Array(128).fill(0),
  harmonics2: new Array(128).fill(0),
  spectrum: new Array(512).fill(0),
  midiConnected: false,
});
