import { useMemo } from 'react';

export default function useAuth() {
  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const normalizedId = String(
    storedUser.student_id
      || storedUser.id
      || localStorage.getItem('studentId')
      || localStorage.getItem('userId')
      || ''
  );

  const user = {
    id: normalizedId,
    studentId: normalizedId,
    email: storedUser.email || localStorage.getItem('email') || '',
    name: storedUser.full_name || storedUser.name || ''
  };

  return useMemo(() => ({ token, user }), [token, normalizedId, user.email, user.name]);
}
