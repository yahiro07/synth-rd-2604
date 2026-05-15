import FFT from "fft.js";

const FFT_SIZE = 256;
const HARMONIC_COUNT = 128; // FFT_SIZE / 2

const fftInstance = new FFT(FFT_SIZE);
const fftOutput: number[] = fftInstance.createComplexArray();

/** Convert MIDI note number to fundamental frequency (Hz). */
export function noteToF0(noteNumber: number): number {
  return 440 * Math.pow(2, (noteNumber - 69) / 12);
}

/**
 * Find the first rising zero-crossing index (negative → positive)
 * starting from `startIdx`.
 */
export function findRisingZeroCrossing(
  data: Float32Array,
  startIdx: number,
): number {
  for (let i = startIdx; i < data.length - 1; i++) {
    if (data[i] <= 0 && data[i + 1] > 0) {
      return i;
    }
  }
  return startIdx;
}

/**
 * Linearly interpolate `data` to exactly `targetLength` samples.
 */
export function resample(
  data: Float32Array,
  targetLength: number,
): Float32Array {
  const output = new Float32Array(targetLength);
  const ratio = (data.length - 1) / (targetLength - 1);
  for (let i = 0; i < targetLength; i++) {
    const srcIdx = i * ratio;
    const lo = Math.floor(srcIdx);
    const hi = Math.min(lo + 1, data.length - 1);
    const frac = srcIdx - lo;
    output[i] = data[lo] * (1 - frac) + data[hi] * frac;
  }
  return output;
}

/** Apply a Hann window to the samples in-place. */
export function applyHannWindow(data: Float32Array): void {
  const N = data.length;
  for (let i = 0; i < N; i++) {
    const w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
    data[i] *= w;
  }
}

/**
 * Compute 128 harmonic magnitudes from 256 windowed samples.
 * Returns an array of 128 values (harmonic 1 = index 0, harmonic 128 = index 127).
 * Values are normalized so that the maximum possible magnitude is 1.
 */
export function computeHarmonics(samples: Float32Array): number[] {
  // fft.js realTransform expects a plain Array or Float64Array
  const input = Array.from(samples);
  fftInstance.realTransform(fftOutput, input);

  const harmonics = new Array<number>(HARMONIC_COUNT);
  for (let k = 1; k <= HARMONIC_COUNT; k++) {
    const re = fftOutput[2 * k];
    const im = fftOutput[2 * k + 1];
    // Normalize by N/2 so a full-scale sine gives amplitude ≈ 1
    harmonics[k - 1] = Math.sqrt(re * re + im * im) / (FFT_SIZE / 2);
  }
  return harmonics;
}
