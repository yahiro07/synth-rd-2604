import { createStore } from "snap-store";
import { ReactUnitTemplateFn } from "@/host-app/unit-frame/react-unit-interface";
import { Knob } from "@/shared/components/knob";
import { UpperLabel } from "@/shared/components/upper-label";
import {
  createOscillatorUnitCore,
  OscParameters,
} from "@/units/common/oscillator-unit-core";

export const createOscUnit: ReactUnitTemplateFn = (unitInterface) => {
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
    automationInput: {
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
    stateInput: {
      emitState() {
        return { ...store.state };
      },
      applyState(state) {
        const { wave, octave, volume } = state;
        store.assigns({
          wave,
          octave,
          volume,
        });
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
