import { seqNumbers } from "beams/ax/array-utils";
import { createStore } from "snap-store";
import { gAudioContext } from "@/host-app/host/host-core";
import { ReactUnitTemplateFn } from "@/host-app/unit-frame/react-unit-interface";
import { Knob } from "@/shared/components/knob";
import { UpperLabel } from "@/shared/components/upper-label";
import {
  createOscillatorUnitCore,
  OscParameters,
} from "@/units/common/oscillator-unit-core";

const createOscUnit: ReactUnitTemplateFn = (unitInterface) => {
  const oscillatorCore = createOscillatorUnitCore(
    unitInterface.audioContext,
    unitInterface.primaryOutputPort.audioOutput.node,
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
  unitInterface.primaryInputPort.setHandlers({
    noteInput: {
      noteOn: oscillatorCore.noteOn,
      noteOff: oscillatorCore.noteOff,
    },
    parametersInput: {
      getParameterSpecs() {
        return [
          { id: "wave", steps: 4 },
          { id: "octave", steps: 0.25 },
          { id: "volume" },
        ];
      },
      getParameter(id: string) {
        return store.state[id as keyof OscParameters];
      },
      setParameter(id: string, value: number) {
        store.assigns({ [id]: value });
      },
    },
  });
  return {
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
};

const createKeyboardUnit: ReactUnitTemplateFn = (unitInterface) => {
  const outputPort = unitInterface.primaryOutputPort;
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

const createTwoPortsKeyboardUnit: ReactUnitTemplateFn = (unitInterface) => {
  const outputPorts = unitInterface.createMultiChannelOutputPorts(2);
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

const createMixerUnit: ReactUnitTemplateFn = (unitInterface) => {
  const audioContext = unitInterface.audioContext;
  const destinationNode = unitInterface.primaryOutputPort.audioOutput.node;

  const inputPorts = unitInterface.createMultiChannelInputPorts(4);

  const gainNodes = inputPorts.map((port) => {
    const gainNode = audioContext.createGain();
    port.audioInput.node.connect(gainNode);
    gainNode.connect(destinationNode);
    return gainNode;
  });

  const store = createStore({
    levels: gainNodes.map(() => 0.5),
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
};

export const reactUnitFactories = {
  osc: createOscUnit,
  keyboard: createKeyboardUnit,
  mixer: createMixerUnit,
  twoPortsKeyboard: createTwoPortsKeyboardUnit,
};
