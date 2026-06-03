export type StepSchedulingSource = {
  stepPoints: {
    time: number; //AudioContext time
    stepIndex: number;
  }[];
  stepDuration: number; //sec
};

export function makeStepSchedulingSource(
  startTime: number, //AudioContext.currentTime at playback start
  ppqFrom: number,
  ppqTo: number,
  bpm: number,
) {
  const stepDuration = 60 / bpm / 4; //sec
  const stepPpq = 480 / 4;
  const p0 = ppqFrom / stepPpq;
  const p1 = ppqTo / stepPpq;
  const i0 = Math.ceil(p0);
  const i1 = Math.ceil(p1);

  if (i0 === i1) {
    return { stepPoints: [], stepDuration };
  }

  const stepPoints: StepSchedulingSource["stepPoints"] = [];
  for (let i = i0; i < i1; i++) {
    const time = startTime + i * stepDuration;
    stepPoints.push({ time, stepIndex: i });
  }

  return { stepPoints, stepDuration };
}
