import React, { useState, useEffect } from 'react';
import { fetchWithToken } from '../utils/fetchWithToken';

const GPADashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = user.student_id;

  const [cgpaData, setCgpaData] = useState(null);
  const [semesterGPAs, setSemesterGPAs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const cgpaRes = await fetchWithToken(`http://localhost:5001/api/students/${studentId}/cgpa`);
        const cgpaJson = await cgpaRes.json();
        if (cgpaRes.ok) {
          setCgpaData(cgpaJson);
        } else {
          setError(cgpaJson.message || 'Failed to load CGPA.');
        }

        const semRes = await fetchWithToken(`http://localhost:5001/api/students/${studentId}/semester-gpa`);
        const semJson = await semRes.json();
        if (semRes.ok) {
          setSemesterGPAs(semJson.semesters || []);
        } else {
          setError(semJson.message || 'Failed to load semester GPAs.');
        }
      } catch (err) {
        setError('Network error. Is the server running?');
      } finally {
        setLoading(false);
      }
    };
    if (studentId) fetchData();
  }, [studentId]);

  if (loading) return <div className="loading">Loading GPA data</div>;

  const gpaColor = (gpa) => {
    if (!gpa) return 'var(--text-muted)';
    if (gpa >= 3.5) return 'var(--green)';
    if (gpa >= 2.5) return 'var(--indigo)';
    return 'var(--red)';
  };

  return (
    <div className="page-container">

      <div className="page-header">
        <h1 className="page-title">GPA Dashboard</h1>
        <p className="description">Track your cumulative and semester-wise academic performance.</p>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="card">
        <h3>Overall CGPA</h3>
        {cgpaData && cgpaData.cgpa !== null ? (
          <>
            <p className="gpa-number" style={{ color: gpaColor(cgpaData.cgpa) }}>
              {cgpaData.cgpa}
            </p>
            <div className="stat-row">
              <div className="stat-box">
                <div className="stat-val">{cgpaData.graded_courses}</div>
                <div className="stat-lbl">Graded Courses</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">{cgpaData.total_credit_hours}</div>
                <div className="stat-lbl">Credit Hours</div>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <span className="emoji">🎓</span>
            No graded courses yet. Add grades to see your CGPA.
          </div>
        )}
      </div>

      <div className="card">
        <h3>Semester-wise GPA</h3>
        {semesterGPAs.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            No semester GPA data available yet.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Semester</th>
                <th>GPA</th>
                <th>Graded Courses</th>
                <th>Credit Hours</th>
              </tr>
            </thead>
            <tbody>
              {semesterGPAs.map((sem) => (
                <tr key={sem.semester_id}>
                  <td>{sem.semester_name}</td>
                  <td>
                    <strong style={{ color: gpaColor(sem.semester_gpa) }}>
                      {sem.semester_gpa}
                    </strong>
                  </td>
                  <td>{sem.graded_courses}</td>
                  <td>{sem.total_credit_hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GPADashboard;
