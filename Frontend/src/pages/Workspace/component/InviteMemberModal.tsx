import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import UserSearchInput from "../../../components/ui/UserSearchInput";
import Button from "../../../components/ui/Button/CustomButton";
import type { InvitableRole } from "../../../types/workspace.types";
import type { SearchedUser } from "../../../service/auth.service";

export interface InviteMemberPayload {
    email: string;
    role: InvitableRole;
}

export interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (payload: InviteMemberPayload) => Promise<void>;
    /** userIds already in the workspace — hidden from search results */
    existingMemberIds?: string[];
}

function InviteMemberModal({
    isOpen,
    onClose,
    onInvite,
    existingMemberIds = [],
}: InviteMemberModalProps) {
    const [query, setQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
    const [role, setRole] = useState<InvitableRole>("EDITOR");
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setQuery("");
        setSelectedUser(null);
        setRole("EDITOR");
        setSubmitError(null);
    };

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

        if (!selectedUser) return;

        setSubmitError(null);
        setIsSubmitting(true);

        try {
            await onInvite({ email: selectedUser.email, role });

            resetForm();
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Failed to invite member. Please try again."
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
                aria-labelledby="invite-member-title"
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-md rounded-xl border border-white/10 bg-[#111923] p-6 text-white shadow-xl"
            >
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                    <h2 id="invite-member-title" className="text-[18px] font-semibold">
                        Invite Member
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
                        <UserSearchInput
                            label="Invite by name or email"
                            placeholder="teammate@company.com"
                            value={query}
                            onQueryChange={setQuery}
                            selectedUser={selectedUser}
                            onSelect={setSelectedUser}
                            onClear={() => setSelectedUser(null)}
                            excludeUserIds={existingMemberIds}
                            disabled={isSubmitting}
                        />

                        <div className="w-full">
                            <label
                                htmlFor="invite-role"
                                className="mb-1 block text-sm font-medium"
                            >
                                Role
                            </label>

                            <select
                                id="invite-role"
                                value={role}
                                disabled={isSubmitting}
                                onChange={(event) =>
                                    setRole(event.target.value as InvitableRole)
                                }
                                className="
                                    w-full rounded-md border
                                    bg-[#171925] px-3 py-3 text-sm outline-none
                                    transition-all duration-150
                                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                                    disabled:cursor-not-allowed disabled:opacity-60
                                "
                            >
                                <option value="EDITOR">Editor</option>
                                <option value="VIEWER">Viewer</option>
                            </select>
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

                        <Button
                            type="submit"
                            fullWidth
                            variant="primary"
                            loading={isSubmitting}
                            disabled={!selectedUser}
                        >
                            Send Invite
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default InviteMemberModal;
