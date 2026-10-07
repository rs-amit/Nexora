/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { roomService } from "../service/room.service";
import { validateUsers } from "../service/auth.service";
import type { RoomVisibility } from "../types/room.types";
import { getErrorMessage } from "../lib/errorMessage";

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
  const [error, setError] = useState<string | null>(null);

  // Only the latest request may write state.
  const requestIdRef = useRef(0);

  // Background refresh: keeps the current list on screen while reloading
  // (e.g. after adding/removing a member).
  const load = useCallback(async () => {
    if (!roomId) return;

    const requestId = ++requestIdRef.current;
    setError(null);

    try {
      const response = await roomService.getRoomMembers(roomId);
      if (requestId !== requestIdRef.current) return;

      const entries = response.data.members;
      setVisibility(response.data.visibility);

      if (entries.length === 0) {
        setMembers([]);
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
      const message = getErrorMessage(err, "Failed to load room members.");
      setError(message);
      toast.error(message);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [roomId]);

  // Different room — clear the old list so the skeleton shows.
  useEffect(() => {
    if (!roomId) return;
    setMembers([]);
    setLoading(true);
    load();
  }, [roomId, load]);

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

  return { members, visibility, loading, error, addMember, removeMember, refetch: load };
}
