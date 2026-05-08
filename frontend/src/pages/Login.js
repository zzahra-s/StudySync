import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data || {};
      const student = data.student || data.user;

      if (!student || !data.token) {
        setError('Invalid login response from server.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: student.student_id || student.id,
        student_id: student.student_id || student.id,
        full_name: student.full_name || student.name || '',
        email: student.email
      }));
      localStorage.setItem('studentId', String(student.student_id || student.id));
      localStorage.setItem('userId', String(student.student_id || student.id));
      localStorage.setItem('email', student.email || '');

      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Network error. Please try again later.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <Link to="/register">Register here</Link></p>
    </div>
  );
};

export default Login;
