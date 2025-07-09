import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionAPI, userAPI, mentorAPI, authHelpers } from '../services/api';

const SessionScheduler = ({ onSessionCreated, onError, students: propStudents, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    description: '',
    datetime: '',
    duration: 60,
    studentId: '',
    meetingLink: '',
    notes: ''
  });
  const [students, setStudents] = useState(propStudents || []);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(''); // <-- Add local error state
  const navigate = useNavigate();

  useEffect(() => {
    if (!propStudents) {
      fetchStudents();
    }
  }, [fetchStudents]);

  const fetchStudents = async () => {
    try {
      const userRole = authHelpers.getUserRole();
      if (userRole === 'mentor') {
        const res = await mentorAPI.getAssignedStudents();
        setStudents(res.data.data || []);
      } else if (userRole === 'admin') {
        const res = await userAPI.getAllUsers();
        setStudents((res.data.data || []).filter(u => u.role === 'student'));
      }
    } catch (err) {
      if (onError) onError('Failed to fetch students');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) throw new Error('Session title is required');
    if (!formData.topic.trim()) throw new Error('Session topic is required');
    if (!formData.datetime) throw new Error('Session date and time is required');
    if (!formData.studentId) throw new Error('Please select a student');
    const selectedDate = new Date(formData.datetime);
    const now = new Date();
    if (selectedDate <= now) throw new Error('Session must be scheduled for a future date and time');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      validateForm();
      setSubmitting(true);
      const userRole = authHelpers.getUserRole();
      const payload = {
        ...formData,
        studentId: formData.studentId,
        topic: formData.topic,
        duration: formData.duration,
        meetingLink: formData.meetingLink,
        notes: formData.notes
      };
      await sessionAPI.createSession(payload);
      if (onSessionCreated) onSessionCreated();
      // Only close modal/redirect on success
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'mentor') {
        navigate('/mentor');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      let backendMessage = err?.response?.data?.message;
      setLocalError(backendMessage || err.message || 'Failed to schedule session');
      if (onError) onError(backendMessage || err.message || 'Failed to schedule session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {onClose && (
        <button
          type="button"
          className="btn-close position-absolute end-0 top-0 m-2"
          aria-label="Close"
          onClick={onClose}
        ></button>
      )}
      {localError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {localError}
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setLocalError('')}></button>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        {/* ...existing form fields... */}
        {/* Add your form fields here as before */}
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Session Title *</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter session title"
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="topic" className="form-label">Session Topic *</label>
              <input
                type="text"
                className="form-control"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder="Enter session topic"
                required
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="studentId" className="form-label">Select Student *</label>
              <select
                className="form-select"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select student</option>
                {students.map(student => (
                  <option key={student._id} value={student._id}>{student.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="datetime" className="form-label">Date & Time *</label>
              <input
                type="datetime-local"
                className="form-control"
                id="datetime"
                name="datetime"
                value={formData.datetime}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="duration" className="form-label">Duration (minutes)</label>
              <select
                className="form-select"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="meetingLink" className="form-label">Google Meet Link</label>
              <input
                type="url"
                className="form-control"
                id="meetingLink"
                name="meetingLink"
                value={formData.meetingLink}
                onChange={handleInputChange}
                placeholder="https://meet.google.com/..."
              />
            </div>
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            placeholder="Enter session description"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="notes" className="form-label">Notes</label>
          <textarea
            className="form-control"
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="2"
            placeholder="Any additional notes"
          />
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
          {submitting ? 'Scheduling...' : 'Schedule Session'}
        </button>
      </form>
    </div>
  );
};

export default SessionScheduler; 