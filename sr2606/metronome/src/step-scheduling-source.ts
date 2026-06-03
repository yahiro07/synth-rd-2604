type StepSchedulingSource = {
  stepPoints: {
    time: number; //AudioContext time
    stepIndex: number;
  }[];
  stepDuration: number; //sec
};

export function makeStepSchedulingSource(
  currentTime: number,
  ppqFrom: number,
  ppqTo: number,
  bpm: number,
) {
  const stepDuration = 60 / bpm / 4; //sec
  const p0 = (ppqFrom / 480) * 4;
  const p1 = (ppqTo / 480) * 4;
  if (Math.floor(p0) === Math.floor(p1)) {
    return { stepPoints: [], stepDuration };
  }
  const stepPoints: StepSchedulingSource["stepPoints"] = [];

  const offset = Math.floor(p0 + 1) - p0;

  const i0 = Math.ceil(p0);
  const i1 = Math.ceil(p1);
  for (let i = i0; i < i1; i++) {
    const time = currentTime + offset * stepDuration + (i - i0) * stepDuration;
    stepPoints.push({ time, stepIndex: i });
  }

  return { stepPoints, stepDuration };
}
