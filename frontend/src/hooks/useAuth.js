import { useMemo } from 'react';

export default function useAuth() {
  const token = localStorage.getItem('token');
  const studentId = localStorage.getItem('studentId') || '1';

  return useMemo(() => ({ token, studentId }), [token, studentId]);
}
