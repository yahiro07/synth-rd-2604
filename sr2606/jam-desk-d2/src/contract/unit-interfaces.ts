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
  reset(): void;
  onStep(fn: () => void): void; //4ppq
};

type SwitcherPort = {
  emitState(): Record<string, any>;
  applyState(state: Record<string, any>): void;
};

type AudioPort = {
  node: AudioNode;
};

export type UnitInputPort = {
  noteInput?: NotePort;
  cvGateInput?: CvGatePort;
  clockInput?: ClockPort;
  switcherInput?: SwitcherPort;
  audioInput?: AudioPort;
};

export type UnitOutputPort = {
  connectTo(port: UnitInputPort): void;
  disconnectFrom(port: UnitInputPort): void;
  noteOutput: NotePort;
  cvGateOutput: CvGatePort;
  clockOutput: ClockPort;
  switcherOutput: SwitcherPort;
  audioOutput: AudioPort;
};

export type UnitInstance = {
  // unitId: string;
  // unitClassKey: string;
  outputPort: UnitOutputPort;
  inputPort: UnitInputPort;
  multiChannelOutputs?: {
    numChannels: number;
    channelPorts: UnitOutputPort[];
  };
  multiChannelInputs?: {
    numChannels: number;
    channelPorts: UnitInputPort[];
  };
  render(): ReactNode;
};

export type UnitInstanceInHostSide = UnitInstance & {
  unitId: string;
};

type OutputPortCreator = () => UnitOutputPort;

export type UnitClassFn = (
  outputPortCreator: OutputPortCreator,
) => UnitInstance;

export type HostInterfaceRaw = {
  defineUnitClass(
    fn: (ac: AudioContext, createOutputPort: OutputPortCreator) => UnitInstance,
  ): void;
};

export type HostInterfaceForIframe = {
  raw: HostInterfaceRaw;
  audioContext: AudioContext;
  audioDestinationNode: AudioNode;
  audioSourceNode: AudioNode;
  createOutputPort(): UnitOutputPort;
  defineUnit(args: {
    inputPort: {
      noteInput?: NotePort;
      cvGateInput?: CvGatePort;
      clockInput?: ClockPort;
      switcherInput?: SwitcherPort;
    };
    multiChannelOutputs?: {
      numChannels: number;
      channelPorts: UnitOutputPort[];
    };
    multiChannelInputs?: {
      numChannels: number;
      channelPorts: UnitInputPort[];
    };
  }): void;
};
