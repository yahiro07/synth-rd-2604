import { createIntervalTimer } from "./timer-utils";

type Sequencer = {
  processStep?(stepIndex: number): void;
  processTickRange?(ppqFrom: number, ppqTo: number): void;
};

type SequencerTickDriver = {
  setBpm(bpm: number): void;
  start(sequencer: Sequencer): void;
  stop(): void;
};

function mapTimeMsToPpq(timeMs: number, bpm: number): number {
  const minutes = timeMs / 60000;
  const beats = minutes * bpm;
  const ppq = beats * 480;
  return ppq;
}

function getCrossedStepIndices(ppqFrom: number, ppqTo: number): number[] {
  const ppqPerStep = 120;
  const stepFrom = Math.floor(ppqFrom / ppqPerStep);
  const stepTo = Math.floor(ppqTo / ppqPerStep);
  const stepIndices: number[] = [];
  for (let stepIndex = stepFrom + 1; stepIndex <= stepTo; stepIndex++) {
    stepIndices.push(stepIndex);
  }
  return stepIndices;
}

function processSequencer(
  sequencer: Sequencer,
  ppqFrom: number,
  ppqTo: number,
  crossedStepIndices: number[],
) {
  for (const crossedStepIndex of crossedStepIndices) {
    sequencer.processStep?.(crossedStepIndex);
  }
  sequencer.processTickRange?.(ppqFrom, ppqTo);
}

export function createSequencerTickDriver(): SequencerTickDriver {
  const state = { bpm: 120, previousTime: 0, ppqTick: 0 };
  const intervalTimer = createIntervalTimer();
  return {
    setBpm(bpm: number) {
      state.bpm = bpm;
    },
    start(sequencer: Sequencer) {
      const startTimeMs = performance.now();
      state.previousTime = startTimeMs;
      state.ppqTick = 0;

      function advanceTime(currentTime: number) {
        const timeElapsed = currentTime - state.previousTime;
        const ppqElapsed = mapTimeMsToPpq(timeElapsed, state.bpm);

        const ppqFrom = state.ppqTick;
        const ppqTo = ppqFrom + ppqElapsed;
        const crossedStepIndices = getCrossedStepIndices(ppqFrom, ppqTo);

        processSequencer(sequencer, ppqFrom, ppqTo, crossedStepIndices);
        state.ppqTick = ppqTo;
        state.previousTime = currentTime;
      }

      processSequencer(sequencer, 0, 0, [0]);

      intervalTimer.start(() => {
        const currentTime = performance.now();
        advanceTime(currentTime);
      }, 5);
    },
    stop() {
      intervalTimer.stop();
    },
  };
}
