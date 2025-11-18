import { AxiosRequestConfig } from 'axios';
import { useEffect, useState } from 'react';
import api from '../services/api';

export const useFetch = <T>(
  url: string,
  options: RequestInit = {}
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get(url, options as AxiosRequestConfig<any>);
      setData(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  const refetch = (): void => {
    fetchData();
  };

  return { data, loading, error, refetch };
};
