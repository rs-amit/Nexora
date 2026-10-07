/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "../../lib/errorMessage";

type FetchFunction<T> = () => Promise<T>;

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string |null;
  refetch: () => Promise<void>;
}

export default function useFetch<T>(
  fetchFunction: FetchFunction<T>
): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only the latest request may write state, so a slow response for a
  // previous workspace/room can't overwrite the current one.
  const requestIdRef = useRef(0);

  const fetchData = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      const response = await fetchFunction();
      if (requestId !== requestIdRef.current) return;

      setData(response);
      setError(null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      const message = getErrorMessage(err, "Failed to load data.");
      setError(message);
      toast.error(message);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFunction]);

  // New params (e.g. a different workspaceId) — drop the old data and show
  // the skeleton instead of the previous page's content.
  useEffect(() => {
    setData(null);
    setError(null);
    setLoading(true);
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    // Refetch in the background: keep showing the current data until the
    // fresh response arrives, so the page doesn't flash back to a skeleton.
    refetch: fetchData,
  };
}
