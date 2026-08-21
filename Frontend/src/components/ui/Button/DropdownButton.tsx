import { useEffect, useRef, useState } from "react";
import Button from "./CustomButton";

type Variant = "primary" | "secondary" | "outline" | "ghost";

type DropdownItem = {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
};

type DropdownButtonProps = {
  label: string;
  items: DropdownItem[];

  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  buttonVariant?: "primary" | "secondary" | "outline" | "ghost";

  className?: string;
  loading?: boolean
};

const DropdownButton = ({
  label,
  items,
  leftIcon,
  rightIcon,
  buttonVariant = "outline",
  className = "",
  loading = false
}: DropdownButtonProps) => {
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const variants: Record<Variant, string> = {
    primary: `
      bg-[#f48221] text-white
      hover:bg-[#e6761c]
      active:bg-[#cc6518]
      focus:ring-[#f48221]/40
      disabled:bg-[#f48221]/60
    `,
    secondary: `
      bg-gray-900 text-white
      hover:bg-gray-800
      active:bg-gray-700
      focus:ring-gray-400
      disabled:bg-gray-400
    `,
    outline: `
      border border-gray-300 text-white flex justify-center items-center bg-transparent
      hover:bg-gray-50 hover:text-black
      active:bg-gray-100
      focus:ring-gray-300
      disabled:text-gray-400
    `,
    ghost: `
      text-gray-700
      hover:bg-gray-100
      active:bg-gray-200
      focus:ring-gray-300
      disabled:text-gray-400
    `,
  };

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    window.addEventListener("click", handleOutside);

    return () => {
      window.removeEventListener("click", handleOutside);
    };
  }, []);

  return (
    <div
      className={`relative inline-block ${className}`}
      ref={dropdownRef}
    >

      {/* Trigger */}
      <Button
        variant={buttonVariant}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        onClick={() => setOpen((prev) => !prev)}
        loading={loading}
      >
        {label}
      </Button>

      {/* Menu */}
      {/* Menu */}
      {open && (
        <div
          className={`
      absolute right-0 mt-2 min-w-[240px]
      rounded-2xl
      ${variants[buttonVariant]}
      shadow-[0_10px_30px_rgba(0,0,0,0.08)]
      backdrop-blur-md
      z-50
      overflow-hidden
      animate-in fade-in zoom-in-95 duration-100
    `}
        >

          {/* Items */}
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className={`
            group
            w-full
            flex items-center gap-3
            px-4 py-3
            text-sm
            text-left
            transition-all duration-150
            hover:bg-[#ef791f]
            active:scale-[0.98]
        
          `}
              >

                {/* Icon */}
                {item.icon && (
                  <span
                    className={`
                flex items-center justify-center
                transition
              `}
                  >
                    {item.icon}
                  </span>
                )}

                {/* Label */}
                <span className="font-medium">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownButton;