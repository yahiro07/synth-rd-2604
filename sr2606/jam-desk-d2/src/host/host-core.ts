import { UnitOutputPort } from "@/contract/unit-interfaces";
import { createOutputPortImpl } from "@/host/output-port";

const audioContext = new AudioContext();
export const gAudioContext = audioContext;

export function createOutputPort(): UnitOutputPort {
  return createOutputPortImpl(() => audioContext.createGain());
}
