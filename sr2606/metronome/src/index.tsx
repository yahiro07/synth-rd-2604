import "./page.css";
import "beams/ax-ui/utility-classes.css";
//
import { mountAppRoot } from "beams/ax-react/mount-app-root";
import { createStore } from "snap-store";
import { Button } from "@/components/button";
import { NumberSliderBox } from "@/components/number-slider-box";
import {
  createSequencerTickDriver,
  SequencerCallbacks,
} from "@/sequence-tick-driver";
import {
  makeStepSchedulingSource,
  StepSchedulingSource,
} from "@/step-scheduling-source";

const audioContext = new AudioContext();

async function resumeIfNeed() {
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
}

function playBeep(
  freq: number,
  time: number,
  duration: number,
  volume: number,
  wave: OscillatorType = "sine",
) {
  const oscillatorNode = audioContext.createOscillator();
  oscillatorNode.frequency.setValueAtTime(freq, time);
  oscillatorNode.type = wave;
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0;
  gainNode.gain.setValueAtTime(volume, time);
  oscillatorNode.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillatorNode.start(time);
  gainNode.gain.setValueAtTime(0, time + duration);
  oscillatorNode.stop(time + duration + 0.1);
  oscillatorNode.onended = () => {
    oscillatorNode.disconnect();
    gainNode.disconnect();
  };
}

function sequencerCore_scheduleSteps(source: StepSchedulingSource) {
  const { stepPoints, stepDuration } = source;
  for (const { time, stepIndex } of stepPoints) {
    if (stepIndex % 16 === 0) {
      playBeep(880, time, stepDuration * 0.5, 1);
    } else if (stepIndex % 4 === 0) {
      playBeep(440, time, stepDuration * 0.5, 0.5);
    } else {
      playBeep(220, time, stepDuration * 0.4, 0.2);
    }
  }
}

const sequencer: SequencerCallbacks = {
  processScheduling(startTime, ppqFrom, ppqTo, bpm) {
    const stepSchedulingSource = makeStepSchedulingSource(
      startTime,
      ppqFrom,
      ppqTo,
      bpm,
    );
    sequencerCore_scheduleSteps(stepSchedulingSource);
  },
};
const sequenceTickDriver = createSequencerTickDriver(audioContext, 25, 100);
// const sequenceTickDriver = createSequencerTickDriver(audioContext, 10, 40);

const store = createStore({ playing: false, bpm: 120 });

sequenceTickDriver.setBpm(store.state.bpm);

const actions = {
  async togglePlayState() {
    await resumeIfNeed();
    const nextPlaying = !store.state.playing;
    if (nextPlaying) {
      sequenceTickDriver.start(sequencer);
    } else {
      sequenceTickDriver.stop();
    }
    store.setPlaying(nextPlaying);
  },
  setBpm(bpm: number) {
    store.setBpm(bpm);
    sequenceTickDriver.setBpm(bpm);
  },
};

const App = () => {
  const { playing, bpm } = store.useSnapshot();
  return (
    <div className="h-dvh flex-c gap-4">
      <Button active={playing} onClick={actions.togglePlayState}>
        play
      </Button>
      <NumberSliderBox
        label="bpm"
        value={bpm}
        onChange={actions.setBpm}
        min={60}
        max={240}
      />
    </div>
  );
};

mountAppRoot(<App />);
