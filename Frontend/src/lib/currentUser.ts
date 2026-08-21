export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

export function getCurrentUser(): CurrentUser | null {
  const raw = localStorage.getItem("user");

  if (!raw) return null;

  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}
