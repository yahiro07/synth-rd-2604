import { Knob, UpperLabel } from "mofur-components/mono2";
import { createStore } from "snap-store";
import { ReactUnitTemplateFn } from "wafer-host/react";

export const createUnit1: ReactUnitTemplateFn = (unitInterface) => {
  const store = createStore({
    octaveShift: 0,
  });

  const ModNoteMap = new Map<number, number>();

  unitInterface.completeSetup({
    unitAspects: {
      unitType: "sequencer",
      outputs: ["note"],
      inputs: ["note"],
    },
    noteInput: {
      noteOn(note, timeAt, velocity) {
        const modNote = note + store.state.octaveShift * 12;
        unitInterface.noteOutputPort.noteOn(modNote, timeAt, velocity);
        ModNoteMap.set(note, modNote);
      },
      noteOff(note, timeAt) {
        const modNote = ModNoteMap.get(note);
        if (!modNote) return;
        unitInterface.noteOutputPort.noteOff(modNote, timeAt);
        ModNoteMap.delete(note);
      },
    },
  });
  return {
    RenderUi() {
      const st = store.useSnapshot();
      return (
        <div className="w-[400px] h-[200px] bg-gray-200 p-2 flex-c">
          <div>
            <UpperLabel label="octave">
              <Knob
                value={st.octaveShift}
                min={-2}
                max={2}
                step={1}
                onChange={store.setOctaveShift}
              />
            </UpperLabel>
          </div>
        </div>
      );
    },
  };
};
