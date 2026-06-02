import { gAudioContext } from "@/host-app/host/host-core";
import { HsUnitInputPort, HsUnitInstance } from "@/host-app/host/host-types";
import { UnitClassKey, unitFactories } from "@/host-app/react-units/units";

function createHostSystem() {
  const units: Record<string, HsUnitInstance> = {};

  const audioDestinationUnitInputPort: HsUnitInputPort = {
    audioInput: {
      node: gAudioContext.destination,
    },
  };

  return {
    createUnitInstance(
      unitClassKey: UnitClassKey,
      unitId: string,
    ): HsUnitInstance {
      const factory = unitFactories[unitClassKey];
      const tmpUnit = factory();
      const unit = {
        ...tmpUnit,
        unitId,
      } as HsUnitInstance;
      units[unitId] = unit;
      return unit;
    },
    getUnitInstance(unitId: string) {
      return units[unitId];
    },
    registerUnitInstance(unit: HsUnitInstance) {
      units[unit.unitId] = unit;
      return () => {
        if (units[unit.unitId] === unit) {
          delete units[unit.unitId];
        }
      };
    },
    getConnectionTargetPort(destSpec: string): HsUnitInputPort | undefined {
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
