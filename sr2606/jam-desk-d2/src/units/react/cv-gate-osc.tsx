import { createStore } from "snap-store";
import { ReactUnitTemplateFn } from "@/host-app/unit-frame/react-unit-interface";

type CvGateOscState = {
  cv: number;
  gate: boolean;
};

const baseFrequency = 20;
const cvPerOctave = 0.1;

function clampCv(cv: number): number {
  return Math.min(1, Math.max(0, cv));
}

function cvToFrequency(cv: number): number {
  return baseFrequency * 2 ** (cv / cvPerOctave);
}

export const createCvGateOscUnit: ReactUnitTemplateFn = (unitInterface) => {
  const audioContext = unitInterface.audioContext;
  const destinationNode = unitInterface.primaryOutputPort.audioOutput.node;

  const oscillatorNode = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const store = createStore<CvGateOscState>({
    cv: 0,
    gate: false,
  });

  oscillatorNode.type = "sawtooth";
  oscillatorNode.frequency.setValueAtTime(
    cvToFrequency(store.state.cv),
    audioContext.currentTime,
  );
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  oscillatorNode.connect(gainNode);
  gainNode.connect(destinationNode);
  oscillatorNode.start();

  const actions = {
    setCv(cv: number) {
      const nextCv = clampCv(cv);
      store.setCv(nextCv);
      oscillatorNode.frequency.linearRampToValueAtTime(
        cvToFrequency(nextCv),
        audioContext.currentTime + 0.01,
      );
    },
    setGate(gate: boolean) {
      store.setGate(gate);
      if (gate && audioContext.state === "suspended") {
        void audioContext.resume();
      }
      gainNode.gain.linearRampToValueAtTime(
        gate ? 1 : 0,
        audioContext.currentTime + 0.01,
      );
    },
  };

  unitInterface.primaryInputPort.setHandlers({
    cvGateInput: {
      setCv: actions.setCv,
      setGate: actions.setGate,
    },
  });

  return {
    RenderUi() {
      const state = store.useSnapshot();
      return (
        <div className="bg-gray-200 w-[200px] h-[100px] flex-vc gap-2">
          <h4>CV/Gate Osc</h4>
          <div className="text-[#444] text-sm leading-5">
            <div>cv: {state.cv.toFixed(2)}</div>
            <div>gate: {state.gate ? "on" : "off"}</div>
          </div>
        </div>
      );
    },
  };
};
