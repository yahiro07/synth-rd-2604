export type SubPortType =
  | "audio"
  | "note"
  | "cvGate"
  | "clock"
  | "state"
  | "automation"
  | "samplerPad";

export type NotePort = {
  noteOn(note: number, velocity?: number): void; //midi note number, velocity 0~1
  noteOff(note: number): void;
};

export type CvGatePort = {
  setCv(cv: number): void; //0~1, 0.1cv/octave
  setGate(gate: boolean): void;
};

export type ClockPort = {
  start?(): void;
  processTickRange?(tickFrom: number, tickTo: number): void; //480ppq based tick from song start
  step?(stepIndex: number): void; //4ppq step from song start
  stop?(): void;
};

export type StatePort = {
  emitState?(): Record<string, any> | undefined;
  applyState?(state: Record<string, any>): void;
  emitStateBytes?(): Uint8Array | undefined;
  applyStateBytes?(bytes: Uint8Array): void;
};

export type ParameterSpec = {
  id: string;
  steps?: number; //2 for on/off, 3 for low/medium/high, etc
  //all parameters are ranged in 0~1
};

export type AutomationPort = {
  getParameterSpecs(): ParameterSpec[];
  getParameter(id: string): number;
  setParameter(id: string, value: number): void;
};

export type SamplerPadPort = {
  getToneIds(): string[];
  playTone(toneId: string): void;
};

export type AudioPort = {
  node: AudioNode;
};

export type UnitOutputPort = {
  setCallbacks(callbacks: {
    onConnectedTo?(subPortTypes: SubPortType[]): void;
    onDisconnectTo?(): void;
  }): void;
  audioOutput: AudioPort;
  noteOutput: NotePort;
  cvGateOutput: CvGatePort;
  clockOutput: ClockPort;
  stateOutput: StatePort;
  automationOutput: AutomationPort;
  samplerPadOutput: SamplerPadPort;
};

export type UnitInputPort = {
  audioInput: AudioPort;
  setCallbacks(callbacks: {
    onConnectedFrom?(subPortTypes: SubPortType[]): void;
    onDisconnectFrom?(): void;
  }): void;
  setHandlers(handlers: {
    noteInput?: NotePort;
    cvGateInput?: CvGatePort;
    clockInput?: ClockPort;
    stateInput?: StatePort;
    automationInput?: AutomationPort;
    samplerPadInput?: SamplerPadPort;
  }): void;
};

export type MetaAttributes = {
  key?: string; //C, Am, ... etc
};

export type HostCallbacks = {
  setBpm?(bpm: number): void;
  setPlayState?(playing: boolean): void;
  setMetaAttributes?(metaAttrs: MetaAttributes): void;
};

export type UnitInterface = {
  audioContext: AudioContext;
  primaryOutputPort: UnitOutputPort;
  primaryInputPort: UnitInputPort;
  createMultiChannelOutputPorts(numPorts: number): UnitOutputPort[];
  createMultiChannelInputPorts(numPorts: number): UnitInputPort[];
  setHostCallbacks(callbacks: HostCallbacks): void;
  completeSetup(): void;
};
