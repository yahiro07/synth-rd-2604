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
    getConnectionTargetPort(destSpec: string): UnitInputPort | undefined {
      if (destSpec === "$output") {
        return audioDestinationUnitInputPort;
      }
      if (destSpec.includes(".")) {
        const [unitId, portName] = destSpec.split(".");
        const portIndex = parseInt(portName.replace("port", ""), 10);
        if (unitId && Number.isFinite(portIndex)) {
          const unit = units[unitId];
          return unit?.inputPorts?.[portIndex];
        }
      } else {
        const unit = units[destSpec];
        return unit?.inputPort;
      }
    },
  };
}
export const hostSystem = createHostSystem();
