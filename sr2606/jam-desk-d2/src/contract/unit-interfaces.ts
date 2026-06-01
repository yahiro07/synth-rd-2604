import { ReactNode } from "react";

type NotePort = {
  noteOn(note: number, velocity?: number): void; //midi note number, velocity 0~1
  noteOff(note: number): void;
};

type CvGatePort = {
  setCv(cv: number): void; //0~1, 0.1cv/octave
  setGate(gate: boolean): void;
};

type ClockPort = {
  start?(): void;
  processTickRange?(tickFrom: number, tickTo: number): void; //480ppq based tick from song start
  step?(stepIndex: number): void; //4ppq step from song start
  stop?(): void;
};

type StatePort = {
  emitState?(): Record<string, any> | undefined;
  applyState?(state: Record<string, any>): void;
  emitStateBytes?(): Uint8Array | undefined;
  applyStateBytes?(bytes: Uint8Array): void;
};

type ParameterSpec = {
  id: string;
  steps: number; //2 for on/off, 3 for low/medium/high, etc
  //all parameters are ranged in 0~1
};

type ParametersPort = {
  getParameterSpecs(): ParameterSpec[];
  getParameterValue(id: string): number;
  setParameterValue(id: string, value: number): void;
};

type SamplerPadPort = {
  getToneIds(): string[];
  playTone(toneId: string): void;
};

type AudioPort = {
  node: AudioNode;
};

export type UnitInputPort = {
  audioInput?: AudioPort;
  noteInput?: NotePort;
  cvGateInput?: CvGatePort;
  clockInput?: ClockPort;
  stateInput?: StatePort;
  parametersInput?: ParametersPort;
  samplerPadInput?: SamplerPadPort;
};

export type UnitOutputPort = {
  audioOutput: AudioPort;
  noteOutput: NotePort;
  cvGateOutput: CvGatePort;
  clockOutput: ClockPort;
  stateOutput: StatePort;
  parametersOutput: ParametersPort;
  samplerPadOutput: SamplerPadPort;
};

export type UnitOutputPortInHostSide = UnitOutputPort & {
  connectTo(port: UnitInputPort): void;
  disconnectFrom(port: UnitInputPort): void;
};

export type UnitInstance = {
  outputPort: UnitOutputPort;
  inputPort: UnitInputPort;
  outputPorts?: UnitOutputPort[];
  inputPorts?: UnitInputPort[];
  render(): ReactNode;
};

export type UnitInstanceInHostSide = {
  // unitClassKey: string;
  unitId: string;
  outputPort: UnitOutputPortInHostSide;
  inputPort: UnitInputPort;
  outputPorts?: UnitOutputPort[];
  inputPorts?: UnitInputPort[];
  render(): ReactNode;
};

type OutputPortCreator = () => UnitOutputPortInHostSide;

export type UnitClassFn = (
  outputPortCreator: OutputPortCreator,
) => UnitInstance;

export type HostInterfaceForReact = {
  defineUnitClass(
    fn: (ac: AudioContext, createOutputPort: OutputPortCreator) => UnitInstance,
  ): void;
};

export type UnitInputPortC = {
  audioInput: AudioPort;
  setHandlers(handlers: {
    noteInput?: NotePort;
    cvGateInput?: CvGatePort;
    clockInput?: ClockPort;
    statInput?: StatePort;
  }): void;
};

export type MetaAttributes = {
  key?: string; //C, Am, ... etc
};

type HostCallbacks = {
  setBpm?(bpm: number): void;
  setPlayState?(playing: boolean): void;
  setMetaAttributes?(metaAttrs: MetaAttributes): void;
};

export type UnitInterfaceForIframe = {
  audioContext: AudioContext;
  // defaultOutputNode: AudioNode;
  // defaultInputNode: AudioNode;
  // audioDestinationNode: AudioNode;
  // audioSourceNode: AudioNode;
  primaryOutputPort: UnitOutputPort;
  primaryInputPort: UnitInputPortC;
  createMultiChannelOutputPorts(numChannels: number): UnitOutputPort[];
  createMultiChannelInputPorts(numChannels: number): UnitInputPortC[];
  // outputPort: UnitOutputPort & { channels(index: number): UnitOutputPort };
  // inputPort: UnitInputPortC & { channels(index: number): UnitInputPortC };
  // completeUnitRegistration(): void;
  // registerUnit(args: {
  //   // outputPort?: UnitOutputPort;
  //   // inputPort?: UnitInputPort;
  //   // multiChannelOutputPorts?: UnitOutputPort[];
  //   // multiChannelInputPorts?: UnitInputPortC[];
  // }): void;
  setHostCallbacks(callbacks: HostCallbacks): void;
  completeSetup(): void;
};
