import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

    if (studentId) {
      fetchData();
    }
  }, [studentId]);

  if (loading) return <p>Loading GPA data...</p>;

  return (
    <div>
      <div className="nav-bar">
        <Link to="/dashboard">Back to Dashboard</Link>
        <Link to="/scenarios" style={{ marginLeft: '15px' }}>GPA Scenarios</Link>
      </div>

      <h2>GPA Dashboard</h2>

      {error && <p className="error">{error}</p>}

      {/*overall gpa*/}

      <div className="card">
        <h3>Overall CGPA</h3>
        {cgpaData && cgpaData.cgpa !== null ? (
          <div>
            <p><strong>CGPA:</strong> {cgpaData.cgpa}</p>
            <p><strong>Graded Courses:</strong> {cgpaData.graded_courses}</p>
            <p><strong>Total Credit Hours:</strong> {cgpaData.total_credit_hours}</p>
          </div>
        ) : (
          <p>No graded courses yet. Add grades to your courses to see your CGPA.</p>
        )}
      </div>
      {/* semester wise gpa*/}
      <div className="card">
        <h3>Semester-wise GPA</h3>
        {semesterGPAs.length === 0 ? (
          <p>No semester GPA data available yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Semester</th>
                <th style={thStyle}>GPA</th>
                <th style={thStyle}>Graded Courses</th>
                <th style={thStyle}>Credit Hours</th>
              </tr>
            </thead>
            <tbody>
              {semesterGPAs.map((sem) => (
                <tr key={sem.semester_id}>
                  <td style={tdStyle}>{sem.semester_name}</td>
                  <td style={tdStyle}>{sem.semester_gpa}</td>
                  <td style={tdStyle}>{sem.graded_courses}</td>
                  <td style={tdStyle}>{sem.total_credit_hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const thStyle = { borderBottom: '2px solid #ccc', padding: '8px', textAlign: 'left' };
const tdStyle = { borderBottom: '1px solid #eee', padding: '8px' };

export default GPADashboard;