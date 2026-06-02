import { seqNumbers } from "beams/ax/array-utils";
import { HostCallbacks, UnitInterface } from "@/contract/unit-interfaces";
import {
  createHsUnitOutputPort,
  gAudioContext,
} from "@/host-app/host/host-core";
import {
  HsUnitInputPort,
  HsUnitInputPortCallbacks,
  HsUnitInputPortPre,
  HsUnitInputPortPreHandlers,
  HsUnitInstance,
  HsUnitOutputPort,
} from "@/host-app/host/host-types";

export function createHsUnitInputPortPre(): HsUnitInputPortPre {
  const audioNode = gAudioContext.createGain();
  let handlers: HsUnitInputPortPreHandlers | undefined;
  let callbacks: HsUnitInputPortCallbacks | undefined;
  return {
    audioInput: { node: audioNode },
    setCallbacks(_callbacks: HsUnitInputPortCallbacks) {
      callbacks = _callbacks;
    },
    setHandlers(_handlers: HsUnitInputPortPreHandlers) {
      handlers = _handlers;
    },
    emit(): HsUnitInputPort {
      return {
        audioInput: { node: audioNode },
        ...handlers,
        callbacks: {
          onConnectedFrom(subPortTypes) {
            callbacks?.onConnectedFrom?.(subPortTypes);
          },
          onDisconnectFrom() {
            callbacks?.onDisconnectFrom?.();
          },
        },
      };
    },
  };
}

export function createUnitInterface(
  unitId: string,
  createdCallback: (unitInstance: HsUnitInstance) => void,
): UnitInterface {
  const audioContext = gAudioContext;
  const primaryOutputPort = createHsUnitOutputPort();
  const primaryInputPort = createHsUnitInputPortPre();
  let outputPorts: HsUnitOutputPort[] | undefined;
  let inputPorts: HsUnitInputPortPre[] | undefined;
  let hostCallbacks: HostCallbacks | undefined;
  return {
    audioContext,
    primaryOutputPort,
    primaryInputPort,
    createMultiChannelOutputPorts(numPorts: number) {
      outputPorts = seqNumbers(numPorts).map(() => createHsUnitOutputPort());
      return outputPorts;
    },
    createMultiChannelInputPorts(numPorts: number) {
      inputPorts = seqNumbers(numPorts).map(() => createHsUnitInputPortPre());
      return inputPorts;
    },
    setHostCallbacks(callbacks: HostCallbacks) {
      hostCallbacks = callbacks;
    },
    completeSetup() {
      createdCallback({
        unitId,
        outputPort: primaryOutputPort,
        inputPort: primaryInputPort.emit(),
        outputPorts,
        inputPorts: inputPorts?.map((port) => port.emit()),
        hostCallbacks,
      });
    },
  };
}
