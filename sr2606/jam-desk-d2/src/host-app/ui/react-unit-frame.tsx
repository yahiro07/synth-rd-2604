/* <UnitFrame id="osc1" unitClassKey="osc" destUnitId="mixer1.ch0" />  */

import { useEffect, useMemo } from "react";
import { hostSystem } from "@/host-app/host/host-system";
import {
  instantiateReactUnit,
  ReactUnitTemplateFn,
} from "@/host-app/react-units/react-unit-interface";
import { connectUnitToDestination } from "@/host-app/ui/unit-connecter";
import { UnitIdsBox } from "@/host-app/ui/unit-ids-box";

export const ReactUnitFrame = ({
  unitId,
  unitTemplateFn,
  destSpec,
}: {
  unitId: string;
  unitTemplateFn: ReactUnitTemplateFn;
  destSpec?: string | string[];
}) => {
  const unit = useMemo(
    () => instantiateReactUnit(unitTemplateFn, unitId),
    [unitTemplateFn, unitId],
  );
  useEffect(() => {
    return hostSystem.registerUnitInstance(unit);
  }, [unit]);

  useEffect(() => {
    if (destSpec) {
      return connectUnitToDestination(unit, destSpec);
    }
  }, [destSpec, unit]);

  return (
    <UnitIdsBox unitId={unitId} destSpec={destSpec}>
      {unit.RenderUi && <unit.RenderUi />}
    </UnitIdsBox>
  );
};
