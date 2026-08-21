import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import Input from "../../../components/ui/CustomInput";
import Button from "../../../components/ui/Button/CustomButton";

const NAME_MAX_LENGTH = 60;
const DESCRIPTION_MAX_LENGTH = 300;

export interface CreateRoomPayload {
    name: string;
    description: string;
}

export interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (payload: CreateRoomPayload) => Promise<void>;
}

function CreateRoomModal({ isOpen, onClose, onCreate }: CreateRoomModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [nameError, setNameError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const nameInputRef = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        setName("");
        setDescription("");
        setNameError(null);
        setSubmitError(null);
    };

    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(() => nameInputRef.current?.focus(), 0);
        return () => clearTimeout(timer);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isSubmitting) {
                resetForm();
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, isSubmitting, onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = () => {
        if (!isSubmitting) {
            resetForm();
            onClose();
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            resetForm();
            onClose();
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            setNameError("Room name is required");
            nameInputRef.current?.focus();
            return;
        }

        setNameError(null);
        setSubmitError(null);
        setIsSubmitting(true);

        try {
            await onCreate({
                name: trimmedName,
                description: description.trim(),
            });

            resetForm();
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Failed to create room. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={handleOverlayClick}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-room-title"
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-md rounded-xl border border-white/10 bg-[#111923] p-6 text-white shadow-xl"
            >
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                    <h2 id="create-room-title" className="text-[18px] font-semibold">
                        Create New Room
                    </h2>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        aria-label="Close"
                        className="rounded-md p-1 text-white/50 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4">
                        <Input
                            ref={nameInputRef}
                            label="Room name"
                            placeholder="e.g. System Design"
                            value={name}
                            maxLength={NAME_MAX_LENGTH}
                            disabled={isSubmitting}
                            error={nameError ?? undefined}
                            onChange={(event) => {
                                setName(event.target.value);
                                if (nameError) setNameError(null);
                            }}
                        />

                        <div className="w-full">
                            <label
                                htmlFor="room-description"
                                className="mb-1 block text-sm font-medium"
                            >
                                Description
                                <span className="ml-1 text-white/40">(optional)</span>
                            </label>

                            <textarea
                                id="room-description"
                                rows={3}
                                placeholder="What is this room for?"
                                value={description}
                                maxLength={DESCRIPTION_MAX_LENGTH}
                                disabled={isSubmitting}
                                onChange={(event) => setDescription(event.target.value)}
                                className="
                                    w-full resize-none rounded-md border
                                    bg-transparent px-3 py-3 text-sm outline-none
                                    placeholder:text-gray-400 transition-all duration-150
                                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                                    disabled:cursor-not-allowed disabled:bg-gray-100
                                "
                            />

                            <p className="mt-1 text-right text-xs text-white/40">
                                {description.length}/{DESCRIPTION_MAX_LENGTH}
                            </p>
                        </div>

                        {submitError && (
                            <p className="text-sm text-red-400" role="alert">
                                {submitError}
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            fullWidth
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>

                        <Button type="submit" fullWidth variant="primary" loading={isSubmitting}>
                            Create Room
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateRoomModal;
