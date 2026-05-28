import { linearInterpolate } from "@beam/ax/number-utils";

export function mapKnobGainDb(
  value: number,
  knobCenter: number,
  dbTop = 12,
  dbBottom = -80,
) {
  let db = 0;
  if (value > knobCenter) {
    db = linearInterpolate(value, knobCenter, 1, 0, dbTop);
  } else {
    db = linearInterpolate(value, 0, knobCenter, dbBottom, 0);
  }
  return 10 ** (db / 20);
}
