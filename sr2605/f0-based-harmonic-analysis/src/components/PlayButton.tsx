import { appActions } from "../app-actions";

type Props = {
  noteNumber: number;
};

export function PlayButton(props: Props) {
  function noteOn() {
    appActions.noteOn(props.noteNumber);
  }
  function noteOff() {
    appActions.noteOff(props.noteNumber);
  }

  return (
    <button
      type="button"
      class="px-4 py-1.5 bg-blue-700 hover:bg-blue-600 active:bg-blue-500 rounded text-sm font-medium select-none"
      onMouseDown={noteOn}
      onMouseUp={noteOff}
      onMouseLeave={noteOff}
      onTouchStart={(e) => {
        e.preventDefault();
        noteOn();
      }}
      onTouchEnd={noteOff}
    >
      ▶ 発音 (A3 / MIDI {props.noteNumber})
    </button>
  );
}
