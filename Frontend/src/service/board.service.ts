import api from "../lib/api";
import type { GetBoardSnapshotResponse } from "../types/canvas.types";

export const boardService = {
  getSnapshot: async (roomId: string): Promise<GetBoardSnapshotResponse> => {
    const response = await api.get(`/sketch/rooms/${roomId}/shapes`);

    return response.data;
  },
};
