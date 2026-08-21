import React from "react";

type ToolButtonProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

const ToolButton = ({
  icon,
  label,
  active = false,
  onClick,
}: ToolButtonProps) => {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`
        w-8 h-8
        flex items-center justify-center
        rounded
        transition-all duration-200
        text-[11px]

        ${
          active
            ? "bg-[#3a3a3a] border-[#32354c] shadow-md"
            : "border-[#373944]"
        }

        active:scale-[0.96]
      `}
    >
      {icon}
    </button>
  );
};

export default ToolButton;