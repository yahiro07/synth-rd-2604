import type { ReactNode } from "react";

export type RoundButtonProps = {
  children?: ReactNode;
  onClick?: () => void;
};

export const RoundButton = ({ children, onClick }: RoundButtonProps) => {
  return (
    <button
      type="button"
      className="rounded-full bg-gray-300 px-4 py-2 hover:bg-gray-400 active:bg-gray-500 min-w-[40px] min-h-[40px] bd-red"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
