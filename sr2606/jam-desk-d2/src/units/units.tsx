import { UnitInstance } from "@/contract/unit-interfaces";
import { createOutputPort } from "@/host/host-core";

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

export const unitFactories = {
  osc: createOscUnit,
};

export type UnitClassKey = keyof typeof unitFactories;
