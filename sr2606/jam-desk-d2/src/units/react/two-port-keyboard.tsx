import { ReactUnitTemplateFn } from "@/host-app/unit-frame/react-unit-interface";

export const createTwoPortsKeyboardUnit: ReactUnitTemplateFn = (
  unitInterface,
) => {
  const audioContext = unitInterface.audioContext;
  const outputPorts = unitInterface.createMultiChannelOutputPorts(2);

  if (0) {
    //debug
    outputPorts.forEach((port, i) => {
      port.setCallbacks({
        onConnectedTo(subPortTypes) {
          console.log(`twoPortKeyboard ch${i} connected to`, subPortTypes);
        },
      });
    });
  }

  const actions = {
    async noteOn(ch: number, note: number) {
      if (audioContext.state === "suspended") {
        await audioContext.resume();
        console.log("resumed");
      }
      outputPorts[ch].noteOutput.noteOn(note);
    },
    noteOff(ch: number, note: number) {
      outputPorts[ch].noteOutput.noteOff(note);
    },
  };
  return {
    RenderUi() {
      return (
        <div className="bg-gray-200 w-[200px] h-[100px] flex-c gap-6">
          <button
            type="button"
            onPointerDown={() => actions.noteOn(0, 48)}
            onPointerUp={() => actions.noteOff(0, 48)}
            className="cursor-pointer bg-white px-4 py-2"
          >
            C-1
          </button>
          <button
            type="button"
            onPointerDown={() => actions.noteOn(1, 72)}
            onPointerUp={() => actions.noteOff(1, 72)}
            className="cursor-pointer bg-white px-4 py-2"
          >
            C+1
          </button>
        </div>
      );
    },
  };
};
