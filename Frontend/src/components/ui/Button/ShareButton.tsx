import { Link2 } from "lucide-react";

type ShareButtonProps = {
    label?: string;

    onShare?: () => void;

    className?: string;

    disabled?: boolean;
};

function ShareButton({
    label = "Share",

    onShare,

    className = "",

    disabled = false,
}: ShareButtonProps) {
    return (
        <button
            disabled={disabled}
            onClick={onShare}
            className={`
        h-[27px]

        flex items-center

        rounded

        overflow-hidden

        border border-white/10

        shadow-sm

        transition-all duration-200

        active:scale-[0.98]

        disabled:opacity-50
        disabled:cursor-not-allowed

        ${className}
      `}
        >
            {/* Left Section */}
            <div
                className="
                 h-full
                 px-2
                 flex items-center justify-center
                 text-white
                 text-[12px]
                 font-medium
                  hover:bg-[#3a3a3a]
                "
            >
                {label}
            </div>

            {/* Divider */}
            <div className="w-[1px] h-full bg-white/10" />

            {/* Icon Section */}
            <div
                className="
          w-[27px]
          h-full
          flex items-center justify-center

          text-white/80

           hover:bg-[#3a3a3a]
        "
            >
                <Link2 size={18} />
            </div>
        </button>
    );
}

export default ShareButton;