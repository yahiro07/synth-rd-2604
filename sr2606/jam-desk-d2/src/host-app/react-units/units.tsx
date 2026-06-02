import { seqNumbers } from "beams/ax/array-utils";
import { createStore } from "snap-store";
import { createOutputPort, gAudioContext } from "@/host-app/host/host-core";
import {
  createOscillatorUnitCore,
  OscParameters,
} from "@/host-app/react-units/oscillator-unit-core";
import { Knob } from "@/shared/components/knob";
import { UpperLabel } from "@/shared/components/upper-label";
import { UnitInstance } from "@/shared/contract/unit-interfaces";

function createOscUnit(): UnitInstance {
  const outputPort = createOutputPort();
  const oscillatorCore = createOscillatorUnitCore(
    gAudioContext,
    outputPort.audioOutput.node,
  );
  const store = createStore<OscParameters>({
    wave: 0,
    octave: 0.5,
    volume: 0.5,
  });
  store.subscribe((attrs) => {
    if (attrs.wave !== undefined) {
      oscillatorCore.setParameter("wave", attrs.wave);
    }
    if (attrs.octave !== undefined) {
      oscillatorCore.setParameter("octave", attrs.octave);
    }
    if (attrs.volume !== undefined) {
      oscillatorCore.setParameter("volume", attrs.volume);
    }
  });
  return {
    outputPort,
    inputPort: {
      noteInput: {
        noteOn: oscillatorCore.noteOn,
        noteOff: oscillatorCore.noteOff,
      },
    },
    RenderUi() {
      const state = store.useSnapshot();
      return (
        <div className="bg-gray-200 w-[200px] h-[100px] flex-vc gap-3">
          <h4>Oscillator</h4>
          <div className="flex-h text-[#444] gap-3">
            <UpperLabel label="wave">
              <Knob
                value={state.wave}
                onChange={store.setWave}
                min={0}
                max={1}
                step={0.333}
              />
            </UpperLabel>
            <UpperLabel label="oct">
              <Knob
                value={state.octave}
                onChange={store.setOctave}
                min={0}
                max={1}
                step={0.25}
              />
            </UpperLabel>
            <UpperLabel label="vol">
              <Knob
                value={state.volume}
                onChange={store.setVolume}
                min={0}
                max={1}
                step={0.01}
              />
            </UpperLabel>
          </div>
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

function createTwoPortsKeyboardUnit(): UnitInstance {
  const outputPorts = [createOutputPort(), createOutputPort()];
  const actions = {
    async noteOn(ch: number, note: number) {
      if (gAudioContext.state === "suspended") {
        await gAudioContext.resume();
        console.log("resumed");
      }
      outputPorts[ch].noteOutput.noteOn(note);
    },
    noteOff(ch: number, note: number) {
      outputPorts[ch].noteOutput.noteOff(note);
    },
  };
  return {
    outputPort: outputPorts[0],
    inputPort: {},
    outputPorts,
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
    inputPort: {},
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
  twoPortsKeyboard: createTwoPortsKeyboardUnit,
};

export type UnitClassKey = keyof typeof unitFactories;
