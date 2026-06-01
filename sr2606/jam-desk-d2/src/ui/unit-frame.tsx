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
      const destUnit = hostSystem.getUnitInstance(destUnitId);
      if (destUnit) {
        unit.outputPort.connectTo(destUnit.inputPort);
        return () => {
          unit.outputPort.disconnectFrom(destUnit.inputPort);
        };
      }
    }
  }, [destUnitId, unit]);

  return <div>{unit.render()}</div>;
};
