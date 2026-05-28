import { ReactNode } from "react";

export function ScalerBox(props: {
  children: ReactNode;
  contentWidth: number;
  contentHeight: number;
  scale: number;
}) {
  return (
    <div
      style={{
        width: `${props.contentWidth * props.scale}px`,
        height: `${props.contentHeight * props.scale}px`,
      }}
    >
      <div
        style={{
          transform: `scale(${props.scale})`,
          transformOrigin: "left top",
        }}
      >
        {props.children}
      </div>
    </div>
  );
}
