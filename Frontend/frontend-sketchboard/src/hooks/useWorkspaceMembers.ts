import { useCallback, useEffect, useState } from "react";
import { workspaceService } from "../service/workspace.service";
import { validateUsers } from "../service/auth.service";

export interface WorkspaceMemberInfo {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export function useWorkspaceMembers(workspaceId: string | undefined) {
  const [members, setMembers] = useState<WorkspaceMemberInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!workspaceId) return;

    setLoading(true);

    try {
      const workspaceResponse = await workspaceService.getWorkspaceById(
        workspaceId
      );

      const entries = workspaceResponse.data.members;

      if (entries.length === 0) {
        setMembers([]);
        return;
      }

      const { users } = await validateUsers(
        entries.map((entry) => entry.userId)
      );

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
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  const getName = (userId: string) =>
    members.find((member) => member.userId === userId)?.name ?? "Unknown";

  return { members, loading, getName, refetch: load };
}
