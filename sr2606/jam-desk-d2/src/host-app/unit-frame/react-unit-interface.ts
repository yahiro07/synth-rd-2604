import { ReactNode } from "react";
import { UnitInterface } from "@/contract/unit-interfaces";
import { HsUnitInstance } from "@/host-app/host/host-types";
import { createUnitInterface } from "@/host-app/host/unit-interface-impl";

type PlainComponentFn = () => ReactNode;

export type ReactUnitTemplateFn = (unitInterface: UnitInterface) => {
  RenderUi: PlainComponentFn;
};

type ReactUnitInstance = HsUnitInstance & {
  RenderUi: PlainComponentFn;
};

export function instantiateReactUnit(
  templateFn: ReactUnitTemplateFn,
  unitId: string,
): ReactUnitInstance {
  let unitInstance: HsUnitInstance | undefined;
  const unitInterface = createUnitInterface(unitId, (instance) => {
    unitInstance = instance;
  });
  const { RenderUi } = templateFn(unitInterface);
  unitInterface.completeSetup();
  if (!unitInstance) {
    throw new Error("Unit instance was not created");
  }
  return {
    ...unitInstance,
    RenderUi,
  };
}
