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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '20px',
    }}>
      <div className="card" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '40px 32px',
        background: 'var(--glass)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-lg)',
        borderRadius: 'var(--radius-lg)',
        textAlign: 'center',
        marginTop: 0,
        animation: 'fadeInUp 0.4s ease'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <img src="/logo.png" alt="StudySync Logo" style={{ height: '70px', width: 'auto', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: '700', fontFamily: "'Playfair Display', serif", margin: 0, color: 'var(--text-primary)' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Please enter your details to sign in to StudySync
          </p>
        </div>

        {error && <div className="error" style={{ textAlign: 'left', marginBottom: '20px' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label htmlFor="loginEmail" style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.82rem', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              id="loginEmail"
              type="email"
              placeholder="e.g. name@student.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '11px 14px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="loginPassword" style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.82rem', marginBottom: '6px' }}>
              Password
            </label>
            <input
              id="loginPassword"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: '11px 14px' }}
            />
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '0.95rem' }}>
            Sign In
          </button>
        </form>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '28px', marginBottom: 0 }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
