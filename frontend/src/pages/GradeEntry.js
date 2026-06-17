import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithToken } from '../utils/fetchWithToken';

// Grade mapping with corresponding grade points
const GRADE_SCALE = [
  { letter: 'A+', points: 4.00 },
  { letter: 'A', points: 4.00 },
  { letter: 'A-', points: 3.70 },
  { letter: 'B+', points: 3.30 },
  { letter: 'B', points: 3.00 },
  { letter: 'B-', points: 2.70 },
  { letter: 'C+', points: 2.30 },
  { letter: 'C', points: 2.00 },
  { letter: 'C-', points: 1.70 },
  { letter: 'D+', points: 1.30 },
  { letter: 'D', points: 1.00 },
  { letter: 'F', points: 0.00 }
];

const GradeEntry = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [grade, setGrade] = useState('');
  const [existingGradeId, setExistingGradeId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [courseName, setCourseName] = useState('');

  // Get grade points for selected grade
  const getGradePoints = (selectedGrade) => {
    const gradeObj = GRADE_SCALE.find(g => g.letter === selectedGrade);
    return gradeObj ? gradeObj.points : null;
  };

  useEffect(() => {
    const fetchGrade = async () => {
      try {
        const response = await fetchWithToken(`http://localhost:5001/api/courses/${courseId}/grade`);
        const data = await response.json();
        if (response.ok && data) {
          setExistingGradeId(data.grade_id || data.id);
          setGrade(data.letter_grade || data.grade || '');
        }

        // Also fetch course name to show in header
        const courseRes = await fetchWithToken(`http://localhost:5001/api/courses/${courseId}`);
        const courseData = await courseRes.json();
        if (courseRes.ok && courseData) {
          setCourseName(courseData.course_name || courseData.name || 'Course');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchGrade();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!grade) {
      setError('Please select a grade');
      return;
    }

    try {
      if (existingGradeId) {
        const response = await fetchWithToken(`http://localhost:5001/api/grades/${existingGradeId}`, {
          method: 'PUT',
          body: JSON.stringify({ letter_grade: grade })
        });
        if (response.ok) {
          setMessage('Grade updated successfully!');
          setTimeout(() => navigate(-1), 1500);
        } else {
          setError('Failed to update grade.');
        }
      } else {
        const response = await fetchWithToken(`http://localhost:5001/api/courses/${courseId}/grade`, {
          method: 'POST',
          body: JSON.stringify({ letter_grade: grade })
        });
        if (response.ok) {
          setMessage('Grade saved successfully!');
          setTimeout(() => navigate(-1), 1500);
        } else {
          setError('Failed to save grade.');
        }
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  const selectedGradePoints = getGradePoints(grade);

  return (
    <div className="page-container">
      <h2>Enter/Edit Grade</h2>
      <p className="description">{courseName}</p>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="grade-select">Select Grade *</label>
            <select
              id="grade-select"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
              style={{
                padding: '10px',
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                width: '100%'
              }}
            >
              <option value="">— Choose a Grade —</option>
              {GRADE_SCALE.map((g) => (
                <option key={g.letter} value={g.letter}>
                  {g.letter} ({g.points.toFixed(2)} points)
                </option>
              ))}
            </select>
          </div>

          {grade && selectedGradePoints !== null && (
            <div
              style={{
                backgroundColor: '#e7f3ff',
                border: '1px solid #2196F3',
                borderRadius: '4px',
                padding: '12px',
                marginBottom: '16px',
                textAlign: 'center'
              }}
            >
              <p style={{ margin: '0', fontSize: '14px', color: '#555' }}>Grade Points</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
                {selectedGradePoints.toFixed(2)}
              </p>
            </div>
          )}

          <button type="submit" style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
            Save Grade
          </button>
        </form>
      </div>
    </div>
  );
};

export default GradeEntry;
