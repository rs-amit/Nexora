// MenuDropdown.tsx

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { Loader2 } from "lucide-react";

type Variant = "default" | "primary";

export type MenuItem = {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
  divider?: boolean;
  disabled?: boolean;
};

type MenuDropdownProps = {
  items: MenuItem[];

  trigger?: React.ReactNode;

  triggerText?: string;

  triggerIcon?: React.ReactNode;

  iconPosition?: "left" | "right";

  className?: string;

  menuClassName?: string;

  disabled?: boolean;

  title?: string;

  variant?: Variant;

  loading?: boolean;
};

function MenuDropdown({
  items,

  trigger,

  triggerText,

  triggerIcon,

  iconPosition = "left",

  className = "",

  menuClassName = "",

  disabled = false,

  title,

  variant = "default",

  loading = false,
}: MenuDropdownProps) {
  const [open, setOpen] =
    useState(false);

  const dropdownRef =
    useRef<HTMLDivElement | null>(null);

  // =========================================
  // Close Outside
  // =========================================
  useEffect(() => {
    const handleOutside = (
      e: MouseEvent
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          e.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    window.addEventListener(
      "click",
      handleOutside
    );

    return () => {
      window.removeEventListener(
        "click",
        handleOutside
      );
    };
  }, []);

  // =========================================
  // Trigger Variant Styles
  // =========================================
  const triggerVariants: Record<
    Variant,
    string
  > = {
    default: `
      text-white/90
      // hover:bg-[#3a3a3a]
      h-[27px]
    `,

    primary: `
      // bg-[#00a8e6]
      h-[32px]
      text-white
      hover:bg-[#0096cc]
      
    `,
  };

  const isIconOnly =
    !triggerText && !!triggerIcon;

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block ${className}`}
    >
      {/* ========================================= */}
      {/* Custom Trigger */}
      {/* ========================================= */}
      {trigger ? (
        <div
          onClick={() =>
            !disabled &&
            !loading &&
            setOpen((prev) => !prev)
          }
          className={`
            cursor-pointer
            ${disabled
              ? "opacity-50 pointer-events-none"
              : ""
            }
          `}
        >
          {trigger}
        </div>
      ) : (
        <button
          disabled={disabled || loading}
          onClick={() =>
            setOpen((prev) => !prev)
          }
          className={`
           
            px-4
            

            flex items-center justify-center gap-2
            
            rounded

            text-[13px]
            font-semibold

            transition-all duration-200

            disabled:opacity-50
            disabled:cursor-not-allowed

            ${triggerVariants[variant]}

            ${
              isIconOnly
                ? `
                  w-[38px]
                  px-0

                  ${
                    variant === "default"
                      ? "border-none"
                      : ""
                  }
                `
                : ""
            }
           
          `}
        >
          {/* Loading */}
          {loading ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <>
              {/* Left Icon */}
              {triggerIcon &&
                iconPosition ===
                  "left" && (
                  <span className="flex items-center justify-center">
                    {triggerIcon}
                  </span>
                )}

              {/* Text */}
              {triggerText && (
                <span>
                  {triggerText}
                </span>
              )}

              {/* Right Icon */}
              {triggerIcon &&
                iconPosition ===
                  "right" && (
                  <span className="flex items-center justify-center">
                    {triggerIcon}
                  </span>
                )}
            </>
          )}
        </button>
      )}

      {/* ========================================= */}
      {/* Dropdown */}
      {/* ========================================= */}
      {open && (
        <div
          className={`
            absolute
            right-0
            top-[46px]
            min-w-[180px]
            rounded
            overflow-hidden

            border border-white/10

            shadow-[0_20px_50px_rgba(0,0,0,0.35)]

            backdrop-blur-md

            z-50

            animate-in
            fade-in
            zoom-in-95
            duration-100

            ${menuClassName}
          `}
        >
          {/* Header */}
          {title && (
            <div
              className="
                px-4
                py-3

                border-b border-white/5
              "
            >
              <p
                className="
                  text-xs
                  font-semibold
                  tracking-wide
                  uppercase

                  text-white/40
                "
              >
                {title}
              </p>
            </div>
          )}

          {/* Menu Items */}
          <div className="">
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {/* Divider */}
                {item.divider && (
                  <div className="my-1 border-t border-white/10" />
                )}

                {/* Item */}
                <button
                  disabled={item.disabled}
                  onClick={() => {
                    item.onClick();

                    setOpen(false);
                  }}
                  className={`
                    w-full

                    flex items-center gap-3

                    px-4 py-3

                    text-left
                    text-sm

                    transition-all duration-150

                    hover:bg-white/5

                    disabled:opacity-40
                    disabled:cursor-not-allowed

                    ${
                      item.danger
                        ? `
                          bg-[#171717]
                          text-red-500
                          hover:bg-red-500/10
                        `
                        : "text-white/85"
                    }
                  `}
                >
                  {/* Icon */}
                  {item.icon && (
                    <span className="shrink-0">
                      {item.icon}
                    </span>
                  )}

                  {/* Label */}
                  <span>
                    {item.label}
                  </span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuDropdown;