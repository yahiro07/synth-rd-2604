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
import { makeStepSchedulingSource } from "@/step-scheduling-source";

const audioContext = new AudioContext();

async function resumeIfNeed() {
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
}

function playBeep(freq: number, time: number, duration: number) {
  const oscillatorNode = audioContext.createOscillator();
  oscillatorNode.frequency.setValueAtTime(freq, time);
  oscillatorNode.type = "sine";
  oscillatorNode.connect(audioContext.destination);
  oscillatorNode.start();
  oscillatorNode.stop(time + duration);
}

const sequencer: SequencerCallbacks = {
  processScheduling(ppqFrom, ppqTo, bpm) {
    const { stepPoints, stepDuration } = makeStepSchedulingSource(
      audioContext.currentTime,
      ppqFrom,
      ppqTo,
      bpm,
    );
    console.log({ ppqFrom, ppqTo, bpm, stepPoints, stepDuration });

    for (const { time, stepIndex } of stepPoints) {
      if (stepIndex % 4 === 0) {
        const freq = 440;
        playBeep(freq, time, stepDuration * 0.5);
      }
    }
  },
};
const sequenceTickDriver = createSequencerTickDriver(audioContext);

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
  return (
    <div className="h-dvh flex-c gap-4">
      <Button onClick={actions.togglePlayState}>play</Button>
      <NumberSliderBox
        label="bpm"
        value={store.state.bpm}
        onChange={actions.setBpm}
        min={60}
        max={240}
      />
    </div>
  );
};

mountAppRoot(<App />);
