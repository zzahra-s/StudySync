import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchWithToken } from '../utils/fetchWithToken';

const VALID_GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

const ScenarioDetail = () => {
  const { scenarioId } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = user.student_id;
  const navigate = useNavigate();

  const [scenario, setScenario] = useState(null);
  const [projection, setProjection] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [semesterCourses, setSemesterCourses] = useState([]);
  const [newCourseId, setNewCourseId] = useState('');
  const [newGrade, setNewGrade] = useState('A');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (scenarioId && studentId) loadAll();
  }, [scenarioId, studentId]);

  useEffect(() => {
    if (selectedSemesterId) fetchSemesterCourses(selectedSemesterId);
    else setSemesterCourses([]);
  }, [selectedSemesterId]);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [sRes, semRes] = await Promise.all([
        fetchWithToken(`http://localhost:5001/api/scenarios/${scenarioId}`),
        fetchWithToken(`http://localhost:5001/api/students/${studentId}/semesters`)
      ]);

      const sData = await sRes.json();
      if (!sRes.ok) {
        setError(sData.message || 'Failed to load scenario.');
        setLoading(false);
        return;
      }
      setScenario(sData);
      setNameInput(sData.scenario_name);

      const semData = await semRes.json();
      if (semRes.ok) setSemesters(semData);
      await loadProjection();
    } catch (err) {
      setError('Network error. Check the server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesterCourses = async (semesterId) => {
    try {
      const cRes = await fetchWithToken(`http://localhost:5001/api/semesters/${semesterId}/courses`);
      const cData = await cRes.json();
      if (cRes.ok) setSemesterCourses(cData);
      else setSemesterCourses([]);
    } catch (_) {
      setSemesterCourses([]);
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
    setError('');
    setMessage('');
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
    setError('');
    setMessage('');
    if (!selectedSemesterId) {
      setError('Please select a semester first.');
      return;
    }
    if (!newCourseId) {
      setError('Please select a course.');
      return;
    }
    const res = await fetchWithToken(`http://localhost:5001/api/scenarios/${scenarioId}/courses`, {
      method: 'POST',
      body: JSON.stringify({ course_id: parseInt(newCourseId, 10), expected_grade: newGrade }),
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
    setError('');
    setMessage('');
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

  if (loading) return <div className="loading">Loading scenario</div>;
  if (!scenario) return <p className="error">Scenario not found.</p>;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '20px' }}>
        <button className="back-btn" onClick={() => navigate('/scenarios')}>
          ← Back to Scenarios
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="card">
        {editingName ? (
          <form onSubmit={handleRename}>
            <div className="form-group">
              <label>Scenario Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit">Save Name</button>
              <button type="button" className="btn-secondary" onClick={() => setEditingName(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex-between">
            <div>
              <p className="gpa-label" style={{ marginBottom: 4 }}>Scenario</p>
              <h2 style={{ margin: 0 }}>{scenario.scenario_name}</h2>
            </div>
            <button className="btn-secondary" onClick={() => setEditingName(true)}>Rename</button>
          </div>
        )}
      </div>

      <div className="card card-center">
        <p className="gpa-label">Projected GPA</p>
        {projection && projection.projected_gpa !== null && projection.projected_gpa !== undefined ? (
          <>
            <p className="projected-gpa-big">{projection.projected_gpa}</p>
            <p className="projected-meta">
              {projection.course_count} course(s) · {projection.total_credit_hours} credit hours
            </p>
          </>
        ) : (
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
            Add courses with expected grades below to see your projected GPA.
          </p>
        )}
      </div>

      <div className="card">
        <h3>Courses in This Scenario</h3>
        {(!scenario.courses || scenario.courses.length === 0) ? (
          <div className="empty-state" style={{ padding: '16px 0' }}>
            <span className="emoji">📚</span>
            No courses added yet.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Code</th>
                <th>Credits</th>
                <th>Expected Grade</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {scenario.courses.map((c) => (
                <tr key={c.course_id}>
                  <td>{c.course_name}</td>
                  <td><code style={{ fontSize: '0.82rem' }}>{c.course_code}</code></td>
                  <td>{c.credit_hours}</td>
                  <td><span className="badge badge-indigo">{c.expected_grade}</span></td>
                  <td>
                    <button className="btn-danger" style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                      onClick={() => handleRemoveCourse(c.course_id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3>Add / Update a Course</h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: 16 }}>
          Choose a semester first, then pick one of its courses and assign an expected grade.
        </p>
        <form onSubmit={handleAddCourse}>
          <div className="form-group">
            <label>Semester</label>
            <select
              value={selectedSemesterId}
              onChange={(e) => {
                setSelectedSemesterId(e.target.value);
                setNewCourseId('');
              }}
            >
              <option value="">— Select semester —</option>
              {semesters.map((sem) => (
                <option key={sem.semester_id || sem.id} value={sem.semester_id || sem.id}>
                  {sem.semester_name || sem.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Course</label>
            <select value={newCourseId} onChange={(e) => setNewCourseId(e.target.value)} required>
              <option value="">— Select a course —</option>
              {semesterCourses.map((c) => (
                <option key={c.course_id || c.id} value={c.course_id || c.id}>
                  {c.course_name || c.name} ({c.course_code || c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Expected Grade</label>
            <select value={newGrade} onChange={(e) => setNewGrade(e.target.value)}>
              {VALID_GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={!selectedSemesterId || !newCourseId}>Add to Scenario</button>
        </form>
      </div>
    </div>
  );
};

export default ScenarioDetail;
