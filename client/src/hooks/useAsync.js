import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async service call and exposes the four states every data-driven page
 * in this application must handle: loading / error / empty / success.
 *
 * @param {Function} asyncFn  service function returning a promise
 * @param {Array}    deps     re-run whenever these change
 * @param {Object}   options  { immediate: boolean, initialData: any }
 */
export default function useAsync(asyncFn, deps = [], options = {}) {
  const { immediate = true, initialData = null } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  const fnRef = useRef(asyncFn);
  fnRef.current = asyncFn;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      if (mounted.current) setData(result);
      return result;
    } catch (caught) {
      if (mounted.current) setError(caught);
      return null;
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload: run, setData };
}
