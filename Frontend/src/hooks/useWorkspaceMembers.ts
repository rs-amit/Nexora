/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { workspaceService } from "../service/workspace.service";
import { validateUsers } from "../service/auth.service";
import { getErrorMessage } from "../lib/errorMessage";

export interface WorkspaceMemberInfo {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export function useWorkspaceMembers(workspaceId: string | undefined) {
  const [members, setMembers] = useState<WorkspaceMemberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only the latest request may write state (guards against a slow response
  // for a previous workspace landing after a newer one).
  const requestIdRef = useRef(0);

  // Background refresh: keeps the current list on screen while reloading.
  const load = useCallback(async () => {
    if (!workspaceId) return;

    const requestId = ++requestIdRef.current;
    setError(null);

    try {
      const workspaceResponse = await workspaceService.getWorkspaceById(
        workspaceId
      );

      const entries = workspaceResponse.data.members;

      if (entries.length === 0) {
        if (requestId === requestIdRef.current) setMembers([]);
        return;
      }

      const { users } = await validateUsers(
        entries.map((entry) => entry.userId)
      );
      if (requestId !== requestIdRef.current) return;

      const userById = new Map(users.map((user) => [user._id, user]));

      const merged = entries.map((entry) => {
        const user = userById.get(entry.userId);

        return {
          userId: entry.userId,
          name: user?.name ?? "Unknown user",
          email: user?.email ?? "",
          role: entry.role,
        };
      });

      setMembers(merged);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      const message = getErrorMessage(err, "Failed to load workspace members.");
      setError(message);
      toast.error(message);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [workspaceId]);

  // Different workspace — clear the old list so the skeleton shows.
  useEffect(() => {
    if (!workspaceId) return;
    setMembers([]);
    setLoading(true);
    load();
  }, [workspaceId, load]);

  const getName = (userId: string) =>
    members.find((member) => member.userId === userId)?.name ?? "Unknown";

  return { members, loading, error, getName, refetch: load };
}
