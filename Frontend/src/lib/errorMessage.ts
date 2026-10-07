import axios from "axios";

export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message || fallback;
  }

  if (err instanceof Error) {
    return err.message || fallback;
  }

  return fallback;
}
