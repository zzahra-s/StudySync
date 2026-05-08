import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const features = [
    {
      title: 'GPA Tracker',
      description: 'Track your cumulative GPA and project future semester grades.',
      icon: '📈',
      path: '/gpa',
      color: '#6f42c1'
    },
    {
      title: 'Academic Progress',
      description: 'View your semesters, courses, and track your GPA performance.',
      icon: '📊',
      path: '/semesters',
      color: '#4e73df'
    },
    {
      title: 'Upcoming Deadlines',
      description: 'Never miss an assignment. View and manage your course deadlines.',
      icon: '⏰',
      path: '/deadlines',
      color: '#e74a3b'
    },
    {
      title: 'Task Manager',
      description: 'Keep track of your daily study tasks and progress per course.',
      icon: '📋',
      path: '/progress',
      color: '#1cc88a'
    },
    {
      title: 'Course Materials',
      description: 'Access and organize your lecture notes and study guides.',
      icon: '📁',
      path: '/materials',
      color: '#f6c23e'
    },
    {
      title: 'Books & Resources',
      description: 'Manage your textbooks and additional reading materials.',
      icon: '📚',
      path: '/books',
      color: '#36b9cc'
    },
    {
      title: 'Student Profile',
      description: 'Update your personal information and account settings.',
      icon: '👤',
      path: '/profile',
      color: '#858796'
    }
  ];

  return (
    <div className="page-container" style={{ textAlign: 'center' }}>
      <header className="page-header" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
          <img src="/logo.png" alt="StudySync Logo" style={{ height: '180px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }} />
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', margin: 0, color: '#111', letterSpacing: '-1px' }}>StudySync</h1>
        </div>
        <h2 className="page-title" style={{ fontSize: '1.5rem', fontWeight: '500', color: '#666' }}>
          Welcome back, {user.full_name || 'Student'}!
        </h2>
        <p className="description">Here is an overview of your academic workspace.</p>
      </header>

      <div className="dashboard-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="card interactive-card" 
            onClick={() => navigate(feature.path)}
            style={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderLeft: `5px solid ${feature.color}`
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>{feature.icon}</div>
            <h3 style={{ margin: '0 0 8px 0', color: feature.color }}>{feature.title}</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{feature.description}</p>
          </div>
        ))}
      </div>

      <style>{`
        .interactive-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.1);
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
