import { createCvGateOscUnit } from "@/units/react/cv-gate-osc";
import { createCvGateStepSequencerUnit } from "@/units/react/cv-gate-step-sequencer";
import { createKeyboardUnit } from "@/units/react/keyboard";
import { createMasterClockUnit } from "@/units/react/master-clock";
import { createMixerUnit } from "@/units/react/mixer";
import { createOscUnit } from "@/units/react/oscillator";
import { createParametersControllerUnit } from "@/units/react/parameters-controller-unit";
import { createStateSwitcherUnit } from "@/units/react/state-switcher";
import { createTwoPortsKeyboardUnit } from "@/units/react/two-port-keyboard";

export const reactUnitFactories = {
  osc: createOscUnit,
  keyboard: createKeyboardUnit,
  mixer: createMixerUnit,
  twoPortsKeyboard: createTwoPortsKeyboardUnit,
  parametersController: createParametersControllerUnit,
  stateSwitcher: createStateSwitcherUnit,
  cvGateOsc: createCvGateOscUnit,
  cvGateStepSequencer: createCvGateStepSequencerUnit,
  masterClock: createMasterClockUnit,
};
