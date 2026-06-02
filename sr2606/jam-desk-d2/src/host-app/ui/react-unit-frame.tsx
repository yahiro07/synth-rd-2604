/* <UnitFrame id="osc1" unitClassKey="osc" destUnitId="mixer1.ch0" />  */

import { useEffect, useMemo } from "react";
import { hostSystem } from "@/host-app/host/host-system";
import { UnitClassKey } from "@/host-app/react-units/units";
import { connectUnitToDestination } from "@/host-app/ui/unit-connecter";

export const ReactUnitFrame = ({
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
      return connectUnitToDestination(unit, destSpec);
    }
  }, [destSpec, unit]);

  return <div>{unit.RenderUi && <unit.RenderUi />}</div>;
};
