import { createOutputPortImpl } from "@/host-app/host/output-port";
import { UnitOutputPort } from "@/shared/contract/unit-interfaces";

const audioContext = new AudioContext();
export const gAudioContext = audioContext;

export function createOutputPort(): UnitOutputPort {
  return createOutputPortImpl(() => audioContext.createGain());
}
