import { createOutputPort, gAudioContext } from "@/base/host-core";
import {
  UnitInputPort,
  UnitInstance,
  UnitInstanceInHostSide,
} from "@/base/unit-interfaces";

function createOscUnit(): UnitInstance {
  const outputPort = createOutputPort();
  return {
    outputPort,
    inputPort: {
      noteInput: {
        noteOn(note) {
          console.log("note on", note);
        },
        noteOff(note) {
          console.log("note off", note);
        },
      },
    },
    render() {
      return <div>Oscillator Unit</div>;
    },
  };
}

const unitFactories = {
  osc: createOscUnit,
};

export type UnitClassKey = keyof typeof unitFactories;

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
      const unit = { ...factory(), unitId };
      units[unitClassKey] = unit;
      return unit;
    },
    getUnitInstance(unitId: string) {
      return units[unitId];
    },
    getConnectionTargetNode(destUnitId: string): UnitInputPort {
      if (destUnitId === "$output") {
        return audioDestinationUnitInputPort;
      }
      return units[destUnitId].inputPort;
    },
  };
}
export const hostSystem = createHostSystem();
