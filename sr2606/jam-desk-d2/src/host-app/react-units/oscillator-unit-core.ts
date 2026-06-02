export function createOscillatorUnitCore(
  audioContext: AudioContext,
  destinationNode: AudioNode,
) {
  function midiToFrequency(midiNote: number): number {
    return 440 * 2 ** ((midiNote - 69) / 12);
  }
  const oscNodes: Record<number, OscillatorNode> = {};

  return {
    noteOn(noteNumber: number) {
      console.log("note on", noteNumber);
      const freq = midiToFrequency(noteNumber);
      const oscillatorNode = audioContext.createOscillator();
      oscillatorNode.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillatorNode.type = "sawtooth";
      oscillatorNode.connect(destinationNode);
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
