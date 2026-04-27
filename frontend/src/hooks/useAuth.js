import { useMemo } from 'react';

export default function useAuth() {
  const token = localStorage.getItem('token');
  const user = {
    id: localStorage.getItem('userId') || '1',
    studentId: localStorage.getItem('studentId') || localStorage.getItem('userId') || '1',
    email: localStorage.getItem('email')
  };

  return useMemo(() => ({ token, user }), [token, user.id, user.email]);
}
