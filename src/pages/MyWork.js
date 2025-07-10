import React, { useEffect, useState } from 'react';
import { studentAPI } from '../services/api';
import { getFileIcon, formatFileSize, openFile } from '../utils/fileUtils';

const MyWork = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getTasks();
      setTasks(response.data.data || []);
    } catch (err) {
      setError('Failed to load your work. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="container">
        <h2 className="mb-4 text-primary">My Work</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading your work...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="bi bi-file-earmark-text fs-1 mb-3"></i>
            <p>No work uploaded yet.</p>
          </div>
        ) : (
          <div className="row">
            {tasks.map(task => (
              <div key={task._id || task.filename} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                      <i className={`${getFileIcon(task.mimeType, task.originalname)} fs-4 me-2 text-primary`}></i>
                      <h6 className="card-title mb-0">{task.originalname || task.filename}</h6>
                    </div>
                    <p className="card-text small text-muted mb-1">
                      <i className="bi bi-calendar me-1"></i>
                      Uploaded: {task.uploadedAt ? new Date(task.uploadedAt).toLocaleDateString() : 'N/A'}
                    </p>
                    {task.fileSize && (
                      <p className="card-text small text-muted mb-1">
                        <i className="bi bi-hdd me-1"></i>
                        Size: {formatFileSize(task.fileSize)}
                      </p>
                    )}
                    <p className="card-text small mb-2">
                      <span className={`badge ${task.status === 'approved' ? 'bg-success' : task.status === 'reviewed' ? 'bg-warning' : 'bg-secondary'}`}>{task.status || 'pending'}</span>
                    </p>
                    <button
                      onClick={() => openFile(task.cloudinaryUrl || `/api/upload/${task.filename}`)}
                      className="btn btn-outline-primary btn-sm me-2"
                    >
                      <i className="bi bi-eye me-1"></i>
                      View
                    </button>
                    <a
                      href={task.cloudinaryUrl || `/api/upload/${task.filename}`}
                      download={task.originalname || task.filename}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      <i className="bi bi-download me-1"></i>
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyWork; 