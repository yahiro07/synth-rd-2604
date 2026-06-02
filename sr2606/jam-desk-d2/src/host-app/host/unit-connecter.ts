import {} from "@/contract/unit-interfaces";
import { hostSystem } from "@/host-app/host/host-system";
import { HsUnitInstance } from "@/host-app/host/host-types";

function connectUnitToDestPort(
  unit: HsUnitInstance,
  destSpec: string,
  outputPortIndex?: number,
) {
  const srcPort =
    outputPortIndex !== undefined
      ? unit.outputPorts?.[outputPortIndex]
      : unit.outputPort;

  const srcSpec =
    outputPortIndex !== undefined
      ? `${unit.unitId}.port${outputPortIndex}`
      : `${unit.unitId}`;

  let connected = false;
  let cleanupFromPort: (() => void) | undefined;

  const tryConnect = () => {
    if (connected) return true;
    const destPort = hostSystem.getConnectionTargetPort(destSpec);
    if (srcPort && destPort) {
      console.log(`connecting ${srcSpec} --> ${destSpec}`);
      srcPort.connectTo(destPort);
      connected = true;
      cleanupFromPort = () => {
        console.log(`disconnecting ${srcSpec} --> ${destSpec}`);
        srcPort.disconnectFrom(destPort);
      };
      return true;
    }
    return false;
  };

  tryConnect();

  const unsubscribe = hostSystem.onUnitRegistered((registeredUnitId) => {
    const destUnitId = destSpec.split(".")[0];
    if (destUnitId === registeredUnitId) {
      tryConnect();
    }
  });

  return () => {
    unsubscribe();
    cleanupFromPort?.();
  };
}

export function connectUnitToDestination(
  unit: HsUnitInstance,
  destSpec: string | string[],
) {
  if (Array.isArray(destSpec)) {
    const cleanupFns = destSpec.map((spec, i) =>
      connectUnitToDestPort(unit, spec, i),
    );
    return () => {
      cleanupFns.forEach((fn) => {
        fn?.();
      });
    };
  } else {
    return connectUnitToDestPort(unit, destSpec);
  }
}
