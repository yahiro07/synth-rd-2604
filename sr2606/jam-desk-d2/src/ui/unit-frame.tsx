/* <UnitFrame id="osc1" unitClassKey="osc" destUnitId="mixer1.ch0" />  */

import { useEffect, useMemo } from "react";
import { hostSystem } from "@/host/host-system";
import { UnitClassKey } from "@/units/units";

export const UnitFrame = ({
  unitId,
  unitClassKey,
  destSpec,
}: {
  unitId: string;
  unitClassKey: UnitClassKey;
  destSpec?: string;
}) => {
  const unit = useMemo(
    () => hostSystem.createUnitInstance(unitClassKey, unitId),
    [unitClassKey, unitId],
  );

  useEffect(() => {
    if (destSpec) {
      const destPort = hostSystem.getConnectionTargetPort(destSpec);
      if (destPort) {
        console.log(`connecting ${unit.unitId} --> ${destSpec}`);
        unit.outputPort.connectTo(destPort);
        return () => {
          console.log(`disconnecting ${unit.unitId} --> ${destSpec}`);
          unit.outputPort.disconnectFrom(destPort);
        };
      }
    }
  }, [destSpec, unit]);

  return (
    <div>
      <unit.RenderUi />
    </div>
  );
};
