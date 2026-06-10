import { MidiKeyboardView } from "@/ui/organisms/midi-keyboard-view";
import { SynthPatternEditorView } from "@/ui/organisms/synth-pattern-editor-view";
import { SynthPatternEditorView2 } from "@/ui/organisms/synth-pattern-editor-view2";

export const PageRoot = () => {
  return (
    <div className="w-dvw h-dvh flex-vc gap-4">
      <div className="flex-ha gap-4">
        <SynthPatternEditorView />
        <SynthPatternEditorView2 />
      </div>

      <MidiKeyboardView />
    </div>
  );
};
