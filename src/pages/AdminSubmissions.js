import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';

const AdminSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSubmissions();
      setSubmissions(res.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch submissions.');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '90px' }}>
      <h2 className="mb-4 fw-bold text-primary"><i className="bi bi-file-earmark-arrow-up me-2"></i>All Student Submissions</h2>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading submissions...</span>
          </div>
          <p className="mt-3">Loading submissions...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : submissions.length === 0 ? (
        <div className="text-muted">No submissions yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Student</th>
                <th>Mentor</th>
                <th>Title</th>
                <th>File</th>
                <th>Uploaded</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub._id}>
                  <td>{sub.student?.name || 'Unknown'}</td>
                  <td>{sub.mentor?.name || 'Unassigned'}</td>
                  <td>{sub.title}</td>
                  <td>
                    {sub.cloudinaryUrl ? (
                      <a href={sub.cloudinaryUrl} target="_blank" rel="noopener noreferrer">{sub.originalName}</a>
                    ) : (
                      sub.originalName
                    )}
                  </td>
                  <td>{new Date(sub.submissionDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${
                      sub.status === 'approved' ? 'bg-success' :
                      sub.status === 'reviewed' ? 'bg-warning' : 'bg-secondary'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSubmissions; 