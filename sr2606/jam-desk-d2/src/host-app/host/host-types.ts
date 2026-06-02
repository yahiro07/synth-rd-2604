import { ReactNode } from "react";
import {
  AudioPort,
  ClockPort,
  CvGatePort,
  HostCallbacks,
  NotePort,
  ParametersPort,
  SamplerPadPort,
  StatePort,
  UnitInputPort,
  UnitOutputPort,
} from "@/contract/unit-interfaces";

export type HsUnitInputPortPreHandlers = {
  noteInput?: NotePort;
  cvGateInput?: CvGatePort;
  clockInput?: ClockPort;
  stateInput?: StatePort;
  parametersInput?: ParametersPort;
  samplerPadInput?: SamplerPadPort;
};

export type HsUnitInputPortPre = UnitInputPort & {
  emit(): HsUnitInputPort;
};

export type HsUnitInputPort = {
  audioInput?: AudioPort;
  noteInput?: NotePort;
  cvGateInput?: CvGatePort;
  clockInput?: ClockPort;
  stateInput?: StatePort;
  parametersInput?: ParametersPort;
  samplerPadInput?: SamplerPadPort;
};

export type HsUnitOutputPort = UnitOutputPort & {
  connectTo(port: HsUnitInputPort): void;
  disconnectFrom(port: HsUnitInputPort): void;
};

export type HsUnitInstance = {
  unitId: string;
  outputPort: HsUnitOutputPort;
  inputPort: HsUnitInputPort;
  outputPorts?: HsUnitOutputPort[];
  inputPorts?: HsUnitInputPort[];
  hostCallbacks?: HostCallbacks;
  RenderUi?: () => ReactNode;
};
