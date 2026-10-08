import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '../services/api';

// Pass a stable loader (module-level function or useCallback).
export function useFetch<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    loader().then(result => { if (active) setData(result); }).catch(reason => { if (active) setError(errorMessage(reason)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loader, version]);
  const reload = useCallback(() => setVersion(value => value + 1), []);
  return { data, loading, error, reload };
}
