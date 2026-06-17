import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

const CircularProgress = ({ value, max = 4.0, size = 110, strokeWidth = 8, color = 'var(--accent)' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value || 0, 0), max);
  const strokeDashoffset = circumference - (progress / max) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="var(--bg-tertiary)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const studentId = user?.studentId;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    cgpa: 0,
    gradedCourses: 0,
    creditHours: 0,
    semestersCount: 0,
    upcomingDeadlines: 0,
    pendingTasks: 0,
  });

  const [recentDeadlines, setRecentDeadlines] = useState([]);
  const [recentSemesters, setRecentSemesters] = useState([]);

  useEffect(() => {
    if (!studentId) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const [cgpaRes, semestersRes, deadlinesRes, taskProgressRes] = await Promise.all([
          api.get(`/students/${studentId}/cgpa`).catch(() => ({ data: { cgpa: 0, graded_courses: 0, total_credit_hours: 0 } })),
          api.get(`/students/${studentId}/semesters`).catch(() => ({ data: [] })),
          api.get(`/students/${studentId}/deadlines`).catch(() => ({ data: [] })),
          api.get(`/students/${studentId}/task-progress`).catch(() => ({ data: { totalTasks: 0, completedTasks: 0 } }))
        ]);

        const cgpaData = cgpaRes.data || {};
        const semestersData = semestersRes.data || [];
        const deadlinesData = deadlinesRes.data || [];
        const taskData = taskProgressRes.data || {};

        const pendingDeadlines = deadlinesData.filter(d => d.status?.toLowerCase() === 'pending');
        const sortedDeadlines = [...pendingDeadlines].sort((a, b) => new Date(a.due_date || a.dueDate) - new Date(b.due_date || b.dueDate));

        setStats({
          cgpa: cgpaData.cgpa ? parseFloat(cgpaData.cgpa) : 0,
          gradedCourses: cgpaData.graded_courses || 0,
          creditHours: cgpaData.total_credit_hours || 0,
          semestersCount: semestersData.length,
          upcomingDeadlines: pendingDeadlines.length,
          pendingTasks: Math.max(0, (taskData.totalTasks || 0) - (taskData.completedTasks || 0)),
        });

        setRecentDeadlines(sortedDeadlines.slice(0, 3));
        setRecentSemesters(semestersData.slice(-3).reverse());
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        setError('Could not load some dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [studentId]);

  const getGpaColor = (gpa) => {
    if (!gpa) return 'var(--text-muted)';
    if (gpa >= 3.5) return 'var(--accent-gold)'; // Gold for excellent success
    if (gpa >= 2.5) return 'var(--accent)'; // Soft blue for good standing
    return 'var(--warning)'; // Light orange warning for low gpa
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'var(--red)';
      case 'medium': return 'var(--warning)';
      default: return 'var(--success)';
    }
  };

  if (loading) {
    return <div className="loading" style={{ marginTop: '150px' }}>Analyzing dashboard workspace...</div>;
  }

  return (
    <div className="page-container" style={{ paddingBottom: '80px' }}>
      {/* Welcome Header */}
      <div className="page-header" style={{ marginBottom: '32px', animation: 'fadeInUp 0.4s ease' }}>
        <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
          Welcome back, {user?.name || 'Student'}!
        </h1>
        <p className="description" style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '6px' }}>
          Here is the summary of your academic path and tasks for today.
        </p>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Stats Cards Row (with horizontal scroll on mobile) */}
      <div className="stats-row-scrollable" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px',
      }}>
        {/* CGPA Card */}
        <div className="card stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', position: 'relative' }}>
          <div style={{ position: 'relative', width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <CircularProgress value={stats.cgpa} color={getGpaColor(stats.cgpa)} />
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '1.4rem', color: getGpaColor(stats.cgpa), lineHeight: 1 }}>
                {stats.cgpa ? stats.cgpa.toFixed(2) : '0.00'}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>OF 4.00</span>
            </div>
          </div>
          <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Current CGPA</h4>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
            {stats.gradedCourses} Graded Courses
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card stat-card" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            fontSize: '2.5rem',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            color: stats.upcomingDeadlines > 0 ? 'var(--warning)' : 'var(--text-muted)',
            marginBottom: '10px',
            lineHeight: 1
          }}>
            {stats.upcomingDeadlines}
          </div>
          <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center' }}>Upcoming Deadlines</h4>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center' }}>
            Assignments & exams pending
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="card stat-card" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            fontSize: '2.5rem',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            color: stats.pendingTasks > 0 ? 'var(--accent)' : 'var(--text-muted)',
            marginBottom: '10px',
            lineHeight: 1
          }}>
            {stats.pendingTasks}
          </div>
          <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center' }}>Pending Tasks</h4>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center' }}>
            Daily todo list checklist
          </div>
        </div>

        {/* Completed Semesters */}
        <div className="card stat-card" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            fontSize: '2.5rem',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            color: 'var(--success)',
            marginBottom: '10px',
            lineHeight: 1
          }}>
            {stats.semestersCount}
          </div>
          <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center' }}>Semesters</h4>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace" }}>
            {stats.creditHours} Total Credits
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Actions + Recent Activity */}
      <div className="dashboard-grid-layout" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '30px',
        marginTop: '20px'
      }}>
        {/* Left Column: Quick Actions */}
        <div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontFamily: "'Playfair Display', Georgia, serif", marginBottom: '16px', fontWeight: 600 }}>
            Quick Actions
          </h2>
          <div className="quick-actions-list" style={{ display: 'grid', gap: '14px' }}>
            <button
              onClick={() => navigate('/semesters')}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                fontWeight: 500,
                textAlign: 'left',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              className="action-btn-hover"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.25rem', color: 'var(--accent)' }}>📚</span>
                Add / View Semesters
              </span>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>→</span>
            </button>

            <button
              onClick={() => navigate('/mca-calculator')}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                fontWeight: 500,
                textAlign: 'left',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              className="action-btn-hover"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.25rem', color: 'var(--accent)' }}>🧮</span>
                Calculate MCA Grade
              </span>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>→</span>
            </button>

            <button
              onClick={() => navigate('/target-cgpa')}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                fontWeight: 500,
                textAlign: 'left',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              className="action-btn-hover"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.25rem', color: 'var(--accent)' }}>🎯</span>
                Plan Target CGPA
              </span>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>→</span>
            </button>

            <button
              onClick={() => navigate('/progress')}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                fontWeight: 500,
                textAlign: 'left',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              className="action-btn-hover"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.25rem', color: 'var(--accent)' }}>📋</span>
                Manage Study Checklist
              </span>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>→</span>
            </button>
          </div>
        </div>

        {/* Right Column: Upcoming Deadlines List */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontFamily: "'Playfair Display', Georgia, serif", margin: 0, fontWeight: 600 }}>
              Recent Deadlines
            </h2>
            <button
              onClick={() => navigate('/deadlines')}
              style={{
                background: 'transparent',
                color: 'var(--accent)',
                border: 'none',
                padding: '4px 8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
            >
              View All
            </button>
          </div>

          <div className="deadlines-list" style={{ display: 'grid', gap: '12px' }}>
            {recentDeadlines.length === 0 ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '8px' }}>🎉</span>
                No upcoming deadlines! Keep it up.
              </div>
            ) : (
              recentDeadlines.map((dl) => (
                <div
                  key={dl.id}
                  className="card deadline-row"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: `4px solid ${getPriorityColor(dl.priority || 'medium')}`,
                    marginTop: 0
                  }}
                >
                  <div style={{ overflow: 'hidden', marginRight: '12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {dl.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {dl.courseName || dl.course || 'Independent Task'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {String(dl.dueDate || dl.due_date).split('T')[0]}
                    </div>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      marginTop: '4px',
                      background: getPriorityColor(dl.priority || 'medium') + '1A',
                      color: getPriorityColor(dl.priority || 'medium')
                    }}>
                      {dl.priority || 'Medium'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Global CSS style overrides for dashboard */}
      <style>{`
        .action-btn-hover:hover {
          transform: translateY(-2px);
          border-color: var(--accent) !important;
          box-shadow: var(--shadow) !important;
        }
        .stat-card {
          margin-top: 0;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-3px);
        }
        @media (max-width: 600px) {
          .stats-row-scrollable {
            display: flex !important;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 12px;
          }
          .stat-card {
            flex: 0 0 240px;
            scroll-snap-align: start;
          }
          .dashboard-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;