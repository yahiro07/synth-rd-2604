import { UnitInstance } from "@/contract/unit-interfaces";
import { createOutputPort, gAudioContext } from "@/host/host-core";

function createOscUnit(): UnitInstance {
  const audioContext = gAudioContext;
  const outputPort = createOutputPort();
  const destinationNode = outputPort.audioOutput.node;

  function midiToFrequency(midiNote: number): number {
    return 440 * 2 ** ((midiNote - 69) / 12);
  }
  const oscNodes: Record<number, OscillatorNode> = {};

  const core = {
    noteOn(noteNumber: number) {
      console.log("note on", noteNumber);
      const freq = midiToFrequency(noteNumber);
      const oscillatorNode = audioContext.createOscillator();
      oscillatorNode.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillatorNode.type = "sawtooth";
      oscillatorNode.connect(destinationNode);
      oscillatorNode.start();
      oscNodes[noteNumber] = oscillatorNode;
    },
    noteOff(noteNumber: number) {
      const oscillatorNode = oscNodes[noteNumber];
      if (oscillatorNode) {
        oscillatorNode.stop();
        if (oscNodes[noteNumber]) {
          delete oscNodes[noteNumber];
        }
      }
    },
  };

  return {
    outputPort,
    inputPort: {
      noteInput: {
        noteOn: core.noteOn,
        noteOff: core.noteOff,
      },
    },
    render() {
      return (
        <div className="bg-gray-200 w-[200px] h-[100px] flex-c">
          Oscillator Unit
        </div>
      );
    },
  };
}

function createKeyboardUnit(): UnitInstance {
  const outputPort = createOutputPort();
  const actions = {
    async noteOn(note: number) {
      if (gAudioContext.state === "suspended") {
        await gAudioContext.resume();
        console.log("resumed");
      }
      outputPort.noteOutput.noteOn(note);
    },
    noteOff(note: number) {
      outputPort.noteOutput.noteOff(note);
    },
  };
  return {
    outputPort,
    inputPort: {},
    render() {
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
}

export const unitFactories = {
  osc: createOscUnit,
  keyboard: createKeyboardUnit,
};

export type UnitClassKey = keyof typeof unitFactories;
