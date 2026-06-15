import { NotePort } from "wafer-host/unit-types";

export function createNoteOffSchedulingAdapter(noteOutput: NotePort) {
  type NoteOffItem = { noteNumber: number; timeAt: number };
  const noteOffQueue: NoteOffItem[] = [];
  return {
    noteOn(note: number, timeAt: number, velocity?: number) {
      noteOutput.noteOn(note, timeAt, velocity);
    },
    noteOff(note: number, timeAt: number) {
      noteOffQueue.push({ noteNumber: note, timeAt });
    },
    clock(startTime: number, ppqFrom: number, ppqTo: number, bpm: number) {
      const scale = 60 / bpm / 480;
      const timeFrom = startTime + ppqFrom * scale;
      const timeTo = startTime + ppqTo * scale;
      const timeStride = timeTo - timeFrom;

      let item = noteOffQueue[0];
      while (item && item.timeAt < timeTo + timeStride) {
        noteOutput.noteOff(item.noteNumber, item.timeAt);
        noteOffQueue.shift();
        item = noteOffQueue[0];
      }
    },
    flush() {
      for (const item of noteOffQueue) {
        noteOutput.noteOff(item.noteNumber, item.timeAt);
      }
      noteOffQueue.length = 0;
    },
  };
}
