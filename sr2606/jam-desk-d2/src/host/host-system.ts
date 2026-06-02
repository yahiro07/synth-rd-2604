import {
  UnitInputPort,
  UnitInstanceInHostSide,
} from "@/contract/unit-interfaces";
import { gAudioContext } from "@/host/host-core";
import { UnitClassKey, unitFactories } from "@/units/units";

function createHostSystem() {
  const units: Record<string, UnitInstanceInHostSide> = {};

  const audioDestinationUnitInputPort: UnitInputPort = {
    audioInput: {
      node: gAudioContext.destination,
    },
  };

  return {
    createUnitInstance(
      unitClassKey: UnitClassKey,
      unitId: string,
    ): UnitInstanceInHostSide {
      const factory = unitFactories[unitClassKey];
      const tmpUnit = factory();
      const unit = {
        ...tmpUnit,
        unitId,
      } as UnitInstanceInHostSide;
      units[unitId] = unit;
      return unit;
    },
    getUnitInstance(unitId: string) {
      return units[unitId];
    },
    getConnectionTargetPort(destUnitId: string): UnitInputPort | undefined {
      if (destUnitId === "$output") {
        return audioDestinationUnitInputPort;
      }
      return units[destUnitId]?.inputPort;
    },
  };
}
export const hostSystem = createHostSystem();
