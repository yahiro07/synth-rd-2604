import { createStore } from "snap-store";
import { ReactUnitTemplateFn } from "@/host-app/unit-frame/react-unit-interface";
import { Knob } from "@/shared/components/knob";
import { UpperLabel } from "@/shared/components/upper-label";

type SequencerState = {
  steps: number[];
  currentStep: number;
};

const cvPerOctave = 0.1;
const cvCenter = 0.4; // C3

export const createCvGateStepSequencerUnit: ReactUnitTemplateFn = (
  unitInterface,
) => {
  const store = createStore<SequencerState>({
    steps: Array(8)
      .fill(0)
      .map(() => Math.random()),
    currentStep: -1,
  });

  const output = unitInterface.primaryOutputPort.cvGateOutput;

  unitInterface.primaryInputPort.setHandlers({
    clockInput: {
      step(stepIndex) {
        if (stepIndex % 2 === 1) return;
        const localStep = (stepIndex >>> 1) % 8;
        store.setCurrentStep(localStep);

        const knobValue = store.state.steps[localStep];
        // 0~1 -> -12~12 semitones
        const semitones = knobValue * 24 - 12;
        const cv = cvCenter + (semitones / 12) * cvPerOctave;

        output.setCv(cv);
        output.setGate(true);
      },
      stop() {
        store.setCurrentStep(-1);
        output.setGate(false);
      },
    },
    stateInput: {
      emitState() {
        return { steps: store.state.steps };
      },
      applyState(state) {
        if (state?.steps) {
          store.setSteps(state.steps);
        }
      },
    },
  });

  return {
    RenderUi() {
      const state = store.useSnapshot();

      return (
        <div className="bg-gray-200 flex-vc gap-5 select-none h-full">
          <h4 className="font-bold text-gray-700">8-Step Sequencer</h4>
          <div className="flex-h gap-2">
            {state.steps.map((value, i) => {
              const semitones = value * 24 - 12;
              const isActive = state.currentStep === i;
              return (
                <div key={i} className="flex-vc gap-1">
                  <UpperLabel label={`S${i + 1}`}>
                    <div
                      className={`p-1 rounded transition-colors ${
                        isActive ? "bg-blue-400" : "bg-gray-300"
                      }`}
                    >
                      <Knob
                        value={value}
                        onChange={(v) => {
                          const nextSteps = [...store.state.steps];
                          nextSteps[i] = v;
                          store.setSteps(nextSteps);
                        }}
                        min={0}
                        max={1}
                      />
                    </div>
                  </UpperLabel>
                  <div
                    className={`text-[10px] font-mono mt-1 ${
                      isActive ? "text-blue-700 font-bold" : "text-gray-500"
                    }`}
                  >
                    {semitones > 0
                      ? `+${semitones.toFixed(2)}`
                      : semitones.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    },
  };
};
