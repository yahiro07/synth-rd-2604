import { createKeyboardUnit } from "@/units/react/keyboard";
import { createMixerUnit } from "@/units/react/mixer";
import { createOscUnit } from "@/units/react/oscillator";
import { createTwoPortsKeyboardUnit } from "@/units/react/two-port-keyboard";

export const reactUnitFactories = {
  osc: createOscUnit,
  keyboard: createKeyboardUnit,
  mixer: createMixerUnit,
  twoPortsKeyboard: createTwoPortsKeyboardUnit,
};
