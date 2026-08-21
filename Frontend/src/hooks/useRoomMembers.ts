import { useCallback, useEffect, useState } from "react";
import { roomService } from "../service/room.service";
import { validateUsers } from "../service/auth.service";
import type { RoomVisibility } from "../types/room.types";

export interface RoomMemberInfo {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export function useRoomMembers(roomId: string | undefined) {
  const [members, setMembers] = useState<RoomMemberInfo[]>([]);
  const [visibility, setVisibility] = useState<RoomVisibility>("OPEN");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!roomId) return;

    setLoading(true);

    try {
      const response = await roomService.getRoomMembers(roomId);

      const entries = response.data.members;
      setVisibility(response.data.visibility);

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
  }, [roomId]);

  useEffect(() => {
    load();
  }, [load]);

  const addMember = async (userId: string) => {
    if (!roomId) return;
    await roomService.addRoomMember(roomId, userId);
    await load();
  };

  const removeMember = async (userId: string) => {
    if (!roomId) return;
    await roomService.removeRoomMember(roomId, userId);
    await load();
  };

  return { members, visibility, loading, addMember, removeMember, refetch: load };
}
