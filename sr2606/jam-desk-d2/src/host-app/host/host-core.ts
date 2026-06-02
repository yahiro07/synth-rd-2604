import { createOutputPortImpl } from "@/host-app/host/output-port";
import { UnitOutputPortInHostSide } from "@/shared/contract/unit-interfaces";

const audioContext = new AudioContext();
export const gAudioContext = audioContext;

export function createOutputPort(): UnitOutputPortInHostSide {
  return createOutputPortImpl(() => audioContext.createGain());
}
