/* <UnitFrame id="osc1" unitClassKey="osc" destUnitId="mixer1.ch0" />  */

import { useEffect, useMemo } from "react";
import { hostSystem } from "@/host/host-system";
import { UnitClassKey } from "@/units/units";

export const UnitFrame = ({
  unitId,
  unitClassKey,
  destUnitId,
}: {
  unitId: string;
  unitClassKey: UnitClassKey;
  destUnitId?: string;
}) => {
  const unit = useMemo(
    () => hostSystem.createUnitInstance(unitClassKey, unitId),
    [unitClassKey, unitId],
  );

  useEffect(() => {
    if (destUnitId) {
      const destPort = hostSystem.getConnectionTargetPort(destUnitId);
      if (destPort) {
        console.log(`Connecting ${unit.unitId} --> ${destUnitId}`);
        unit.outputPort.connectTo(destPort);
        return () => {
          unit.outputPort.disconnectFrom(destPort);
        };
      }
    }
  }, [destUnitId, unit]);

  return <div>{unit.render()}</div>;
};
