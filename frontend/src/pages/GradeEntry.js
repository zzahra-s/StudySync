import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithToken } from '../utils/fetchWithToken';

const GradeEntry = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [grade, setGrade] = useState('');
  const [existingGradeId, setExistingGradeId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGrade = async () => {
      try {
        const response = await fetchWithToken(`http://localhost:5001/api/courses/${courseId}/grade`);
        const data = await response.json();
        if (response.ok && data) {
          setExistingGradeId(data.grade_id || data.id);
          setGrade(data.letter_grade || data.grade || '');
        }
      } catch (err) {
        console.error('Error fetching grade:', err);
      }
    };
    fetchGrade();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (existingGradeId) {
        const response = await fetchWithToken(`http://localhost:5001/api/grades/${existingGradeId}`, {
          method: 'PUT',
          body: JSON.stringify({ letter_grade: grade })
        });
        if (response.ok) {
          setMessage('Grade updated successfully!');
          setTimeout(() => navigate(-1), 1500); // Go back automatically
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

  return (
    <div className="page-container">

      <h2>Enter/Edit Grade</h2>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Grade (e.g., A, B, C, 95):</label>
            <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} required />
          </div>
          <button type="submit">Save Grade</button>
        </form>
      </div>
    </div>
  );
};

export default GradeEntry;
