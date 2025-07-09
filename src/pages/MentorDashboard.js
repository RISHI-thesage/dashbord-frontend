import React, { useState, useEffect } from 'react';
import { mentorAPI } from '../services/api';
import SessionScheduler from '../components/SessionScheduler';
import { DashboardProgressEditor } from '../components/ProgressBar';
import Navbar from '../components/Navbar/Navbar';

// Helper to get initials from name
function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const MentorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [studentTasks, setStudentTasks] = useState([]);
  // Fetch all tasks for assigned students
  const [allStudentTasks, setAllStudentTasks] = useState([]);
  // Remove local tab state; will use dashboardSection from Navbar
  // Add state for filtering submissions by student
  const [filteredStudentId, setFilteredStudentId] = useState(null);
  // Add dashboardSection state here
  const [dashboardSection, setDashboardSection] = useState('students');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      const fetchAllTasks = async () => {
        let tasks = [];
        for (const student of students) {
          try {
            const res = await mentorAPI.getStudentTasks(student._id);
            (res.data.data || []).forEach(task => {
              tasks.push({ ...task, student });
            });
          } catch (e) { /* ignore */ }
        }
        setAllStudentTasks(tasks);
      };
      fetchAllTasks();
    }
  }, [students]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, studentsRes, sessionsRes] = await Promise.all([
        mentorAPI.getDashboard(),
        mentorAPI.getAssignedStudents(),
        mentorAPI.getSessions()
      ]);

      setDashboardData(dashboardRes.data.data);
      setStudents(studentsRes.data.data);
      setSessions(sessionsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionScheduled = () => {
    setShowScheduler(false);
    fetchDashboardData();
    setError('');
  };

  const handleSessionScheduledError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleProgressUpdate = async (studentId, progress) => {
    try {
      await mentorAPI.updateStudentProgress(studentId, progress);
      setShowProgressModal(false);
      fetchDashboardData();
      setError('');
    } catch (error) {
      console.error('Error updating progress:', error);
      setError('Failed to update progress. Please try again.');
    }
  };

  const handleTaskStatusUpdate = async (studentId, taskId, status, feedback) => {
    try {
      await mentorAPI.updateTaskStatus(studentId, taskId, status, feedback);
      fetchStudentTasks(studentId);
      setError('');
    } catch (error) {
      console.error('Error updating task status:', error);
      setError('Failed to update task status. Please try again.');
    }
  };

  const fetchStudentTasks = async (studentId) => {
    try {
      const response = await mentorAPI.getStudentTasks(studentId);
      setStudentTasks(response.data.data);
    } catch (error) {
      console.error('Error fetching student tasks:', error);
    }
  };

  const handleViewTasks = (student) => {
    setSelectedStudent(student);
    fetchStudentTasks(student._id);
    setShowTaskModal(true);
  };

  const handleCompleteSession = async (sessionId, feedback) => {
    try {
      await mentorAPI.completeSession(sessionId, feedback);
      fetchDashboardData();
      setError('');
    } catch (error) {
      console.error('Error completing session:', error);
      setError('Failed to complete session. Please try again.');
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      'scheduled': 'bg-warning text-dark',
      'completed': 'bg-success',
      'cancelled': 'bg-danger',
      'rescheduled': 'bg-info'
    };
    return badges[status] || 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading dashboard...</span>
            </div>
            <p className="mt-3">Loading mentor dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar onSectionChange={setDashboardSection} />
      <div className="modern-dashboard">
        <div className="dashboard-container" style={{ marginTop: '80px' }}>
          {/* Conditionally render Students or Submissions section based on dashboardSection */}
          {dashboardSection === 'students' && (
            <>
              {/* Welcome Header */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="dashboard-card bg-soft-cream shadow" style={{ border: 'none', boxShadow: '0 4px 24px rgba(255,107,0,0.08)', padding: '1.5rem 2rem' }}>
                    <h2 className="text-deep-blue mb-3" style={{ fontWeight: 800, letterSpacing: '-0.5px' }}>Welcome back, {dashboardData?.mentor?.name}!</h2>
                    <p className="text-muted mb-0" style={{ fontSize: '1.1rem', color: '#0D1B2A' }}>
                      Manage your students, track their progress, and schedule sessions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="row mb-4">
                <div className="col-md-3 col-6 mb-3">
                  <div className="card text-center shadow-sm bg-soft-cream" style={{ border: 'none', boxShadow: '0 2px 12px rgba(13,27,42,0.06)', padding: '1.5rem 1.5rem' }}>
                    <div className="card-body">
                      <div className="stat-icon mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #FF6B00 100%)', color: '#FFF7EC' }}><i className="bi bi-people"></i></div>
                      <div className="fw-bold stat-number" style={{ fontSize: '2.1rem', color: '#0D1B2A' }}>{students.length}</div>
                      <div className="stat-label">Assigned Students</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-6 mb-3">
                  <div className="card text-center shadow-sm bg-soft-cream" style={{ border: 'none', boxShadow: '0 2px 12px rgba(13,27,42,0.06)', padding: '1.5rem 1.5rem' }}>
                    <div className="card-body">
                      <div className="stat-icon mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #FF6B00 0%, #FFB366 100%)', color: '#0D1B2A' }}><i className="bi bi-calendar-event"></i></div>
                      <div className="fw-bold stat-number" style={{ fontSize: '2.1rem', color: '#FF6B00' }}>{sessions.filter(s => s.status === 'scheduled').length}</div>
                      <div className="stat-label">Upcoming Sessions</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-6 mb-3">
                  <div className="card text-center shadow-sm bg-soft-cream" style={{ border: 'none', boxShadow: '0 2px 12px rgba(13,27,42,0.06)', padding: '1.5rem 1.5rem' }}>
                    <div className="card-body">
                      <div className="stat-icon mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #10B981 100%)', color: '#FFF7EC' }}><i className="bi bi-check-circle"></i></div>
                      <div className="fw-bold stat-number" style={{ fontSize: '2.1rem', color: '#10B981' }}>{sessions.filter(s => s.status === 'completed').length}</div>
                      <div className="stat-label">Completed Sessions</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-6 mb-3">
                  <div className="card text-center shadow-sm bg-soft-cream" style={{ border: 'none', boxShadow: '0 2px 12px rgba(13,27,42,0.06)', padding: '1.5rem 1.5rem' }}>
                    <div className="card-body">
                      <div className="stat-icon mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #FF6B00 0%, #F59E0B 100%)', color: '#FFF7EC' }}><i className="bi bi-clock-history"></i></div>
                      <div className="fw-bold stat-number" style={{ fontSize: '2.1rem', color: '#F59E0B' }}>{sessions.length}</div>
                      <div className="stat-label">Total Sessions</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                {/* Left Column */}
                <div className="col-lg-8">
                  {/* Assigned Students */}
                  <div className="dashboard-card mb-4 bg-soft-cream" style={{ border: 'none', boxShadow: '0 4px 24px rgba(255,107,0,0.08)', padding: '1.5rem 2rem' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4 className="fw-bold mb-0"><i className="bi bi-people me-2"></i>Assigned Students</h4>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowScheduler(true)}
                      >
                        <i className="bi bi-plus-circle me-1"></i>
                        Schedule Session
                      </button>
                    </div>
                    
                    {students.length === 0 ? (
                      <div className="text-center text-muted py-4">
                        <i className="bi bi-people fs-1 mb-3"></i>
                        <p>No students assigned yet.</p>
                      </div>
                    ) : (
                      <div className="row">
                        {students.map(student => (
                          <div key={student._id} className="col-md-6 mb-3">
                            <div className="card h-100 shadow-sm bg-soft-cream" style={{ border: 'none', boxShadow: '0 2px 12px rgba(13,27,42,0.06)', padding: '1.5rem 1.5rem' }}>
                              <div className="card-body">
                                <div className="d-flex align-items-center mb-3">
                                  <div 
                                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                    style={{
                                      width: '50px',
                                      height: '50px',
                                      background: 'linear-gradient(135deg, #FF6B00 0%, #FFB366 100%)',
                                      color: 'white',
                                      fontSize: '1.2rem',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {getInitials(student.name)}
                                  </div>
                                  <div>
                                    <h6 className="mb-1 fw-bold">{student.name}</h6>
                                    <small className="text-muted">{student.email}</small>
                                  </div>
                                </div>
                                
                                <div className="mb-3">
                                  <small className="text-muted">Overall Progress</small>
                                  <div className="progress" style={{ height: '8px' }}>
                                    <div 
                                      className="progress-bar" 
                                      style={{ 
                                        width: `${student.dashboardProgress || 0}%`,
                                        background: 'linear-gradient(135deg, #FF6B00 0%, #FFB366 100%)'
                                      }}
                                    ></div>
                                  </div>
                                  <small className="text-muted">{student.dashboardProgress || 0}%</small>
                                </div>
                                
                                <div className="d-flex gap-2">
                                  <button 
                                    className="btn btn-outline-primary btn-sm flex-fill"
                                    onClick={() => {
                                      setSelectedStudent(student);
                                      setShowProgressModal(true);
                                    }}
                                  >
                                    Update Progress
                                  </button>
                                  <button 
                                    className="btn btn-outline-secondary btn-sm flex-fill"
                                    onClick={() => handleViewTasks(student)}
                                  >
                                    View Tasks
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sessions */}
                  <div className="dashboard-card bg-soft-cream" style={{ border: 'none', boxShadow: '0 4px 24px rgba(255,107,0,0.08)', padding: '1.5rem 2rem' }}>
                    <h4 className="fw-bold mb-3"><i className="bi bi-calendar-event me-2"></i>Recent Sessions</h4>
                    {sessions.length === 0 ? (
                      <div className="text-muted">No sessions scheduled.</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Student</th>
                              <th>Topic</th>
                              <th>Date & Time</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sessions.slice(0, 10).map(session => (
                              <tr key={session._id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div 
                                      className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                      style={{
                                        width: '30px',
                                        height: '30px',
                                        background: 'linear-gradient(135deg, #FF6B00 0%, #FFB366 100%)',
                                        color: 'white',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      {getInitials(session.student?.name)}
                                    </div>
                                    {session.student?.name}
                                  </div>
                                </td>
                                <td>{session.topic || session.title}</td>
                                <td>{formatDateTime(session.datetime)}</td>
                                <td>
                                  <span className={`badge ${getStatusBadge(session.status)}`}>
                                    {session.status}
                                  </span>
                                </td>
                                <td>
                                  {session.status === 'scheduled' && (
                                    <button 
                                      className="btn btn-success btn-sm me-1"
                                      onClick={() => handleCompleteSession(session._id, '')}
                                    >
                                      Complete
                                    </button>
                                  )}
                                  {session.meetingLink && (
                                    <a 
                                      href={session.meetingLink} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="btn btn-outline-primary btn-sm"
                                    >
                                      Join
                                    </a>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="col-lg-4">
                  {/* Quick Actions */}
                  <div className="dashboard-card mb-4 bg-soft-cream" style={{ border: 'none', boxShadow: '0 4px 24px rgba(255,107,0,0.08)', padding: '1.5rem 2rem' }}>
                    <h5 className="fw-bold mb-3">Quick Actions</h5>
                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowScheduler(true)}
                      >
                        <i className="bi bi-calendar-plus me-2"></i>
                        Schedule New Session
                      </button>
                      <button className="btn btn-outline-secondary">
                        <i className="bi bi-graph-up me-2"></i>
                        View Reports
                      </button>
                      <button className="btn btn-outline-info">
                        <i className="bi bi-envelope me-2"></i>
                        Send Message
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="dashboard-card bg-soft-cream" style={{ border: 'none', boxShadow: '0 4px 24px rgba(255,107,0,0.08)', padding: '1.5rem 2rem' }}>
                    <h5 className="fw-bold mb-3">Recent Activity</h5>
                    <div className="activity-list">
                      {sessions.slice(0, 5).map(session => (
                        <div key={session._id} className="activity-item d-flex align-items-start mb-3">
                          <div className="activity-icon me-3">
                            <i className="bi bi-calendar-check text-primary"></i>
                          </div>
                          <div className="activity-content">
                            <div className="fw-medium small">{session.topic || session.title}</div>
                            <div className="text-muted small">with {session.student?.name}</div>
                            <div className="text-muted small">{formatDateTime(session.datetime)}</div>
                          </div>
                        </div>
                      ))}
                      {sessions.length === 0 && (
                        <div className="text-muted small">No recent activity</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {dashboardSection === 'submissions' && (
            <>
              {/* Student Submissions Section (as previously implemented) */}
              <div className="dashboard-card mb-4 bg-soft-cream" style={{ border: 'none', boxShadow: '0 4px 24px rgba(255,107,0,0.08)', padding: '1.5rem 2rem' }}>
                <h4 className="fw-bold mb-3"><i className="bi bi-file-earmark-arrow-up me-2"></i>Student Submissions</h4>
                {/* Student filter chips */}
                <div className="mb-3 d-flex flex-wrap gap-2">
                  <button
                    className={`btn btn-sm ${filteredStudentId === null ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFilteredStudentId(null)}
                  >
                    All Students
                  </button>
                  {students.map(student => (
                    <button
                      key={student._id}
                      className={`btn btn-sm ${filteredStudentId === student._id ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilteredStudentId(student._id)}
                    >
                      {student.name}
                    </button>
                  ))}
                </div>
                {allStudentTasks.length === 0 ? (
                  <div className="text-muted">No submissions yet.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>File</th>
                          <th>Uploaded</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allStudentTasks
                          .filter(task => filteredStudentId === null || task.student._id === filteredStudentId)
                          .map(task => (
                            <tr key={task._id}>
                              <td>{task.student.name}</td>
                              <td>{task.originalname}</td>
                              <td>{new Date(task.uploadedAt).toLocaleDateString()}</td>
                              <td>
                                <span className={`badge ${
                                  task.status === 'approved' ? 'bg-success' :
                                  task.status === 'reviewed' ? 'bg-warning' : 'bg-secondary'
                                }`}>
                                  {task.status}
                                </span>
                              </td>
                              <td>
                                <select 
                                  className="form-select form-select-sm"
                                  value={task.status}
                                  onChange={e => handleTaskStatusUpdate(task.student._id, task._id, e.target.value, task.feedback)}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="reviewed">Reviewed</option>
                                  <option value="approved">Approved</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Session Scheduler Modal */}
          {showScheduler && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content bg-soft-cream" style={{ border: 'none', boxShadow: '0 4px 24px rgba(255,107,0,0.08)' }}>
                  <div className="modal-header" style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #FF6B00 100%)', color: 'white', borderBottom: 'none' }}>
                    <h5 className="modal-title">Schedule New Session</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setShowScheduler(false)}
                      style={{ color: 'white' }}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <SessionScheduler
                      students={students}
                      onSessionCreated={handleSessionScheduled}
                      onError={handleSessionScheduledError}
                      onClose={() => setShowScheduler(false)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Update Modal */}
          {showProgressModal && selectedStudent && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog">
                <div className="modal-content bg-soft-cream" style={{ border: 'none', boxShadow: '0 4px 24px rgba(255,107,0,0.08)' }}>
                  <div className="modal-header" style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #FF6B00 100%)', color: 'white', borderBottom: 'none' }}>
                    <h5 className="modal-title">Update Progress for {selectedStudent.name}</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setShowProgressModal(false)}
                      style={{ color: 'white' }}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <DashboardProgressEditor
                      progress={selectedStudent.progress || { html: 0, js: 0, css: 0, other: 0 }}
                      onProgressUpdate={(progress) => handleProgressUpdate(selectedStudent._id, progress)}
                      studentName={selectedStudent.name}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Task Management Modal */}
          {showTaskModal && selectedStudent && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content bg-soft-cream" style={{ border: 'none', boxShadow: '0 4px 24px rgba(255,107,0,0.08)' }}>
                  <div className="modal-header" style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #FF6B00 100%)', color: 'white', borderBottom: 'none' }}>
                    <h5 className="modal-title">Tasks for {selectedStudent.name}</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setShowTaskModal(false)}
                      style={{ color: 'white' }}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {studentTasks.length === 0 ? (
                      <div className="text-center text-muted py-4">
                        <i className="bi bi-file-earmark-text fs-1 mb-3"></i>
                        <p>No tasks uploaded yet.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>File</th>
                              <th>Uploaded</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentTasks.map(task => (
                              <tr key={task._id}>
                                <td>{task.originalname}</td>
                                <td>{new Date(task.uploadedAt).toLocaleDateString()}</td>
                                <td>
                                  <span className={`badge ${
                                    task.status === 'approved' ? 'bg-success' :
                                    task.status === 'reviewed' ? 'bg-warning' : 'bg-secondary'
                                  }`}>
                                    {task.status}
                                  </span>
                                </td>
                                <td>
                                  <select 
                                    className="form-select form-select-sm"
                                    value={task.status}
                                    onChange={(e) => handleTaskStatusUpdate(
                                      selectedStudent._id, 
                                      task._id, 
                                      e.target.value, 
                                      task.feedback
                                    )}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="reviewed">Reviewed</option>
                                    <option value="approved">Approved</option>
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MentorDashboard;
