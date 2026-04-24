import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithToken } from '../utils/fetchWithToken';

const GradeEntry = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [grade, setGrade] = useState('');
  const [comments, setComments] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGrade = async () => {
      try {
        const response = await fetchWithToken(`http://localhost:5001/api/courses/${courseId}/grade`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.letter_grade) {
            setGrade(data.letter_grade);
            setComments(data.comments || '');
          }
        }
      } catch (err) {
        // Silent error if no grade exists yet
      }
    };
    fetchGrade();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      // Your backend uses POST to both create and update for a specific courseId
      const response = await fetchWithToken(`http://localhost:5001/api/courses/${courseId}/grade`, {
        method: 'POST',
        body: JSON.stringify({ 
          letter_grade: grade.toUpperCase(), 
          comments: comments 
        })
      });

      if (response.ok) {
        setMessage('Grade saved successfully!');
        setTimeout(() => navigate(-1), 1500);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save grade. Ensure it is a valid letter grade (A, B+, etc)');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  return (
    <div>
      <div className="nav-bar">
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', margin: 0, padding: 0, color: '#fff', textDecoration: 'underline', cursor: 'pointer', border: 'none' }}>
           ← Back to Courses
        </button>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h2>Record Grade</h2>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Letter Grade:</label>
            <input 
              type="text" 
              placeholder="e.g. A, B+, B, C" 
              value={grade} 
              onChange={(e) => setGrade(e.target.value)} 
              required 
            />
            <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
              Valid grades: A, A-, B+, B, B-, C+, C, F
            </small>
          </div>
          <div className="form-group">
            <label>Comments (Optional):</label>
            <textarea 
              value={comments} 
              onChange={(e) => setComments(e.target.value)}
              placeholder="How did you do?"
              style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            ></textarea>
          </div>
          <button type="submit">Save Grade</button>
        </form>
      </div>
    </div>
  );
};

export default GradeEntry;
