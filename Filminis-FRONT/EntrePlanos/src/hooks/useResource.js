import { useEffect, useState, useCallback } from "react";

export function useResource(loader) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  useEffect(() => {
    const controller = new AbortController();
    loader(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ data: null, loading: false, error });
      });
    return () => controller.abort();
  }, [loader, revision]);
  const reload = useCallback(() => {
    setState({ data: null, loading: true, error: null });
    setRevision((value) => value + 1);
  }, []);
  return { ...state, reload };
}
