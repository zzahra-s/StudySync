import React, { useEffect, useState } from 'react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

function CourseMaterialsPage() {
  const { user } = useAuth();
  const studentId = user?.studentId || user?.id;
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');

  const fetchCourses = async () => {
    try {
      const response = await api.get(`/students/${studentId}/courses`);
      setCourses(response.data || []);
      if (response.data?.length > 0) {
        setSelectedCourseId(response.data[0].id);
      }
    } catch (err) {
      setCourses([]);
    }
  };

  const fetchMaterials = async (courseId) => {
    if (!courseId) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/courses/${courseId}/materials`);
      setMaterials(response.data || []);
    } catch (err) {
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [studentId]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchMaterials(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedCourseId) {
      setError('Please select a file and course');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('courseId', selectedCourseId);
    formData.append('studentId', studentId);

    try {
      await api.post('/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFile(null);
      setDescription('');
      fetchMaterials(selectedCourseId);
    } catch (err) {
      setError('Failed to upload file');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this material?')) {
      try {
        await api.delete(`/materials/${id}`);
        fetchMaterials(selectedCourseId);
      } catch (err) {
        setError('Failed to delete material');
      }
    }
  };

  const styles = {
    container: { padding: '20px', maxWidth: '900px', margin: '0 auto' },
    selector: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: 'bold' },
    select: { padding: '8px', width: '100%', maxWidth: '300px', borderRadius: '4px', border: '1px solid #ccc' },
    form: { border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px', maxWidth: '500px' },
    input: { display: 'block', width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
    fileInput: { display: 'block', marginBottom: '10px' },
    btn: { padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    deleteBtn: { padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    materialRow: { border: '1px solid #ddd', padding: '12px', marginBottom: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    materialInfo: { flex: 1 }
  };

  return (
    <div style={styles.container}>
      <h1>Course Materials</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={styles.selector}>
        <label style={styles.label}>Select Course:</label>
        {courses.length > 0 ? (
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            style={styles.select}
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name || course.title}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Enter course ID"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            style={styles.select}
          />
        )}
      </div>

      <div style={styles.form}>
        <h3>Upload Material</h3>
        <form onSubmit={handleUpload}>
          <input
            type="file"
            onChange={handleFileChange}
            style={styles.fileInput}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.btn}>Upload</button>
        </form>
      </div>

      {loading && <p>Loading materials...</p>}

      <div>
        <h3>Materials</h3>
        {materials.length > 0 ? (
          materials.map(material => (
            <div key={material.id} style={styles.materialRow}>
              <div style={styles.materialInfo}>
                <p><strong>{material.fileName || material.name}</strong></p>
                <p>{material.description}</p>
                {material.uploadDate && <p><small>Uploaded: {material.uploadDate}</small></p>}
                {material.url && <a href={material.url} target="_blank" rel="noopener noreferrer">Download</a>}
              </div>
              <button onClick={() => handleDelete(material.id)} style={styles.deleteBtn}>Delete</button>
            </div>
          ))
        ) : (
          <p>No materials yet</p>
        )}
      </div>
    </div>
  );
}

export default CourseMaterialsPage;
