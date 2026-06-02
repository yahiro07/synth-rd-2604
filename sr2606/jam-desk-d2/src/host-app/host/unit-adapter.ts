import { ReactNode } from "react";
import { HostCallbacks, SubPortType } from "@/contract/unit-interfaces";
import {
  createHsUnitOutputPort,
  gAudioContext,
} from "@/host-app/host/host-core";
import {
  HsUnitInputPort,
  HsUnitInstance,
  HsUnitOutputPort,
} from "@/host-app/host/host-types";

type UnitAdapter = {
  unitId: string;
  outputPort: HsUnitOutputPort;
  inputPort: HsUnitInputPort;
  outputPorts?: HsUnitOutputPort[];
  inputPorts?: HsUnitInputPort[];
  hostCallbacks?: HostCallbacks;
  RenderUi?: () => ReactNode;
  //
  mountUnitInstance(unitInstance: HsUnitInstance): () => void;
};

type AdapterOutputPort = HsUnitOutputPort & {
  mountOutputPort(port: HsUnitOutputPort | undefined): () => void;
};

function createAdapterOutputPort(): AdapterOutputPort {
  const pendingDestinations = new Set<HsUnitInputPort>();
  let mountedPort: HsUnitOutputPort | undefined;

  const connectMountedPort = (port: HsUnitOutputPort | undefined) => {
    pendingDestinations.forEach((destination) => port?.connectTo(destination));
  };

  return {
    ...createHsUnitOutputPort(),
    connectTo(port: HsUnitInputPort) {
      pendingDestinations.add(port);
      mountedPort?.connectTo(port);
    },
    disconnectFrom(port: HsUnitInputPort) {
      pendingDestinations.delete(port);
      mountedPort?.disconnectFrom(port);
    },
    mountOutputPort(port: HsUnitOutputPort | undefined) {
      if (mountedPort) {
        pendingDestinations.forEach((destination) => {
          mountedPort?.disconnectFrom(destination);
        });
      }
      mountedPort = port;
      connectMountedPort(mountedPort);
      return () => {
        if (mountedPort === port) {
          pendingDestinations.forEach((destination) => {
            mountedPort?.disconnectFrom(destination);
          });
          mountedPort = undefined;
        }
      };
    },
  };
}

function createAdapterInputPort(): HsUnitInputPort & {
  mountInputPort(port: HsUnitInputPort | undefined): () => void;
} {
  const audioInputNode = gAudioContext.createGain();
  let mountedPort: HsUnitInputPort | undefined;
  let connectedSubPortTypes: SubPortType[] | undefined;
  let connectedHasAudioOutput = false;
  const subPortTypeListeners = new Set<(subPortTypes: SubPortType[]) => void>();

  const connectMountedPort = (port: HsUnitInputPort | undefined) => {
    if (port?.audioInput) {
      audioInputNode.connect(port.audioInput.node);
    }
  };
  const getMountedSubPortTypes = (hasAudioOutput: boolean): SubPortType[] => {
    connectedHasAudioOutput = hasAudioOutput;
    if (!mountedPort) {
      return [];
    }
    if (mountedPort.getSubPortTypes) {
      return mountedPort.getSubPortTypes(hasAudioOutput);
    }
    return [
      hasAudioOutput && mountedPort.audioInput ? "audio" : undefined,
      mountedPort.noteInput ? "note" : undefined,
      mountedPort.cvGateInput ? "cvGate" : undefined,
      mountedPort.clockInput ? "clock" : undefined,
      mountedPort.stateInput ? "state" : undefined,
      mountedPort.automationInput ? "automation" : undefined,
      mountedPort.samplerPadInput ? "samplerPad" : undefined,
    ].filter((type): type is SubPortType => !!type);
  };

  return {
    audioInput: { node: audioInputNode },
    getSubPortTypes: getMountedSubPortTypes,
    subscribeSubPortTypes(listener) {
      subPortTypeListeners.add(listener);
      return () => {
        subPortTypeListeners.delete(listener);
      };
    },
    noteInput: {
      noteOn(note, velocity) {
        mountedPort?.noteInput?.noteOn(note, velocity);
      },
      noteOff(note) {
        mountedPort?.noteInput?.noteOff(note);
      },
    },
    cvGateInput: {
      setCv(cv) {
        mountedPort?.cvGateInput?.setCv(cv);
      },
      setGate(gate) {
        mountedPort?.cvGateInput?.setGate(gate);
      },
    },
    clockInput: {
      start() {
        mountedPort?.clockInput?.start?.();
      },
      processTickRange(tickFrom, tickTo) {
        mountedPort?.clockInput?.processTickRange?.(tickFrom, tickTo);
      },
      step(stepIndex) {
        mountedPort?.clockInput?.step?.(stepIndex);
      },
      stop() {
        mountedPort?.clockInput?.stop?.();
      },
    },
    stateInput: {
      emitState() {
        return mountedPort?.stateInput?.emitState?.();
      },
      applyState(state) {
        mountedPort?.stateInput?.applyState?.(state);
      },
      emitStateBytes() {
        return mountedPort?.stateInput?.emitStateBytes?.();
      },
      applyStateBytes(bytes) {
        mountedPort?.stateInput?.applyStateBytes?.(bytes);
      },
    },
    automationInput: {
      getParameterSpecs() {
        return mountedPort?.automationInput?.getParameterSpecs?.() ?? [];
      },
      getParameter(id) {
        return mountedPort?.automationInput?.getParameter?.(id) ?? 0;
      },
      setParameter(id, value) {
        mountedPort?.automationInput?.setParameter?.(id, value);
      },
    },
    samplerPadInput: {
      getToneIds() {
        return mountedPort?.samplerPadInput?.getToneIds?.() ?? [];
      },
      playTone(toneId) {
        mountedPort?.samplerPadInput?.playTone?.(toneId);
      },
    },
    callbacks: {
      onConnectedFrom(subPortTypes) {
        connectedSubPortTypes = subPortTypes;
        mountedPort?.callbacks?.onConnectedFrom?.(subPortTypes);
      },
      onDisconnectFrom() {
        connectedSubPortTypes = undefined;
        mountedPort?.callbacks?.onDisconnectFrom?.();
      },
    },
    mountInputPort(port: HsUnitInputPort | undefined) {
      if (mountedPort?.audioInput) {
        audioInputNode.disconnect(mountedPort.audioInput.node);
      }
      if (connectedSubPortTypes) {
        mountedPort?.callbacks?.onDisconnectFrom?.();
      }
      mountedPort = port;
      connectMountedPort(mountedPort);
      if (connectedSubPortTypes) {
        connectedSubPortTypes = getMountedSubPortTypes(connectedHasAudioOutput);
        subPortTypeListeners.forEach((listener) => {
          listener(connectedSubPortTypes!);
        });
        mountedPort?.callbacks?.onConnectedFrom?.(connectedSubPortTypes);
      }
      return () => {
        if (mountedPort === port) {
          if (mountedPort?.audioInput) {
            audioInputNode.disconnect(mountedPort.audioInput.node);
          }
          if (connectedSubPortTypes) {
            mountedPort?.callbacks?.onDisconnectFrom?.();
            subPortTypeListeners.forEach((listener) => {
              listener([]);
            });
          }
          mountedPort = undefined;
        }
      };
    },
  };
}

