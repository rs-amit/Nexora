import React from "react";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "delete";
type Size = "sm" | "md" | "lg";

type ButtonProps = {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    className?: string;

    // 👇 link support
    to?: string;     // internal routing
    href?: string;   // external link
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className = "",
    children,
    disabled,
    to,
    href,
    ...props
}) => {
    const base =
        "inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 ";

    const sizes: Record<Size, string> = {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2.5 text-sm",
        lg: "px-5 py-3 text-base",
    };

    const variants: Record<Variant, string> = {
        primary: `
      bg-[#2563EB] text-white
      hover:bg-[#33b9eb]
      active:bg-[#2563EB]
      focus:ring-[#33b9eb]/40
      disabled:bg-[#33b9eb]/60
    `,
        secondary: `
      bg-gray-900 text-white
      hover:bg-gray-800
      active:bg-gray-700
      focus:ring-gray-400
      disabled:bg-gray-400
    `,
        outline: `
      border text-white flex justify-center items-center bg-transparent
      disabled:text-gray-400
    `,
        ghost: `
      text-gray-700
      hover:bg-gray-100
      active:bg-gray-200
      focus:ring-gray-300
      disabled:text-gray-400
    `,
        delete: `
    bg-red-500 text-white
    hover:bg-red-600
    active:bg-red-700
    focus:ring-red-300
    disabled:bg-red-300
  `,
    };

    const classes = `
    ${base}
    ${sizes[size]}
    ${variants[variant]}
    ${fullWidth ? "w-full" : ""}
    ${disabled || loading ? "cursor-not-allowed opacity-90" : ""}
    ${className}
  `;

    const content = (
        <>
            {loading ? (
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
            ) : (
                leftIcon && <span className="mr-2">{leftIcon}</span>
            )}

            {children}

            {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
    );

    // 🔗 Internal Link (React Router)
    if (to) {
        return (
            <Link to={to} className={classes}>
                {content}
            </Link>
        );
    }

    // 🌐 External Link
    if (href) {
        return (
            <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
                {content}
            </a>
        );
    }

    // 🔘 Default Button
    return (
        <button
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {content}
        </button>
    );
};

export default Button;