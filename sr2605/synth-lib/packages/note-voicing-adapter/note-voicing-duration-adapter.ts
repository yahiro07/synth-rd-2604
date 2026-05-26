export function createNoteVoicingDurationAdapter(destNotePort: {
  noteOn(noteNumber: number): void;
  noteOff(noteNumber: number): void;
}) {
  // console.log("noteVoicingAdapter 0054");

  const sentNotes = new Set<number>();
  const offTimers = new Map<number, ReturnType<typeof setTimeout>>();

  const internal = {
    emitNoteOn(noterNumber: number) {
      destNotePort.noteOn(noterNumber);
      sentNotes.add(noterNumber);
    },
    emitNoteOff(noteNumber: number) {
      if (sentNotes.has(noteNumber)) {
        destNotePort.noteOff(noteNumber);
        sentNotes.delete(noteNumber);
      }
    },
    reserveNoteOff(noteNumber: number, durationSec: number) {
      const timer = setTimeout(() => {
        offTimers.delete(noteNumber);
        internal.emitNoteOff(noteNumber);
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
      for (const note of sentNotes) {
        destNotePort.noteOff(note);
      }
      sentNotes.clear();
    },
  };
  return {
    noteOn(noteNumber: number, durationSec?: number) {
      internal.cancelNoteOffReservation(noteNumber);
      internal.emitNoteOff(noteNumber);
      internal.emitNoteOn(noteNumber);
      if (durationSec !== undefined) {
        internal.reserveNoteOff(noteNumber, durationSec);
      }
    },
    noteOff(noteNumber: number) {
      internal.cancelNoteOffReservation(noteNumber);
      internal.emitNoteOff(noteNumber);
    },
    allNotesOff() {
      internal.allNotesOff();
    },
  };
}
