import { seqNumbers } from "beams/ax/array-utils";
import { createStore } from "snap-store";
import { Knob } from "@/components/knob";
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
    RenderUi() {
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
}

function createMixerUnit(): UnitInstance {
  const audioContext = gAudioContext;
  const outputPort = createOutputPort();
  const destinationNode = outputPort.audioOutput.node;

  const gainNodes = seqNumbers(4).map(() => audioContext.createGain());

  const store = createStore({
    levels: gainNodes.map(() => 0.5),
  });

  const inputPorts = gainNodes.map((gainNode) => {
    gainNode.connect(destinationNode);
    return { audioInput: { node: gainNode } };
  });

  const actionsInternal = {
    affectLevelToGain(ch: number, level: number) {
      const gainNode = gainNodes[ch];
      if (gainNode) {
        const gain = level ** 2 * 2;
        gainNode.gain.linearRampToValueAtTime(
          gain,
          audioContext.currentTime + 0.01,
        );
      }
    },
  };
  seqNumbers(4).forEach((ch) => {
    const level = store.state.levels[ch];
    actionsInternal.affectLevelToGain(ch, level);
  });

  const actions = {
    setLevel(ch: number, level: number) {
      store.setLevels((prev) => prev.map((l, i) => (i === ch ? level : l)));
      actionsInternal.affectLevelToGain(ch, level);
    },
  };

  return {
    outputPort,
    inputPorts,
    RenderUi() {
      const { levels } = store.useSnapshot();
      return (
        <div className="bg-gray-200 w-[200px] h-[100px] flex-c gap-3">
          {seqNumbers(4).map((ch) => (
            <div key={ch} className="flex-vc gap-1">
              <span>{ch + 1}</span>
              <Knob
                value={levels[ch]}
                onChange={(value) => actions.setLevel(ch, value)}
              />
            </div>
          ))}
        </div>
      );
    },
  };
}

export const unitFactories = {
  osc: createOscUnit,
  keyboard: createKeyboardUnit,
  mixer: createMixerUnit,
};

export type UnitClassKey = keyof typeof unitFactories;
