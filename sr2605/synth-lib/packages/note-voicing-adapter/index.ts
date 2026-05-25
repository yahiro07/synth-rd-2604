export function createNoteVoicingAdapter(destNotePort: {
  noteOn(noteNumber: number): void;
  noteOff(noteNumber: number): void;
}) {
  const notes = new Set<number>();
  const offTimers = new Map<number, ReturnType<typeof setTimeout>>();

  const internal = {
    noteOn(noterNumber: number) {
      destNotePort.noteOn(noterNumber);
      notes.add(noterNumber);
    },
    noteOff(noteNumber: number) {
      destNotePort.noteOff(noteNumber);
      notes.delete(noteNumber);
    },
    reserveNoteOff(noteNumber: number, durationSec: number) {
      const timer = setTimeout(() => {
        offTimers.delete(noteNumber);
        internal.noteOff(noteNumber);
      }, durationSec * 1000);
      offTimers.set(noteNumber, timer);
    },
    cancelNoteOffReservation(noteNumber: number) {
      const timer = offTimers.get(noteNumber);
      if (timer !== undefined) {
        clearTimeout(timer);
        offTimers.delete(noteNumber);
      }
    },
    allNotesOff() {
      for (const timer of offTimers.values()) {
        clearTimeout(timer);
      }
      offTimers.clear();
      for (const note of notes) {
        destNotePort.noteOff(note);
      }
      notes.clear();
    },
  };
  return {
    noteOn(noteNumber: number, durationSec?: number) {
      internal.cancelNoteOffReservation(noteNumber);
      internal.noteOn(noteNumber);
      if (durationSec !== undefined) {
        internal.reserveNoteOff(noteNumber, durationSec);
      }
    },
    noteOff(noteNumber: number) {
      internal.noteOff(noteNumber);
    },
    allNotesOff() {
      internal.allNotesOff();
    },
  };
}