function createPortArray<T>(createPort: (index: number) => T): T[] {
  const ports: T[] = [];
  return new Proxy(ports, {
    get(target, prop, receiver) {
      if (typeof prop === "string" && /^\d+$/.test(prop)) {
        const index = Number(prop);
        target[index] ??= createPort(index);
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

export function createUnitAdapter(unitId: string): UnitAdapter {
  const outputPort = createAdapterOutputPort();
  const inputPort = createAdapterInputPort();
  let unitInstance: HsUnitInstance | null = null;
  const outputPortCleanups: Array<(() => void) | undefined> = [];
  const inputPortCleanups: Array<(() => void) | undefined> = [];
  const outputPorts = createPortArray((index) => {
    const port = createAdapterOutputPort();
    outputPortCleanups[index] = port.mountOutputPort(
      unitInstance?.outputPorts?.[index],
    );
    return port;
  });
  const inputPorts = createPortArray((index) => {
    const port = createAdapterInputPort();
    inputPortCleanups[index] = port.mountInputPort(
      unitInstance?.inputPorts?.[index],
    );
    return port;
  });
  return {
    unitId,
    outputPort,
    inputPort,
    outputPorts,
    inputPorts,
    get hostCallbacks() {
      return unitInstance?.hostCallbacks;
    },
    get RenderUi() {
      return unitInstance?.RenderUi;
    },
    mountUnitInstance(instance: HsUnitInstance) {
      const cleanupFns = [
        outputPort.mountOutputPort(instance.outputPort),
        inputPort.mountInputPort(instance.inputPort),
      ];
      outputPorts.forEach((port, index) => {
        outputPortCleanups[index]?.();
        outputPortCleanups[index] = port.mountOutputPort(
          instance.outputPorts?.[index],
        );
      });
      inputPorts.forEach((port, index) => {
        inputPortCleanups[index]?.();
        inputPortCleanups[index] = port.mountInputPort(
          instance.inputPorts?.[index],
        );
      });
      unitInstance = instance;
      return () => {
        if (unitInstance === instance) {
          cleanupFns.forEach((cleanup) => cleanup());
          outputPortCleanups.forEach((cleanup) => cleanup?.());
          inputPortCleanups.forEach((cleanup) => cleanup?.());
          outputPortCleanups.length = 0;
          inputPortCleanups.length = 0;
          unitInstance = null;
        }
      };
    },
  };
}
