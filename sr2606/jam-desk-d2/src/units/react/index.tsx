import { createCvGateOscUnit } from "@/units/react/cv-gate-osc";
import { createKeyboardUnit } from "@/units/react/keyboard";
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
};
