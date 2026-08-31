import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import Input from "./CustomInput";
import { searchUsers, type SearchedUser } from "../../service/auth.service";

export interface UserSearchInputProps {
  value: string;
  onQueryChange: (value: string) => void;
  selectedUser: SearchedUser | null;
  onSelect: (user: SearchedUser) => void;
  onClear: () => void;
  excludeUserIds?: string[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

// Reusable "find a registered user by partial name/email, pick one" input —
// used by both the workspace invite modal and the room's invite panel.
function UserSearchInput({
  value,
  onQueryChange,
  selectedUser,
  onSelect,
  onClear,
  excludeUserIds = [],
  label,
  placeholder = "Search by name or email",
  disabled = false,
  error,
}: UserSearchInputProps) {
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const trimmed = value.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = setTimeout(() => {
      searchUsers(trimmed)
        .then((users) => {
          if (cancelled) return;

          setResults(users.filter((user) => !excludeUserIds.includes(user._id)));
          setIsOpen(true);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // excludeUserIds intentionally omitted: it's commonly a fresh array
    // literal every render, which would reset the debounce timer on every
    // keystroke's parent re-render instead of just on the query changing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (selectedUser) {
    return (
      <div className="w-full">
        {label && <label className="mb-1 block text-sm font-medium">{label}</label>}

        <div className="flex items-center justify-between rounded-md border border-white/10 bg-[#171925] px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{selectedUser.name}</p>
            <p className="truncate text-xs text-white/40">{selectedUser.email}</p>
          </div>

          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            aria-label="Change selected user"
            className="ml-2 shrink-0 rounded-md p-1 text-white/40 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onFocus={() => {
        if (results.length > 0) setIsOpen(true);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setIsOpen(false);
      }}
    >
      <Input
        label={label}
        leftIcon={<Search size={14} />}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        error={error}
        onChange={(event) => onQueryChange(event.target.value)}
      />

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-md border border-white/10 bg-[#171925] shadow-xl">
          {loading && <p className="px-3 py-2.5 text-xs text-white/40">Searching…</p>}

          {!loading && results.length === 0 && value.trim().length >= MIN_QUERY_LENGTH && (
            <p className="px-3 py-2.5 text-xs text-white/40">No matching users found.</p>
          )}

          {!loading &&
            results.map((user) => (
              <button
                key={user._id}
                type="button"
                onClick={() => {
                  onSelect(user);
                  setIsOpen(false);
                }}
                className="flex w-full flex-col items-start px-3 py-2 text-left transition hover:bg-white/5"
              >
                <span className="truncate text-sm font-medium text-white">{user.name}</span>
                <span className="truncate text-xs text-white/40">{user.email}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export default UserSearchInput;
