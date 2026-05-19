declare module "webaudio-tinysynth" {
  interface TinySynthOptions {
    internalcontext?: number;
    useReverb?: number;
    quality?: number;
    voices?: number;
    masterVol?: number;
    reverbLev?: number;
  }

  class WebAudioTinySynth {
    constructor(options?: TinySynthOptions);
    program: Array<{ name: string }>;
    setAudioContext(actx: AudioContext, dest?: AudioNode): void;
    getAudioContext(): AudioContext;
    noteOn(
      ch: number,
      noteNumber: number,
      velocity: number,
      time?: number,
    ): void;
    noteOff(ch: number, noteNumber: number, time?: number): void;
    setProgram(ch: number, prog: number): void;
    setMasterVol(v?: number): void;
    setQuality(v: number): void;
    send(msg: number[]): void;
    reset(): void;
  }

  export = WebAudioTinySynth;
}
