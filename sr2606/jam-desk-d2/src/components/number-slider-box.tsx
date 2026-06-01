import { KnobFrame } from "beams/mo-react/components/knob-frame";

export function NumberSliderBoxView(props: {
  value: number;
  fracDigits?: number;
}) {
  return (
    <div
      className="w-[60px] h-[36px] flex-c bg-gray-400 text-white border border-gray-600 text-xl"
      style={{ letterSpacing: "0.03em" }}
    >
      {props.value.toFixed(props.fracDigits ?? 2)}
    </div>
  );
}

export function NumberSliderBox({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  fracDigits = 0,
  onChange,
}: {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  fracDigits?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex-ha gap-1">
      {label && <div>{label}</div>}
      <KnobFrame
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        dragRange={400}
      >
        <NumberSliderBoxView value={value} fracDigits={fracDigits} />
      </KnobFrame>
    </div>
  );
}
