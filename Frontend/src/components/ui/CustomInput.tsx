import React, { forwardRef, useState } from "react";
import { X } from "lucide-react";

type InputProps = {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    allowClear?: boolean;
    containerClassName?: string;
    className?: string;
    variant?: "default" | "inline";
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            allowClear = false,
            containerClassName = "",
            className = "",
            variant = "default",
            value,
            onChange,
            ...props
        },
        ref
    ) => {
        const [focused, setFocused] = useState(false);

        const showClear = allowClear && value && !props.disabled;

        const isInline = variant === "inline";

        return (
            <div className={`w-full ${containerClassName}`}>

                {/* Label */}
                {label && (
                    <label className="block mb-1 text-sm font-medium">
                        {label}
                    </label>
                )}

                {/* Input Wrapper */}
                <div
                    className={`
                        flex items-center transition-all duration-150
                        
                        ${isInline
                            ? `
                                px-0 py-1
                                rounded-none
                                bg-transparent
                                ${focused
                                    ? "border-blue-500"
                                    : "border-gray-600"
                                }
                              `
                            : `
                                px-3 py-3
                                rounded-md
                                border
                                ${error
                                    ? "border-red-500 ring-1 ring-red-500"
                                    : focused
                                        ? "border-blue-500 ring-2 ring-blue-200"
                                        : "border"
                                }
                                ${props.disabled
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : "bg-transparent"
                                }
                              `
                        }
                    `}
                >

                    {/* Left Icon */}
                    {leftIcon && (
                        <span className="mr-2 text-gray-400 flex items-center">
                            {leftIcon}
                        </span>
                    )}

                    {/* Input */}
                    <input
                        ref={ref}
                        value={value}
                        onChange={onChange}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        className={`
                            flex-1 bg-transparent outline-none
                            text-sm placeholder:text-gray-400
                            ${className}
                        `}
                        {...props}
                    />

                    {/* Clear Button */}
                    {showClear && (
                        <button
                            type="button"
                            onClick={() =>
                                onChange?.({
                                    target: { value: "" },
                                } as React.ChangeEvent<HTMLInputElement>)
                            }
                            className="ml-2 text-gray-400 hover:text-gray-600 transition"
                        >
                            <X size={16} />
                        </button>
                    )}

                    {/* Right Icon */}
                    {!showClear && rightIcon && (
                        <span className="ml-2 text-gray-400 flex items-center">
                            {rightIcon}
                        </span>
                    )}
                </div>

                {/* Error / Helper */}
                {error ? (
                    <p className="mt-1 text-xs text-red-500">{error}</p>
                ) : helperText ? (
                    <p className="mt-1 text-xs text-gray-500">{helperText}</p>
                ) : null}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;