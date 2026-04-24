import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchWithToken } from '../utils/fetchWithToken';
const VALID_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'F'];

const ScenarioDetail = () => {
  const { scenarioId } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = user.student_id;

  const [scenario, setScenario] = useState(null);      
  const [projection, setProjection] = useState(null); 
  const [allCourses, setAllCourses] = useState([]);    
  const [newCourseId, setNewCourseId] = useState(''); 
  const [newGrade, setNewGrade] = useState('A');        
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (scenarioId && studentId) {
      loadAll();
    }
  }, [scenarioId, studentId]);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const sRes = await fetchWithToken(`http://localhost:5001/api/scenarios/${scenarioId}`);
      const sData = await sRes.json();
      if (!sRes.ok) { setError(sData.message || 'Failed to load scenario.'); setLoading(false); return; }
      setScenario(sData);
      setNameInput(sData.scenario_name);
      await loadProjection();
      const cRes = await fetchWithToken(`http://localhost:5001/api/students/${studentId}/courses`);
      const cData = await cRes.json();
      if (cRes.ok) setAllCourses(cData);

    } catch (err) {
      setError('Network error check server');
    } finally {
      setLoading(false);
    }
  };

  const loadProjection = async () => {
    try {
      const pRes = await fetchWithToken(`http://localhost:5001/api/scenarios/${scenarioId}/projection`);
      const pData = await pRes.json();
      if (pRes.ok) setProjection(pData);
    } catch (_) {}
  };

  const handleRename = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    const res = await fetchWithToken(`http://localhost:5001/api/scenarios/${scenarioId}`, {
      method: 'PUT',
      body: JSON.stringify({ scenario_name: nameInput }),
    });
    const data = await res.json();
    if (res.ok) {
      setScenario((prev) => ({ ...prev, scenario_name: nameInput }));
      setEditingName(false);
      setMessage('Scenario renamed successfully.');
    } else {
      setError(data.message || 'Failed to rename.');
    }
  };
  const handleAddCourse = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!newCourseId) { setError('Please select a course.'); return; }
    const res = await fetchWithToken(`http://localhost:5001/api/scenarios/${scenarioId}/courses`, {
      method: 'POST',
      body: JSON.stringify({ course_id: parseInt(newCourseId), expected_grade: newGrade }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
      setNewCourseId('');
      setNewGrade('A');
      await loadAll(); 
    } else {
      setError(data.message || 'Failed to add course to scenario.');
    }
  };


  const handleRemoveCourse = async (courseId) => {
    setError(''); setMessage('');
    const res = await fetchWithToken(
      `http://localhost:5001/api/scenarios/${scenarioId}/courses/${courseId}`,
      { method: 'DELETE' }
    );
    const data = await res.json();
    if (res.ok) {
      setMessage('Course removed from scenario.');
      await loadAll();
    } else {
      setError(data.message || 'Failed to remove course.');
    }
  };

  if (loading) return <p>Loading scenario...</p>;
  if (!scenario) return <p>Scenario not found.</p>;


  return (
    <div>
      <div className="nav-bar">
        <Link to="/scenarios">← Back to Scenarios</Link>
      </div>
                <div className="nav-bar">
               <Link to="/dashboard">Back to Dashboard</Link>
            </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {/*scenario name */}
      <div className="card">
        {editingName ? (
          <form onSubmit={handleRename}>
            <div className="form-group">
              <label>Scenario Name:</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
              />
            </div>
            <button type="submit">Save Name</button>
            <button
              type="button"
              onClick={() => setEditingName(false)}
              style={{ background: '#6c757d', marginLeft: '10px' }}
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex-between">
            <h2>{scenario.scenario_name}</h2>
            <button onClick={() => setEditingName(true)}>Rename</button>
          </div>
        )}
      </div>

      {/*proejcted gpa*/}
      <div className="card">
        <h3>Projected GPA</h3>
        {projection && projection.projected_gpa !== null && projection.projected_gpa !== undefined ? (
          <div>
            <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{projection.projected_gpa}</p>
            <p>{projection.course_count} course(s) · {projection.total_credit_hours} credit hours</p>
          </div>
        ) : (
          <p>Add courses with expected grades below to see your projected GPA.</p>
        )}
      </div>

      {/*courses in scenario*/}
      <div className="card">
        <h3>Courses in This Scenario</h3>
        {(!scenario.courses || scenario.courses.length === 0) ? (
          <p>No courses added yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Course</th>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Credits</th>
                <th style={thStyle}>Expected Grade</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {scenario.courses.map((c) => (
                <tr key={c.course_id}>
                  <td style={tdStyle}>{c.course_name}</td>
                  <td style={tdStyle}>{c.course_code}</td>
                  <td style={tdStyle}>{c.credit_hours}</td>
                  <td style={tdStyle}>{c.expected_grade}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleRemoveCourse(c.course_id)}
                      style={{ background: '#dc3545' }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/*add course*/}
      <div className="card">
        <h3>Add / Update a Course</h3>
        <p style={{ fontSize: '0.9em', color: '#555' }}>
          Pick any of your courses and assign an expected grade. If the course is already in the
          scenario, its grade will be updated.
        </p>
        <form onSubmit={handleAddCourse}>
          <div className="form-group">
            <label>Course:</label>
            <select value={newCourseId} onChange={(e) => setNewCourseId(e.target.value)} required>
              <option value="">-- Select a course --</option>
              {allCourses.map((c) => (
                <option key={c.course_id} value={c.course_id}>
                  {c.course_name} ({c.course_code}) — {c.semester_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Expected Grade:</label>
            <select value={newGrade} onChange={(e) => setNewGrade(e.target.value)}>
              {VALID_GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <button type="submit">Add to Scenario</button>
        </form>
      </div>
    </div>
  );
};

const thStyle = { borderBottom: '2px solid #ccc', padding: '8px', textAlign: 'left' };
const tdStyle = { borderBottom: '1px solid #eee', padding: '8px' };

export default ScenarioDetail;