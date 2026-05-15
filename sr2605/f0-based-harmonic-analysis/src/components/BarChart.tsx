import { createEffect, onCleanup, onMount } from "solid-js";

type Props = {
  title: string;
  /** Reactive accessor returning an array of magnitudes (0–1). */
  data: () => number[];
  height: number;
  /** Bar colour hue range [start, end]. Defaults to [200, 240] (blue). */
  hueRange?: [number, number];
  /**
   * When true, the data values (0–1) are already mapped to the dB scale
   * (0 = -100 dB, 1 = 0 dB) and are used directly as height ratios.
   * When false (default), values are treated as linear magnitudes and
   * converted to dB internally.
   */
  preScaled?: boolean;
};

export function BarChart(props: Props) {
  let containerRef!: HTMLDivElement;
  let canvasRef!: HTMLCanvasElement;

  onMount(() => {
    // Keep canvas pixel dimensions in sync with CSS layout width
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      canvasRef.width = Math.floor(w);
      canvasRef.height = props.height;
    });
    ro.observe(containerRef);
    onCleanup(() => ro.disconnect());

    // Redraw whenever data changes
    createEffect(() => {
      const data = props.data();
      if (canvasRef.width === 0) return;
      drawBars(
        canvasRef,
        data,
        props.height,
        props.hueRange ?? [200, 240],
        props.preScaled ?? false,
      );
    });
  });

  return (
    <div class="flex-v gap-1">
      <div class="text-xs text-gray-400 font-mono">{props.title}</div>
      <div ref={containerRef} class="w-full">
        <canvas
          ref={canvasRef}
          width={800}
          height={props.height}
          style={{
            width: "100%",
            height: `${props.height}px`,
            display: "block",
          }}
          class="rounded"
        />
      </div>
    </div>
  );
}

const DB_MIN = -100;
const DB_MAX = 0;
const DB_RANGE = DB_MAX - DB_MIN; // 100

/** Convert linear magnitude (0–1) to a vertical ratio (0–1) using dB scale.
 *  dB = 20*log10(v), clamped to [DB_MIN, DB_MAX].
 *  ratio 0 = bottom (DB_MIN), ratio 1 = top (DB_MAX).
 */
function magToRatio(v: number): number {
  if (v <= 0) return 0;
  const db = Math.max(DB_MIN, Math.min(DB_MAX, 20 * Math.log10(v)));
  return (db - DB_MIN) / DB_RANGE;
}

function drawBars(
  canvas: HTMLCanvasElement,
  data: number[],
  height: number,
  hueRange: [number, number],
  preScaled: boolean,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = canvas.width;
  const n = data.length;

  // Background
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, width, height);

  // Horizontal grid lines: equally spaced at 0, -20, -40, -60, -80, -100 dB
  const gridDBs = [0, -20, -40, -60, -80, -100];
  ctx.lineWidth = 1;
  ctx.font = "9px monospace";
  ctx.textAlign = "right";
  for (const db of gridDBs) {
    const ratio = (db - DB_MIN) / DB_RANGE;
    const y = Math.round(height - ratio * (height - 2));
    ctx.strokeStyle = db === 0 ? "#475569" : "#1e293b";
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
    ctx.fillStyle = "#475569";
    ctx.fillText(`${db} dB`, width - 2, y - 2);
  }

  // Bars
  const barW = width / n;
  const [hueStart, hueEnd] = hueRange;
  for (let i = 0; i < n; i++) {
    const v = Math.max(0, Math.min(1, data[i]));
    if (v <= 0) continue;
    const ratio = preScaled ? v : magToRatio(v);
    if (ratio <= 0) continue;
    const barH = ratio * (height - 2);
    const x = i * barW;
    const y = height - barH;
    const hue = hueStart + ((hueEnd - hueStart) * i) / n;
    const lightness = 35 + ratio * 25;
    ctx.fillStyle = `hsl(${hue}, 80%, ${lightness}%)`;
    ctx.fillRect(x, y, Math.max(barW - 1, 0.5), barH);
  }
}
