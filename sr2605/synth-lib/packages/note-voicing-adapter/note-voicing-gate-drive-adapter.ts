export function createNoteVoicingGateDriveAdapter(destNotePort: {
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
    setNoteNumber(_note: number) {
      note = _note;
      internal.updateOutputNote();
    },
    setGate(_gate: boolean) {
      gate = _gate;
      internal.updateOutputNote();
    },
  };
}
