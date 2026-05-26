function midiToFrequency(midiNote: number): number {
  return 440 * 2 ** ((midiNote - 69) / 12);
}

export function createTestSynthesizer() {
  // console.log("testSynthesizer 0038");
  const audioContext = new AudioContext();
  const noteNodes: Record<number, OscillatorNode> = {};

  return {
    async resumeIfNeed() {
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
    },
    noteOn(noteNumber: number) {
      const freq = midiToFrequency(noteNumber);
      const oscillatorNode = audioContext.createOscillator();
      oscillatorNode.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillatorNode.type = "sawtooth";
      oscillatorNode.connect(audioContext.destination);
      oscillatorNode.start();
      noteNodes[noteNumber] = oscillatorNode;
    },
    noteOff(noteNumber: number) {
      const oscillatorNode = noteNodes[noteNumber];
      if (oscillatorNode) {
        oscillatorNode.stop();
        if (noteNodes[noteNumber]) {
          delete noteNodes[noteNumber];
        }
      }
    },
  };
}
