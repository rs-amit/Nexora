// Deterministic userId -> color hash, used to give each remote collaborator
// a stable, distinct color for cursors/selection outlines/laser trails.
const PALETTE = [
  "#f97316",
  "#22c55e",
  "#3b82f6",
  "#e11d48",
  "#a855f7",
  "#eab308",
  "#14b8a6",
  "#ec4899",
];

export function userColor(userId: string): string {
  let hash = 0;

  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }

  return PALETTE[hash % PALETTE.length];
}
