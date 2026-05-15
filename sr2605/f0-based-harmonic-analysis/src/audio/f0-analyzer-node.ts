import {
  applyHannWindow,
  computeHarmonics,
  findRisingZeroCrossing,
  noteToF0,
  resample,
} from "./fft-utils";

const TIME_DOMAIN_FFT_SIZE = 8192; // AnalyzerNode buffer size (samples)
const FFT_SIZE = 256;

export type F0AnalyzerNodeModule = {
  /** AudioNode to connect the signal source to. */
  node: AnalyserNode;
  /** Run one analysis cycle and return 128 harmonic magnitudes. */
  analyze(): number[];
  /** Update the note number used to derive the fundamental frequency. */
  setNoteNumber(noteNumber: number): void;
  /** Return the most recently computed harmonics. */
  getHarmonics(): number[];
};

export function createF0AnalyzerNodeModule(
  actx: AudioContext,
): F0AnalyzerNodeModule {
  const analyzerNode = actx.createAnalyser();
  analyzerNode.fftSize = TIME_DOMAIN_FFT_SIZE;

  const timeDomainBuffer = new Float32Array(TIME_DOMAIN_FFT_SIZE);
  let noteNumber = 57;
  let latestHarmonics: number[] = new Array(128).fill(0);

  function analyze(): number[] {
    analyzerNode.getFloatTimeDomainData(timeDomainBuffer);

    const f0 = noteToF0(noteNumber);
    const period = Math.round(actx.sampleRate / f0);

    const startIdx = findRisingZeroCrossing(timeDomainBuffer, 0);
    const endIdx = startIdx + period;

    if (endIdx >= timeDomainBuffer.length) return latestHarmonics;

    const periodSlice = timeDomainBuffer.slice(startIdx, endIdx);
    const resampled = resample(periodSlice, FFT_SIZE);
    applyHannWindow(resampled);
    latestHarmonics = computeHarmonics(resampled);
    return latestHarmonics;
  }

  return {
    node: analyzerNode,
    analyze,
    setNoteNumber(n) {
      noteNumber = n;
    },
    getHarmonics() {
      return latestHarmonics;
    },
  };
}
