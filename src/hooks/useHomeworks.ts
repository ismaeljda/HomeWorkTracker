import { useState, useEffect } from 'react';
import { getAllHomeworks, type Homework } from '../firebase/firestore';

interface UseHomeworksOptions {
  classId?: string;
  subjectId?: string;
  teacherId?: string;
}

export const useHomeworks = (options?: UseHomeworksOptions) => {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHomeworks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllHomeworks(options);
      setHomeworks(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching homeworks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeworks();
  }, [options?.classId, options?.subjectId, options?.teacherId]);

  return {
    homeworks,
    loading,
    error,
    refetch: fetchHomeworks
  };
};
