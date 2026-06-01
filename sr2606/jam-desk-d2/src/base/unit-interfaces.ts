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
  connectAudioFrom(node: AudioNode): void;
  disconnectAudioFrom(node: AudioNode): void;
};

export type UnitInputPort = {
  handlers: {
    noteInput?: NotePort;
    cvGateInput?: CvGatePort;
    clockInput?: ClockPort;
    switcherInput?: SwitcherPort;
    audioInput?: AudioPort;
  };
};

export type UnitOutputPort = {
  connectTo(port: UnitInputPort): void;
  disconnectFrom(port: UnitInputPort): void;
  proxies: {
    noteOutput: NotePort;
    cvGateOutput: CvGatePort;
    clockOutput: ClockPort;
    switcherOutput: SwitcherPort;
    audioOutput: AudioPort;
  };
};

export type UnitInstance = {
  unitId: string;
  unitClassKey: string;
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

export type UnitClassFn = (
  outputPortCreator: (withAudio?: boolean) => UnitOutputPort,
) => UnitInstance;

/*
expected react wrapper usage
<UnitFrame id="mixer1" unitClassKey="mixer" destUnitId="$output">
<UnitFrame id="osc1" unitClassKey="osc" destUnitId="mixer1.ch0" />  //connect to multi input
<UnitFrame id="seq1" unitClassKey="seq" destUnitId="osc1" />
<UnitFrame id="osc2" unitClassKey="osc" destUnitId="mixer1.ch1" />  //connect to multi input
<UnitFrame id="seq2" unitClassKey="seq" destUnitId="osc1" />
<UnitFrame id="clocker1" unitClassKey="clocker" destUnitId={{ ch0: "seq1", ch1: "seq2" }} />  //connect from multi output
*/
