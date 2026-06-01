import { ReactNode } from "react";

type NotePort = {
  noteOn(note: number): void; //midi note number
  noteOff(note: number): void;
};

type CvGatePort = {
  setCv(cv: number): void; //0~1, 0.1cv/octave
  setGate(gate: boolean): void;
};

type ClockPort = {
  start?(): void;
  step?(stepIndex: number): void; //4ppq
  stop?(): void;
};

type StatePort = {
  emitState(): Record<string, any>;
  applyState(state: Record<string, any>): void;
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
};

export type UnitOutputPort = {
  audioOutput: AudioPort;
  noteOutput: NotePort;
  cvGateOutput: CvGatePort;
  clockOutput: ClockPort;
  stateOutput: StatePort;
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
  completeSetup(): void;
};
