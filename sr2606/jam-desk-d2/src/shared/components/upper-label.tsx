import { npx } from "beams/ax-ui/styling-utils";
import { ReactNode } from "react";

export const UpperLabel = ({
  label,
  children,
  yOffset = 0,
}: {
  label: string;
  children: ReactNode;
  yOffset?: number;
}) => {
  return (
    <div className="relative">
      {children}
      <div
        className="absolute left-0 w-full flex-c text-[9px] font-bold"
        style={{ top: npx(yOffset - 13) }}
      >
        {label}
      </div>
    </div>
  );
};
