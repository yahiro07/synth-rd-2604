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
  const destPort = hostSystem.getConnectionTargetPort(destSpec);
  if (srcPort && destPort) {
    const srcSpec =
      outputPortIndex !== undefined
        ? `${unit.unitId}.port${outputPortIndex}`
        : `${unit.unitId}`;
    console.log(`connecting ${srcSpec} --> ${destSpec}`);
    srcPort.connectTo(destPort);
    return () => {
      console.log(`disconnecting ${srcSpec} --> ${destSpec}`);
      srcPort.disconnectFrom(destPort);
    };
  }
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
