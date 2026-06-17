import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';

// ─── SVG Icons ───
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const ChevronIcon = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const NAV_LINKS = [
  { label: 'Dashboard',           path: '/dashboard',      icon: '🏠' },
  { label: 'GPA Tracker',         path: '/gpa',            icon: '📈' },
  { label: 'Semesters & Courses', path: '/semesters',      icon: '📚' },
  { label: 'MCA Grade Calculator',path: '/mca-calculator', icon: '🧮' },
  { label: 'Target CGPA Planner', path: '/target-cgpa',    icon: '🎯' },
  { label: 'GPA Scenarios',       path: '/scenarios',      icon: '🔮' },
  { label: 'Deadlines',           path: '/deadlines',      icon: '⏰' },
  { label: 'Task Manager',        path: '/progress',       icon: '📋' },
];

const AppLayout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!localStorage.getItem('token');

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('studentId');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    window.location.href = '/login';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Public pages (login/register) don't get the layout
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', transition: 'background 0.35s' }}>
      {/* ─── Top Bar ─── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 900,
        background: 'var(--glass)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '0 24px',
        height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Left: Hamburger + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Toggle menu"
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-primary)',
              padding: '6px', cursor: 'pointer', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s', boxShadow: 'none',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {drawerOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <div
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
            }}
          >
            <img src="/logo.png" alt="StudySync" style={{ height: '34px', width: 'auto' }} />
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700, fontSize: '1.15rem', color: 'var(--accent)', letterSpacing: '-0.02em'
            }}>
              StudySync
            </span>
          </div>
        </div>

        {/* Right: Theme Toggle + Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              background: 'transparent', border: 'none', color: 'var(--accent)',
              padding: '8px', cursor: 'pointer', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s, transform 0.2s', boxShadow: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-glow)'; e.currentTarget.style.transform = 'rotate(15deg)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'rotate(0deg)'; }}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Profile Dropdown */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                background: 'var(--accent)',
                color: '#0A1128',
                border: 'none',
                width: '36px', height: '36px',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                padding: 0,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: 'none',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              {getInitials(user.full_name)}
            </button>

            {profileOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                background: 'var(--surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-lg)',
                width: '220px',
                padding: '8px 0',
                animation: 'fadeIn 0.15s ease',
                zIndex: 999,
              }}>
                {/* User Info */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {user.full_name || 'Student'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {user.email || ''}
                  </div>
                </div>
                {/* Profile Link */}
                <Link
                  to="/profile"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 16px', color: 'var(--text-primary)',
                    textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500,
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <UserIcon /> Student Profile
                </Link>
                {/* Logout */}
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 16px', background: 'transparent',
                    color: 'var(--red)', border: 'none', borderTop: '1px solid var(--border)',
                    cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    textAlign: 'left', borderRadius: 0, boxShadow: 'none',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--red-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Side Drawer (Hamburger Menu) ─── */}
      {/* Overlay */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 800,
            background: 'var(--overlay)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.15s ease',
          }}
        />
      )}
      {/* Drawer panel */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 850,
        width: '280px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        boxShadow: drawerOpen ? 'var(--shadow-lg)' : 'none',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
        padding: '20px 0',
        overflowY: 'auto',
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '0 20px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <img src="/logo.png" alt="StudySync" style={{ height: '40px' }} />
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent)',
            }}>
              StudySync
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Student Dashboard
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div style={{ padding: '12px 10px', flex: 1 }}>
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-glow)' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 500,
                  marginBottom: '2px',
                  transition: 'all 0.15s',
                  borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--accent-glow)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span style={{ fontSize: '1.15rem', width: '24px', textAlign: 'center' }}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: '16px 20px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'var(--accent)', color: '#0A1128',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
          }}>
            {getInitials(user.full_name)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user.full_name || 'Student'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user.email || ''}
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <main style={{
        minHeight: 'calc(100vh - 60px)',
        transition: 'background 0.35s',
      }}>
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
