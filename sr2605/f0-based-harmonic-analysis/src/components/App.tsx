import { onCleanup, onMount, Show } from "solid-js";
import { appActions } from "../app-actions";
import { store } from "../store";
import { BarChart } from "./BarChart";
import { PlayButton } from "./PlayButton";
import { TimbreSelector } from "./TimbreSelector";

export function App() {
  onMount(async () => {
    await appActions.initialize();

    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        appActions.noteOn(appActions.defaultNote);
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        appActions.noteOff(appActions.defaultNote);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    onCleanup(() => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    });
  });

  return (
    <div class="flex-v gap-4 p-4 min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <h1 class="text-lg font-semibold tracking-wide">F0ベース 倍音構成解析</h1>

      {/* Controls */}
      <div class="flex-ha gap-3 flex-wrap">
        <Show
          when={store.initialized}
          fallback={<span class="text-slate-500 text-sm">初期化中…</span>}
        >
          <TimbreSelector />
          <PlayButton noteNumber={appActions.defaultNote} />
          <span class="text-xs text-slate-500">スペースキーでも発音</span>
          <span
            class="text-xs"
            style={{ color: store.midiConnected ? "#4ade80" : "#94a3b8" }}
          >
            {store.midiConnected ? "🎹 MIDI 接続済" : "MIDI 未接続"}
          </span>
        </Show>
      </div>

      {/* Analysis displays */}
      <div class="flex-v gap-3">
        {/* Module 1: AnalyzerNode + F0 */}
        <BarChart
          title="Module 1 — AnalyzerNode + F0 リサンプリング (128 harmonics)"
          data={() => store.harmonics1}
          height={200}
          hueRange={[200, 260]}
        />

        {/* Module 2: ScriptProcessor + F0 */}
        <BarChart
          title="Module 2 — ScriptProcessorNode + F0 リサンプリング (128 harmonics)"
          data={() => store.harmonics2}
          height={200}
          hueRange={[160, 220]}
        />

        {/* Module 3: General spectrum (half height) */}
        <BarChart
          title="Module 3 — 一般スペクトル AnalyzerNode (0–11 kHz, 512 bins)"
          data={() => store.spectrum}
          height={200}
          hueRange={[30, 90]}
          preScaled
        />
      </div>
    </div>
  );
}
