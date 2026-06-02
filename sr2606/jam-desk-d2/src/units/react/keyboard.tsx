import { ReactUnitTemplateFn } from "@/host-app/unit-frame/react-unit-interface";

export const createKeyboardUnit: ReactUnitTemplateFn = (unitInterface) => {
  const audioContext = unitInterface.audioContext;
  const outputPort = unitInterface.primaryOutputPort;
  const actions = {
    async noteOn(note: number) {
      if (audioContext.state === "suspended") {
        await audioContext.resume();
        console.log("resumed");
      }
      outputPort.noteOutput.noteOn(note);
    },
    noteOff(note: number) {
      outputPort.noteOutput.noteOff(note);
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
