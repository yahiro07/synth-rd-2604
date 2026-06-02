import { mapUnaryTo } from "beams/ax/number-utils";

export type OscParameters = {
  wave: number;
  octave: number;
  volume: number;
};

export function createOscillatorUnitCore(
  audioContext: AudioContext,
  destinationNode: AudioNode,
) {
  const gainNode = audioContext.createGain();
  gainNode.connect(destinationNode);

  function midiToFrequency(midiNote: number): number {
    return 440 * 2 ** ((midiNote - 69) / 12);
  }
  const oscNodes: Record<number, OscillatorNode> = {};

  const parameters = {
    wave: 0,
    octave: 0.5,
    volume: 0.5,
  };

  const oscillatorTypes: OscillatorType[] = [
    "sawtooth",
    "square",
    "triangle",
    "sine",
  ];

  function affectGainParameter() {
    const value = parameters.volume;
    const gain = value ** 2 * 2;
    gainNode.gain.linearRampToValueAtTime(
      gain,
      audioContext.currentTime + 0.01,
    );
  }
  affectGainParameter();

  return {
    setParameter(key: keyof OscParameters, value: number) {
      parameters[key] = value;
      if (key === "volume") {
        affectGainParameter();
      }
    },
    noteOn(noteNumber: number) {
      console.log("note on", noteNumber);
      const oct = mapUnaryTo(parameters.octave, -2, 2);
      const freq = midiToFrequency(noteNumber + oct * 12);
      const oscillatorNode = audioContext.createOscillator();
      oscillatorNode.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillatorNode.type = oscillatorTypes[(parameters.wave * 3.999) >>> 0];
      oscillatorNode.connect(gainNode);
      oscillatorNode.start();
      oscNodes[noteNumber] = oscillatorNode;
    },
    noteOff(noteNumber: number) {
      const oscillatorNode = oscNodes[noteNumber];
      if (oscillatorNode) {
        oscillatorNode.stop();
        if (oscNodes[noteNumber]) {
          delete oscNodes[noteNumber];
        }
      }
    },
  };
}
