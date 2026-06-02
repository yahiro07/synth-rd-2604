import { ReactNode } from "react";

export const UnitIdsBox = ({
  unitId,
  destSpec,
  children,
}: {
  unitId: string;
  destSpec?: string | string[];
  children?: ReactNode;
}) => {
  const destSpecText = Array.isArray(destSpec) ? destSpec.join(", ") : destSpec;
  return (
    <div className="flex-v bg-gray-400">
      <div>△{destSpecText}</div>
      {children}
      <div>{unitId}</div>
    </div>
  );
};
