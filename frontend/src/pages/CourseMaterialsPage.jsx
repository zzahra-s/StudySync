import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

function CourseMaterialsPage() {
  const { user } = useAuth();
  const studentId = user?.studentId;

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDescription, setUploadDescription] = useState('');

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toISOString().split('T')[0];
  };

  const fetchCourses = async () => {
    if (!studentId) return;

    try {
      const response = await api.get(`/students/${studentId}/courses`);
      const list = Array.isArray(response.data) ? response.data : [];
      setCourses(list);
      if (list.length > 0) {
        const defaultId = list[0].id || list[0].course_id;
        setSelectedCourseId(String(defaultId || ''));
      }
    } catch {
      setCourses([]);
    }
  };

  const fetchMaterials = async (courseId) => {
    if (!courseId) {
      setMaterials([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/courses/${courseId}/materials`);
      const list = Array.isArray(response.data) ? response.data : [];
      setMaterials(list);
    } catch (err) {
      setMaterials([]);
      setError(err?.response?.data?.message || 'Failed to load materials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [studentId]);

  useEffect(() => {
    fetchMaterials(selectedCourseId);
  }, [selectedCourseId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      await api.delete(`/materials/${id}`);
      fetchMaterials(selectedCourseId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete material.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !selectedCourseId) {
      setError('Please select a course and file.');
      return;
    }

    setError('');

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('courseId', selectedCourseId);
      formData.append('description', uploadDescription);
      await api.post('/materials', formData);

      setUploadFile(null);
      setUploadDescription('');
      fetchMaterials(selectedCourseId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to upload material.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Course Materials</h1>

      <div style={{ marginBottom: '12px' }}>
        <label htmlFor="courseSelect">Course: </label>
        {courses.length > 0 ? (
          <select
            id="courseSelect"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            {courses.map((course) => {
              const courseId = course.id || course.course_id;
              return (
                <option key={courseId} value={courseId}>
                  {course.course_name || course.courseName || course.name || `Course ${courseId}`}
                </option>
              );
            })}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Enter course ID"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          />
        )}
      </div>

      <form onSubmit={handleUpload} style={{ border: '1px solid #ddd', padding: '12px', marginBottom: '16px' }}>
        <h3>Upload Material</h3>
        <div style={{ marginBottom: '8px' }}>
          <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} required />
        </div>
        <div style={{ marginBottom: '8px' }}>
          <input
            type="text"
            placeholder="Description (optional)"
            value={uploadDescription}
            onChange={(e) => setUploadDescription(e.target.value)}
          />
        </div>
        <button type="submit">Upload</button>
      </form>

      {loading && <p>Loading materials...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        {materials.length === 0 && !loading ? (
          <p>No materials</p>
        ) : (
          materials.map((material) => {
            const id = material.id || material.material_id;
            const fileName = material.materialName || material.fileName || material.file_name || 'File';
            const fileUrl = material.fileUrl || material.url;
            const uploadedAt = material.uploadedAt || material.uploadDate || material.uploaded_at;

            return (
              <div key={id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '8px' }}>
                <p><strong>{fileName}</strong></p>
                <p>Uploaded: {formatDate(uploadedAt)}</p>
                {fileUrl ? (
                  <a href={fileUrl} target="_blank" rel="noreferrer">Download</a>
                ) : (
                  <span>No download URL</span>
                )}
                <div style={{ marginTop: '8px' }}>
                  <button type="button" onClick={() => handleDelete(id)}>Delete</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CourseMaterialsPage;