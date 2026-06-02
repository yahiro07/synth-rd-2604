/* <UnitFrame id="osc1" unitClassKey="osc" destUnitId="mixer1.ch0" />  */

import { useEffect, useMemo } from "react";
import { UnitInstanceInHostSide } from "@/contract/unit-interfaces";
import { hostSystem } from "@/host/host-system";
import { UnitClassKey } from "@/units/units";

function connectUnitToDestPort(
  unit: UnitInstanceInHostSide,
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

export const UnitFrame = ({
  unitId,
  unitClassKey,
  destSpec,
}: {
  unitId: string;
  unitClassKey: UnitClassKey;
  destSpec?: string | string[];
}) => {
  const unit = useMemo(
    () => hostSystem.createUnitInstance(unitClassKey, unitId),
    [unitClassKey, unitId],
  );

  useEffect(() => {
    if (destSpec) {
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
  }, [destSpec, unit]);

  return (
    <div>
      <unit.RenderUi />
    </div>
  );
};
