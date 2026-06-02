import { seqNumbers } from "beams/ax/array-utils";
import { createOutputPort, gAudioContext } from "@/host-app/host/host-core";
import {
  HostCallbacks,
  UnitInputPort,
  UnitInputPortC,
  UnitInputPortCHandlers,
  UnitInstanceInHostSide,
  UnitInterfaceForIframe,
  UnitOutputPortInHostSide,
} from "@/shared/contract/unit-interfaces";

type UnitInputPortCInHostSide = UnitInputPortC & {
  emit(): UnitInputPort;
};

function createInputPortC(): UnitInputPortCInHostSide {
  const audioNode = gAudioContext.createGain();
  let handlers: UnitInputPortCHandlers | undefined;
  return {
    audioInput: { node: audioNode },
    setHandlers(_handlers: UnitInputPortCHandlers) {
      handlers = _handlers;
    },
    emit(): UnitInputPort {
      return {
        audioInput: { node: audioNode },
        ...handlers,
      };
    },
  };
}

export function createUnitInterfaceForIframe(
  unitId: string,
  createdCallback: (unitInstance: UnitInstanceInHostSide) => void,
): UnitInterfaceForIframe {
  const audioContext = gAudioContext;
  const primaryOutputPort = createOutputPort();
  const primaryInputPort = createInputPortC();
  let outputPorts: UnitOutputPortInHostSide[] | undefined;
  let inputPorts: UnitInputPortCInHostSide[] | undefined;
  let hostCallbacks: HostCallbacks | undefined;
  return {
    audioContext,
    primaryOutputPort,
    primaryInputPort,
    createMultiChannelOutputPorts(numPorts: number) {
      outputPorts = seqNumbers(numPorts).map(() => createOutputPort());
      return outputPorts;
    },
    createMultiChannelInputPorts(numPorts: number) {
      inputPorts = seqNumbers(numPorts).map(() => createInputPortC());
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
