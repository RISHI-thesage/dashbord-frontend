import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import SessionScheduler from '../components/SessionScheduler';

// Helper to get initials from name
function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showAssignMentorModal, setShowAssignMentorModal] = useState(false);
  const [showSchedulerModal, setShowSchedulerModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [createUserForm, setCreateUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    designation: '',
    experience: ''
  });
  // Fetch all student tasks for admin view
  // const [allStudentTasks, setAllStudentTasks] = useState([]); // Removed unused variable
  const [adminSubmissions, setAdminSubmissions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchAdminSubmissions();
  }, []);

  useEffect(() => {
    const fetchAllTasks = async () => {
      let tasks = [];
      for (const student of users.filter(u => u.role === 'student')) {
        if (student.tasks && student.tasks.length > 0) {
          student.tasks.forEach(task => {
            tasks.push({ ...task, student, mentor: users.find(u => String(u._id) === String(student.assignedMentor)) });
          });
        }
      }
      // setAllStudentTasks(tasks); // This line was removed as per the edit hint
    };
    if (users.length > 0) fetchAllTasks();
  }, [users]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, usersRes, reportsRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAllUsers(),
        adminAPI.getReports()
      ]);

      setDashboardData(dashboardRes.data.data);
      setUsers(usersRes.data.data);
      setReports(reportsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminSubmissions = async () => {
    try {
      const res = await adminAPI.getSubmissions();
      setAdminSubmissions(res.data.data || []);
    } catch (err) {
      setAdminSubmissions([]);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createUser(createUserForm);
      setShowCreateUserModal(false);
      setCreateUserForm({
        name: '',
        email: '',
        password: '',
        role: 'student',
        phone: '',
        designation: '',
        experience: ''
      });
      fetchDashboardData();
      setError('');
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user. Please try again.');
    }
  };

  const handleAssignMentor = async (studentId, mentorId) => {
    try {
      await adminAPI.assignMentor(studentId, mentorId);
      setShowAssignMentorModal(false);
      setSelectedStudent('');
      fetchDashboardData();
      setError('');
    } catch (error) {
      console.error('Error assigning mentor:', error);
      setError('Failed to assign mentor. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        fetchDashboardData();
        setError('');
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCreateUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStudentsWithoutMentor = () => {
    return users.filter(user => user.role === 'student' && !user.assignedMentor);
  };

  const getMentors = () => {
    return users.filter(user => user.role === 'mentor');
  };

  const getStudents = () => users.filter(u => u.role === 'student');

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleSessionScheduled = () => {
    setShowSchedulerModal(false);
    fetchDashboardData();
    setError('');
  };

  const handleSessionScheduledError = (errorMessage) => {
    setError(errorMessage);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading dashboard...</span>
            </div>
            <p className="mt-3">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-dashboard">
      <div className="dashboard-container" style={{ marginTop: '80px' }}>
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Welcome Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="dashboard-card bg-soft-cream shadow" style={{ border: 'none', boxShadow: '0 4px 24px rgba(255,107,0,0.08)', padding: '1.5rem 2rem' }}>
              <h2 className="text-deep-blue mb-3" style={{ fontWeight: 800, letterSpacing: '-0.5px' }}>Admin Dashboard</h2>
              <p className="text-muted mb-0" style={{ fontSize: '1.1rem', color: '#0D1B2A' }}>
                Manage users, monitor platform activity, and generate reports.
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
                <div className="fw-bold stat-number" style={{ fontSize: '2.1rem', color: '#0D1B2A' }}>{dashboardData?.totalUsers || 0}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <div className="card text-center shadow-sm bg-soft-cream" style={{ border: 'none', boxShadow: '0 2px 12px rgba(13,27,42,0.06)', padding: '1.5rem 1.5rem' }}>
              <div className="card-body">
                <div className="stat-icon mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #FF6B00 0%, #FFB366 100%)', color: '#0D1B2A' }}><i className="bi bi-mortarboard"></i></div>
                <div className="fw-bold stat-number" style={{ fontSize: '2.1rem', color: '#FF6B00' }}>{dashboardData?.students || 0}</div>
                <div className="stat-label">Students</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <div className="card text-center shadow-sm bg-soft-cream" style={{ border: 'none', boxShadow: '0 2px 12px rgba(13,27,42,0.06)', padding: '1.5rem 1.5rem' }}>
              <div className="card-body">
                <div className="stat-icon mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #10B981 100%)', color: '#FFF7EC' }}><i className="bi bi-person-workspace"></i></div>
                <div className="fw-bold stat-number" style={{ fontSize: '2.1rem', color: '#10B981' }}>{dashboardData?.mentors || 0}</div>
                <div className="stat-label">Mentors</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <div className="card text-center shadow-sm bg-soft-cream" style={{ border: 'none', boxShadow: '0 2px 12px rgba(13,27,42,0.06)', padding: '1.5rem 1.5rem' }}>
              <div className="card-body">
                <div className="stat-icon mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #FF6B00 0%, #F59E0B 100%)', color: '#FFF7EC' }}><i className="bi bi-exclamation-triangle"></i></div>
                <div className="fw-bold stat-number" style={{ fontSize: '2.1rem', color: '#F59E0B' }}>{dashboardData?.unassignedStudents || 0}</div>
                <div className="stat-label">Unassigned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="dashboard-card bg-soft-cream" style={{ border: 'none', boxShadow: '0 2px 12px rgba(255,107,0,0.08)', padding: '1.5rem 2rem' }}>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <button 
                  className="btn btn-primary btn-lg px-4"
                  style={{ borderRadius: '12px', fontWeight: 700, letterSpacing: '0.02em' }}
                  onClick={() => setShowCreateUserModal(true)}
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Register Student
                </button>
                <button 
                  className="btn btn-info btn-lg px-4"
                  style={{ borderRadius: '12px', fontWeight: 700, letterSpacing: '0.02em', background: 'linear-gradient(135deg, #0D1B2A 0%, #FF6B00 100%)', color: '#FFF7EC' }}
                  onClick={() => {
                    setCreateUserForm({ ...createUserForm, role: 'mentor' });
                    setShowCreateUserModal(true);
                  }}
                >
                  <i className="bi bi-person-workspace me-2"></i>
                  Register Mentor
                </button>
                <button 
                  className="btn btn-warning btn-lg px-4"
                  style={{ borderRadius: '12px', fontWeight: 700, letterSpacing: '0.02em', color: '#0D1B2A' }}
                  onClick={() => setShowAssignMentorModal(true)}
                >
                  <i className="bi bi-link me-2"></i>
                  Assign Mentor
                </button>
                <button 
                  className="btn btn-success btn-lg px-4"
                  style={{ borderRadius: '12px', fontWeight: 700, letterSpacing: '0.02em' }}
                  onClick={() => setShowSchedulerModal(true)}
                >
                  <i className="bi bi-calendar-plus me-2"></i>
                  Schedule Session
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Left Column */}
          <div className="col-lg-8">
            {/* Students */}
            <div className="dashboard-card mb-4 bg-soft-cream" style={{ border: 'none', boxShadow: '0 2px 12px rgba(13,27,42,0.06)', padding: '1.5rem 2rem' }}>
              <h4 className="fw-bold mb-3"><i className="bi bi-mortarboard me-2"></i>Students</h4>
              {users.filter(user => user.role === 'student').length === 0 ? (
                <div className="text-muted">No students registered.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover bg-soft-cream" style={{ border: 'none', boxShadow: 'none', margin: 0, padding: '0.5rem 1rem' }}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mentor</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(user => user.role === 'student').map(student => (
                        <tr key={student._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  background: 'linear-gradient(135deg, #FF6B00 0%, #FFB366 100%)',
                                  color: '#FFF7EC',
                                  fontSize: '0.8rem',
                                  fontWeight: 'bold',
                                  boxShadow: '0 2px 8px rgba(255,107,0,0.15)'
                                }}
                              >
                                {getInitials(student.name)}
                              </div>
                              {student.name}
                            </div>
                          </td>
                          <td>{student.email}</td>
                          <td>
                            {student.assignedMentor ? (
                              <span className="badge bg-success">Assigned</span>
                            ) : (
                              <span className="badge bg-warning text-dark">Unassigned</span>
                            )}
                          </td>
                          <td>{formatDate(student.createdAt)}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteUser(student._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Mentors */}
            <div className="dashboard-card bg-soft-cream" style={{ border: 'none', boxShadow: '0 2px 12px rgba(13,27,42,0.06)', padding: '1.5rem 2rem' }}>
              <h4 className="fw-bold mb-3"><i className="bi bi-person-workspace me-2"></i>Mentors</h4>
              {users.filter(user => user.role === 'mentor').length === 0 ? (
                <div className="text-muted">No mentors registered.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover bg-soft-cream" style={{ border: 'none', boxShadow: 'none', margin: 0, padding: '0.5rem 1rem' }}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Designation</th>
                        <th>Students</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(user => user.role === 'mentor').map(mentor => (
                        <tr key={mentor._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  background: 'linear-gradient(135deg, #10B981 0%, #0D1B2A 100%)',
                                  color: '#FFF7EC',
                                  fontSize: '0.8rem',
                                  fontWeight: 'bold',
                                  boxShadow: '0 2px 8px rgba(16,185,129,0.15)'
                                }}
                              >
                                {getInitials(mentor.name)}
                              </div>
                              {mentor.name}
                            </div>
                          </td>
                          <td>{mentor.email}</td>
                          <td>{mentor.designation || 'N/A'}</td>
                          <td>
                            <span className="badge bg-info" style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #FF6B00 100%)', color: '#FFF7EC', fontWeight: 700 }}>
                              {users.filter(user => String(user.assignedMentor) === String(mentor._id)).length}
                            </span>
                          </td>
                          <td>{formatDate(mentor.createdAt)}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteUser(mentor._id)}
                              >
                                Delete
                              </button>
                            </div>
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
            {/* Platform Statistics */}
            <div className="dashboard-card mb-4 bg-soft-cream" style={{ border: 'none', boxShadow: '0 2px 12px rgba(13,27,42,0.06)', padding: '1.5rem 2rem' }}>
              <h5 className="fw-bold mb-3">Platform Statistics</h5>
              {reports && (
                <div className="stats-list">
                  <div className="stat-item d-flex justify-content-between mb-2">
                    <span>Total Sessions:</span>
                    <strong>{reports.totalSessions}</strong>
                  </div>
                  <div className="stat-item d-flex justify-content-between mb-2">
                    <span>Completed Sessions:</span>
                    <strong>{reports.completedSessions}</strong>
                  </div>
                  <div className="stat-item d-flex justify-content-between mb-2">
                    <span>Completion Rate:</span>
                    <strong>{reports.completionRate}%</strong>
                  </div>
                  <div className="stat-item d-flex justify-content-between mb-2">
                    <span>Unassigned Students:</span>
                    <strong>{reports.unassignedStudents}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Sessions */}
            <div className="dashboard-card mb-4 bg-soft-cream" style={{ border: 'none', boxShadow: '0 2px 12px rgba(13,27,42,0.06)', padding: '1.5rem 2rem' }}>
              <h5 className="fw-bold mb-3">Recent Sessions</h5>
              {dashboardData?.recentSessions && dashboardData.recentSessions.length > 0 ? (
                <div className="recent-sessions">
                  {dashboardData.recentSessions.slice(0, 5).map(session => (
                    <div key={session._id} className="session-item d-flex align-items-start mb-3">
                      <div className="session-icon me-3">
                        <i className="bi bi-calendar-check text-primary"></i>
                      </div>
                      <div className="session-content">
                        <div className="fw-medium small">{session.topic || session.title}</div>
                        <div className="text-muted small">
                          {session.mentor?.name} → {session.student?.name}
                        </div>
                        <div className="text-muted small">{formatDate(session.datetime)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted small">No recent sessions</div>
              )}
            </div>

            {/* Top Mentors */}
            <div className="dashboard-card bg-soft-cream" style={{ border: 'none', boxShadow: '0 2px 12px rgba(13,27,42,0.06)', padding: '1.5rem 2rem' }}>
              <h5 className="fw-bold mb-3">Top Mentors</h5>
              {reports?.mentorsWithStudents && reports.mentorsWithStudents.length > 0 ? (
                <div className="top-mentors">
                  {reports.mentorsWithStudents.slice(0, 5).map(mentor => (
                    <div key={mentor._id} className="mentor-item d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center me-2"
                          style={{
                            width: '25px',
                            height: '25px',
                            background: 'linear-gradient(135deg, #10B981 0%, #0D1B2A 100%)',
                            color: '#FFF7EC',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(16,185,129,0.15)'
                          }}
                        >
                          {getInitials(mentor.name)}
                        </div>
                        <span className="small">{mentor.name}</span>
                      </div>
                      <span className="badge bg-info" style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #FF6B00 100%)', color: '#FFF7EC', fontWeight: 700 }}>{mentor.studentCount} students</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted small">No mentor data available</div>
              )}
            </div>
          </div>
        </div>

        {/* All Student Submissions Section */}
        <div className="dashboard-card mb-4 bg-soft-cream" style={{ border: 'none', boxShadow: '0 4px 24px rgba(255,107,0,0.08)', padding: '1.5rem 2rem' }}>
          <h4 className="fw-bold mb-3"><i className="bi bi-file-earmark-arrow-up me-2"></i>All Student Submissions</h4>
          {adminSubmissions.length === 0 ? (
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
                  {adminSubmissions.map(sub => (
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

        {/* Create User Modal */}
        {showCreateUserModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(13,27,42,0.10)' }}>
            <div className="modal-dialog">
              <div className="modal-content bg-soft-cream" style={{ border: 'none', boxShadow: '0 8px 32px rgba(13,27,42,0.12)' }}>
                <div className="modal-header" style={{ background: '#0D1B2A', color: '#FFF7EC', borderBottom: 'none' }}>
                  <h5 className="modal-title" style={{ color: '#FFF7EC', fontWeight: 700 }}>
                    Register {createUserForm.role === 'mentor' ? 'Mentor' : 'Student'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowCreateUserModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleCreateUser}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={createUserForm.name}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={createUserForm.email}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={createUserForm.password}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    {createUserForm.role === 'mentor' && (
                      <>
                        <div className="mb-3">
                          <label className="form-label">Phone</label>
                          <input
                            type="text"
                            className="form-control"
                            name="phone"
                            value={createUserForm.phone}
                            onChange={handleFormChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Designation</label>
                          <input
                            type="text"
                            className="form-control"
                            name="designation"
                            value={createUserForm.designation}
                            onChange={handleFormChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Experience</label>
                          <input
                            type="text"
                            className="form-control"
                            name="experience"
                            value={createUserForm.experience}
                            onChange={handleFormChange}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreateUserModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Create {createUserForm.role === 'mentor' ? 'Mentor' : 'Student'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Assign Mentor Modal */}
        {showAssignMentorModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(13,27,42,0.10)' }}>
            <div className="modal-dialog">
              <div className="modal-content bg-soft-cream" style={{ border: 'none', boxShadow: '0 8px 32px rgba(13,27,42,0.12)' }}>
                <div className="modal-header" style={{ background: '#0D1B2A', color: '#FFF7EC', borderBottom: 'none' }}>
                  <h5 className="modal-title" style={{ color: '#FFF7EC', fontWeight: 700 }}>Assign Mentor to Student</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowAssignMentorModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Select Student</label>
                    <select 
                      className="form-select"
                      onChange={(e) => setSelectedStudent(e.target.value)}
                    >
                      <option value="">Choose a student...</option>
                      {getStudentsWithoutMentor().map(student => (
                        <option key={student._id} value={student._id}>
                          {student.name} ({student.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedStudent && (
                    <div className="mb-3">
                      <label className="form-label">Select Mentor</label>
                      <select 
                        className="form-select"
                        onChange={(e) => handleAssignMentor(selectedStudent, e.target.value)}
                      >
                        <option value="">Choose a mentor...</option>
                        {getMentors().map(mentor => (
                          <option key={mentor._id} value={mentor._id}>
                            {mentor.name} ({mentor.designation || 'Mentor'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAssignMentorModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Session Scheduler Modal */}
        {showSchedulerModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(13,27,42,0.10)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content bg-soft-cream" style={{ border: 'none', boxShadow: '0 8px 32px rgba(13,27,42,0.12)' }}>
                <div className="modal-header" style={{ background: '#0D1B2A', color: '#FFF7EC', borderBottom: 'none' }}>
                  <h5 className="modal-title" style={{ color: '#FFF7EC', fontWeight: 700 }}>Schedule New Session</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowSchedulerModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <SessionScheduler
                    students={getStudents()}
                    onSessionCreated={handleSessionScheduled}
                    onError={handleSessionScheduledError}
                    onClose={() => setShowSchedulerModal(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
