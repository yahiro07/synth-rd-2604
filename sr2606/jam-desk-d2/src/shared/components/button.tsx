import clsx from "clsx";
import { ReactNode } from "react";

export const Button = (props: {
  active?: boolean;
  text?: string;
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      className={clsx(
        "min-w-[60px] h-[36px] flex-c bg-gray-400 text-white border border-gray-600",
        props.active && "bg-sky-600",
      )}
      style={{
        cursor: props.disabled ? "default" : "pointer",
        opacity: props.disabled ? 0.5 : 1,
      }}
    >
      {props.text && <span>{props.text}</span>}
      {props.children}
    </button>
  );
};
