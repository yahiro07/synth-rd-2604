import {
  applyHannWindow,
  computeHarmonics,
  findRisingZeroCrossing,
  noteToF0,
  resample,
} from "./fft-utils";

const SCRIPT_BUFFER_SIZE = 4096;
const ACCUMULATE_SIZE = 8192; // Must be >= max expected period samples
const FFT_SIZE = 256;

export type F0ScriptProcessorModule = {
  /** ScriptProcessorNode — connect the signal source to this. */
  scriptProcessorNode: ScriptProcessorNode;
  /** Connect this node's output to the AudioContext destination (with 0 gain). */
  silentGainNode: GainNode;
  /** Update the note number used to derive the fundamental frequency. */
  setNoteNumber(noteNumber: number): void;
  /** Return the most recently computed harmonics. */
  getHarmonics(): number[];
};

export function createF0ScriptProcessorModule(
  actx: AudioContext,
): F0ScriptProcessorModule {
  // eslint-disable-next-line deprecation/deprecation
  const scriptProcessorNode = actx.createScriptProcessor(
    SCRIPT_BUFFER_SIZE,
    1,
    1,
  );

  // The output must be connected somewhere for the node to stay active.
  // Use a GainNode with gain=0 so no duplicate audio is heard.
  const silentGainNode = actx.createGain();
  silentGainNode.gain.value = 0;
  scriptProcessorNode.connect(silentGainNode);

  // Ring buffer to accumulate incoming samples
  const ring = new Float32Array(ACCUMULATE_SIZE);
  let writePos = 0;
  let filled = false;

  let noteNumber = 57;
  let latestHarmonics: number[] = new Array(128).fill(0);

  scriptProcessorNode.onaudioprocess = (e: AudioProcessingEvent) => {
    const inputData = e.inputBuffer.getChannelData(0);

    for (let i = 0; i < inputData.length; i++) {
      ring[writePos % ACCUMULATE_SIZE] = inputData[i];
      writePos++;
    }

    if (writePos < ACCUMULATE_SIZE) return;
    filled = true;

    // Build a linear (time-ordered) copy of the accumulated samples
    const linearBuffer = new Float32Array(ACCUMULATE_SIZE);
    const base = writePos % ACCUMULATE_SIZE;
    for (let i = 0; i < ACCUMULATE_SIZE; i++) {
      linearBuffer[i] = ring[(base + i) % ACCUMULATE_SIZE];
    }

    const f0 = noteToF0(noteNumber);
    const period = Math.round(actx.sampleRate / f0);

    const startIdx = findRisingZeroCrossing(linearBuffer, 0);
    const endIdx = startIdx + period;
    if (endIdx >= linearBuffer.length) return;

    const periodSlice = linearBuffer.slice(startIdx, endIdx);
    const resampled = resample(periodSlice, FFT_SIZE);
    applyHannWindow(resampled);
    latestHarmonics = computeHarmonics(resampled);
  };

  return {
    scriptProcessorNode,
    silentGainNode,
    setNoteNumber(n) {
      noteNumber = n;
    },
    getHarmonics() {
      return filled ? latestHarmonics : new Array(128).fill(0);
    },
  };
}
