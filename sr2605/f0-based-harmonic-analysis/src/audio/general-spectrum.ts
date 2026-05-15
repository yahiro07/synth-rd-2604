const SPECTRUM_FFT_SIZE = 2048;
const SPECTRUM_BIN_COUNT = SPECTRUM_FFT_SIZE / 2; // 1024 bins
const OUTPUT_SIZE = 512; // Show first 512 bins (≈ 0–11 kHz at 44.1 kHz)
const DB_MIN = -100;
const DB_MAX = 0;

export type GeneralSpectrumModule = {
  node: AnalyserNode;
  getSpectrum(): number[];
};

export function createGeneralSpectrumModule(
  actx: AudioContext,
): GeneralSpectrumModule {
  const node = actx.createAnalyser();
  node.fftSize = SPECTRUM_FFT_SIZE;
  node.smoothingTimeConstant = 0.75;

  const dBBuffer = new Float32Array(SPECTRUM_BIN_COUNT);

  function getSpectrum(): number[] {
    node.getFloatFrequencyData(dBBuffer);
    const result = new Array<number>(OUTPUT_SIZE);
    for (let i = 0; i < OUTPUT_SIZE; i++) {
      // Map dB value to 0–1 linear range
      result[i] = Math.max(
        0,
        Math.min(1, (dBBuffer[i] - DB_MIN) / (DB_MAX - DB_MIN)),
      );
    }
    return result;
  }

  return { node, getSpectrum };
}
