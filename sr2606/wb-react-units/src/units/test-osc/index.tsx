import { createStore } from "snap-store";
import { ReactUnitTemplateFn } from "wafer-host/react";

function midiNoteToFrequency(noteNumber: number) {
  return 440 * Math.pow(2, (noteNumber - 69) / 12);
}

export const createTestOscUnit: ReactUnitTemplateFn = (unitInterface) => {
  const audioContext = unitInterface.audioContext;

  const noteOscs = new Map<number, OscillatorNode>();

  const store = createStore({
    activeNoteNumbers: 0,
  });

  unitInterface.completeSetup({
    unitAspects: {
      unitType: "instrument",
      outputs: ["audio"],
      inputs: ["note"],
    },
    noteInput: {
      noteOn(noteNumber, timeAt) {
        const osc = audioContext.createOscillator();
        const freq = midiNoteToFrequency(noteNumber);
        osc.type = "sawtooth";
        osc.frequency.value = freq;
        osc.connect(unitInterface.audioOutputNode);
        osc.start(timeAt);
        noteOscs.set(noteNumber, osc);
        store.setActiveNoteNumbers(noteOscs.size);
      },
      noteOff(noteNumber, timeAt) {
        const osc = noteOscs.get(noteNumber);
        if (!osc) return;
        osc.stop(timeAt);
        noteOscs.delete(noteNumber);
        store.setActiveNoteNumbers(noteOscs.size);
      },
    },
  });

  return {
    RenderUi() {
      const { activeNoteNumbers } = store.useSnapshot();
      return (
        <div className="w-[400px] h-[100px] bg-gray-200 flex-vc gap-2">
          <div>test osc </div>
          <div>{activeNoteNumbers} notes active</div>
        </div>
      );
    },
  };
};
