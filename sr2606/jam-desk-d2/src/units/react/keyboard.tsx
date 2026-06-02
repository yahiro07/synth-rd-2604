import { ReactUnitTemplateFn } from "@/host-app/unit-frame/react-unit-interface";

const cvBaseFrequency = 20;
const cvPerOctave = 0.1;

function midiToFrequency(note: number): number {
  return 440 * 2 ** ((note - 69) / 12);
}

function noteToCv(note: number): number {
  return Math.min(
    1,
    Math.max(
      0,
      Math.log2(midiToFrequency(note) / cvBaseFrequency) * cvPerOctave,
    ),
  );
}

export const createKeyboardUnit: ReactUnitTemplateFn = (unitInterface) => {
  const audioContext = unitInterface.audioContext;
  const outputPort = unitInterface.primaryOutputPort;
  let cvGateMode = false;
  const activeNotes = new Set<number>();

  outputPort.setCallbacks({
    onConnectedTo(subPortTypes) {
      cvGateMode = subPortTypes.includes("cvGate");
    },
    onDisconnectTo() {
      activeNotes.clear();
    },
  });

  const actions = {
    async noteOn(note: number) {
      if (audioContext.state === "suspended") {
        await audioContext.resume();
        console.log("resumed");
      }
      if (cvGateMode) {
        activeNotes.add(note);
        outputPort.cvGateOutput.setCv(noteToCv(note));
        outputPort.cvGateOutput.setGate(true);
      } else {
        outputPort.noteOutput.noteOn(note);
      }
    },
    noteOff(note: number) {
      if (cvGateMode) {
        activeNotes.delete(note);
        const nextNote = Array.from(activeNotes).at(-1);
        if (nextNote === undefined) {
          outputPort.cvGateOutput.setGate(false);
        } else {
          outputPort.cvGateOutput.setCv(noteToCv(nextNote));
        }
      } else {
        outputPort.noteOutput.noteOff(note);
      }
    },
  };
  return {
    RenderUi() {
      return (
        <div className="bg-gray-200 w-[200px] h-[100px] flex-c gap-2">
          <button
            type="button"
            onPointerDown={() => actions.noteOn(57)}
            onPointerUp={() => actions.noteOff(57)}
            className="cursor-pointer bg-white px-4 py-2"
          >
            A
          </button>
          <button
            type="button"
            onPointerDown={() => actions.noteOn(60)}
            onPointerUp={() => actions.noteOff(60)}
            className="cursor-pointer bg-white px-4 py-2"
          >
            C
          </button>
        </div>
      );
    },
  };
};
