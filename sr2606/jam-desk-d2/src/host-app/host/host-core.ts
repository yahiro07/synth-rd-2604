import { HsUnitOutputPort } from "@/host-app/host/host-types";
import { createHsUnitOutputPortImpl } from "@/host-app/host/output-port";

const audioContext = new AudioContext();
export const gAudioContext = audioContext;

export function createHsUnitOutputPort(): HsUnitOutputPort {
  return createHsUnitOutputPortImpl(() => audioContext.createGain());
}
