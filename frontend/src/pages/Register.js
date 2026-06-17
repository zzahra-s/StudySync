import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/auth/register', {
        full_name: fullName,
        roll_number: rollNumber,
        email,
        password
      });

      navigate('/login');
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
        maxWidth: '460px',
        width: '100%',
        padding: '36px 32px',
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
          <img src="/logo.png" alt="StudySync Logo" style={{ height: '60px', width: 'auto', marginBottom: '14px' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: '700', fontFamily: "'Playfair Display', serif", margin: 0, color: 'var(--text-primary)' }}>
            Create Account
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Join StudySync to organize your academic journey
          </p>
        </div>

        {error && <div className="error" style={{ textAlign: 'left', marginBottom: '20px' }}>{error}</div>}

        <form onSubmit={handleRegister} style={{ textAlign: 'left' }}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="regName" style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.82rem', marginBottom: '4px' }}>
              Full Name
            </label>
            <input
              id="regName"
              type="text"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{ padding: '10px 14px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="regRoll" style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.82rem', marginBottom: '4px' }}>
              Roll Number
            </label>
            <input
              id="regRoll"
              type="text"
              placeholder="e.g. CS-2023-04"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
              style={{ padding: '10px 14px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="regEmail" style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.82rem', marginBottom: '4px' }}>
              Email Address
            </label>
            <input
              id="regEmail"
              type="email"
              placeholder="e.g. name@student.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '10px 14px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="regPass" style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.82rem', marginBottom: '4px' }}>
              Password
            </label>
            <input
              id="regPass"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: '10px 14px' }}
            />
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '0.95rem' }}>
            Get Started
          </button>
        </form>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '24px', marginBottom: 0 }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
