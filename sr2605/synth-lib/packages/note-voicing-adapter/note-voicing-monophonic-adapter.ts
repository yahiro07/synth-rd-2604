export function createNoteVoicingMonophonicAdapter(destNotePort: {
  noteOn(noteNumber: number): void;
  noteOff(noteNumber: number): void;
}) {
  let note = 60;
  let gate = false;
  let sentNote: number | undefined;

  const internal = {
    updateOutputNote() {
      if (!sentNote && gate) {
        destNotePort.noteOn(note);
        sentNote = note;
      }
      if (sentNote && gate && note !== sentNote) {
        destNotePort.noteOff(sentNote);
        destNotePort.noteOn(note);
        sentNote = note;
      }
      if (sentNote && !gate) {
        destNotePort.noteOff(sentNote);
        sentNote = undefined;
      }
    },
  };
  return {
    playNote(newNote: number) {
      note = newNote;
      gate = true;
      internal.updateOutputNote();
    },
    stopNote() {
      gate = false;
      internal.updateOutputNote();
    },
  };
}
