import React, { useState, useEffect, useCallback } from 'react';
import { sessionAPI } from '../services/api';
import { authHelpers } from '../services/api';

const SessionList = ({ view = 'all', onSessionUpdate, onError }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    requestedDate: '',
    reason: ''
  });

  const userRole = authHelpers.getUserRole();

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      
      switch (view) {
        case 'upcoming':
          response = await sessionAPI.getAllSessions();
          response.data = response.data.filter(session => 
            new Date(session.datetime) > new Date() && 
            ['scheduled', 'rescheduled'].includes(session.status)
          );
          break;
        case 'completed':
          response = await sessionAPI.getAllSessions();
          response.data = response.data.filter(session => 
            session.status === 'completed'
          );
          break;
        default:
          response = await sessionAPI.getAllSessions();
      }
      
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      onError('Failed to load sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [view, onError]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRescheduleRequest = async (e) => {
    e.preventDefault();
    
    if (!rescheduleData.requestedDate || !rescheduleData.reason.trim()) {
      onError('Please provide both date and reason for reschedule request.');
      return;
    }

    try {
      const response = await sessionAPI.updateSession(selectedSession._id, {
        ...rescheduleData,
        requestedDate: new Date(rescheduleData.requestedDate).toISOString()
      });
      
      setShowRescheduleModal(false);
      setSelectedSession(null);
      setRescheduleData({ requestedDate: '', reason: '' });
      fetchSessions();
      onSessionUpdate && onSessionUpdate(response.data);
    } catch (error) {
      console.error('Error requesting reschedule:', error);
      const errorMessage = error.response?.data?.message || 'Failed to request reschedule';
      onError(errorMessage);
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      const response = await sessionAPI.updateSession(sessionId, { status: 'completed' });
      fetchSessions();
      onSessionUpdate && onSessionUpdate(response.data);
    } catch (error) {
      console.error('Error completing session:', error);
      onError('Failed to complete session');
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) {
      return;
    }

    try {
      const response = await sessionAPI.updateSession(sessionId, { status: 'cancelled' });
      fetchSessions();
      onSessionUpdate && onSessionUpdate(response.data);
    } catch (error) {
      console.error('Error cancelling session:', error);
      onError('Failed to cancel session');
    }
  };

  const formatDateTime = (datetime) => {
    return new Date(datetime).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { class: 'bg-primary', text: 'Scheduled' },
      completed: { class: 'bg-success', text: 'Completed' },
      cancelled: { class: 'bg-danger', text: 'Cancelled' },
      rescheduled: { class: 'bg-warning', text: 'Rescheduled' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    
    return (
      <span className={`badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      return new Date(session.datetime) > new Date() && 
             ['scheduled', 'rescheduled'].includes(session.status);
    }
    if (filter === 'completed') return session.status === 'completed';
    if (filter === 'cancelled') return session.status === 'cancelled';
    return true;
  });

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading sessions...</p>
      </div>
    );
  }

  return (
    <div className="session-list">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>
          <i className="fas fa-calendar-alt me-2"></i>
          Sessions ({filteredSessions.length})
        </h5>
        
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn btn-outline-primary ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`btn btn-outline-primary ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button
            type="button"
            className={`btn btn-outline-primary ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="text-center py-4">
          <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
          <p className="text-muted">No sessions found.</p>
        </div>
      ) : (
        <div className="row">
          {filteredSessions.map(session => (
            <div key={session._id} className="col-md-6 col-lg-4 mb-3">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">{session.title}</h6>
                  {getStatusBadge(session.status)}
                </div>
                <div className="card-body">
                  <p className="card-text small text-muted mb-2">
                    <i className="fas fa-clock me-1"></i>
                    {formatDateTime(session.datetime)}
                  </p>
                  
                  <p className="card-text small text-muted mb-2">
                    <i className="fas fa-hourglass-half me-1"></i>
                    {session.duration} minutes
                  </p>

                  {session.description && (
                    <p className="card-text small mb-2">
                      {session.description}
                    </p>
                  )}

                  {userRole === 'student' && session.mentor && (
                    <p className="card-text small mb-2">
                      <strong>Mentor:</strong> {session.mentor.name}
                    </p>
                  )}

                  {userRole === 'mentor' && session.student && (
                    <p className="card-text small mb-2">
                      <strong>Student:</strong> {session.student.name}
                    </p>
                  )}

                  {session.meetingLink && (
                    <a 
                      href={session.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary mb-2"
                    >
                      <i className="fas fa-video me-1"></i>
                      Join Meeting
                    </a>
                  )}

                  <div className="session-actions">
                    {userRole === 'student' && 
                     session.status === 'scheduled' && 
                     new Date(session.datetime) > new Date() && (
                      <button
                        className="btn btn-sm btn-outline-warning me-1"
                        onClick={() => {
                          setSelectedSession(session);
                          setShowRescheduleModal(true);
                        }}
                      >
                        <i className="fas fa-clock me-1"></i>
                        Reschedule
                      </button>
                    )}

                    {(userRole === 'mentor' || userRole === 'admin') && 
                     session.status === 'scheduled' && (
                      <>
                        <button
                          className="btn btn-sm btn-success me-1"
                          onClick={() => handleCompleteSession(session._id)}
                        >
                          <i className="fas fa-check me-1"></i>
                          Complete
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleCancelSession(session._id)}
                        >
                          <i className="fas fa-times me-1"></i>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedSession && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Request Reschedule</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setSelectedSession(null);
                    setRescheduleData({ requestedDate: '', reason: '' });
                  }}
                ></button>
              </div>
              <form onSubmit={handleRescheduleRequest}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="requestedDate" className="form-label">New Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id="requestedDate"
                      value={rescheduleData.requestedDate}
                      onChange={(e) => setRescheduleData(prev => ({
                        ...prev,
                        requestedDate: e.target.value
                      }))}
                      required
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="reason" className="form-label">Reason *</label>
                    <textarea
                      className="form-control"
                      id="reason"
                      value={rescheduleData.reason}
                      onChange={(e) => setRescheduleData(prev => ({
                        ...prev,
                        reason: e.target.value
                      }))}
                      placeholder="Please provide a reason for rescheduling..."
                      rows="3"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowRescheduleModal(false);
                      setSelectedSession(null);
                      setRescheduleData({ requestedDate: '', reason: '' });
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}

      <style jsx>{`
        .session-list {
          margin-top: 1rem;
        }

        .card {
          transition: transform 0.2s ease;
        }

        .card:hover {
          transform: translateY(-2px);
        }

        .session-actions {
          margin-top: auto;
        }

        .modal-backdrop {
          background-color: rgba(0, 0, 0, 0.5);
        }

        .btn-group .btn.active {
          background-color: var(--primary-orange);
          border-color: var(--primary-orange);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default SessionList; 