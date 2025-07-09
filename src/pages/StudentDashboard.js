import React, { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import FileUpload from '../components/FileUpload';
import { BsClock, BsCalendarEvent, BsLightning, BsPersonBadge } from 'react-icons/bs';

// Helper to get initials from name
function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [showTaskUploadModal, setShowTaskUploadModal] = useState(false);
  const [showRequestSessionModal, setShowRequestSessionModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // <-- Add success state

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await studentAPI.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
    }
  };

  const handleFileUploadSuccess = (fileData) => {
    setShowTaskUploadModal(false);
    fetchDashboardData(); // Refresh data
    setError('');
    setSuccess('Task submitted successfully!'); // Show success message
  };

  const handleFileUploadError = (errorMessage) => {
    setError(errorMessage);
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendWhatsAppRequest = () => {
    const mentorPhone = dashboardData?.mentor?.phone;
    if (!mentorPhone) {
      setError('Mentor phone number not available.');
      return;
    }
    const message = encodeURIComponent(requestMessage || 'I would like to request a residential session.');
    window.open(`https://wa.me/${mentorPhone.replace(/[^\d]/g, '')}?text=${message}`, '_blank');
    setShowRequestSessionModal(false);
    setRequestMessage('');
  };

  const handleJoinSession = (session) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank', 'noopener,noreferrer');
    } else {
      setError('No meeting link available for this session.');
    }
  };

  // Animation helpers
  useEffect(() => {
    const cards = document.querySelectorAll('.dashboard-animated');
    cards.forEach((card, i) => {
      card.style.opacity = 0;
      setTimeout(() => {
        card.style.opacity = 1;
        card.classList.add('fade-in');
      }, 200 + i * 120);
    });
  }, [dashboardData?.upcomingSessions, dashboardData?.mentor, dashboardData?.user?.tasks]);

  // Modern dashboard layout matching the screenshot
  return (
    <div className="modern-dashboard">
      <div className="dashboard-container">
        {/* Submit Your Work Button */}
        <div className="d-flex justify-content-end mb-3">
          <button className="btn btn-primary" onClick={() => setShowTaskUploadModal(true)}>
            <i className="bi bi-upload me-2"></i>Submit Your Work
          </button>
        </div>
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
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {success}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccess('')}
              aria-label="Close"
            ></button>
          </div>
        )}
        
        {/* Header Section */}
        <div className="dashboard-header mb-6">
          <h1 className="dashboard-title">Welcome back, {dashboardData?.user?.name || 'Student'}!</h1>
          <p className="dashboard-subtitle">Here's your mentorship progress and upcoming sessions.</p>
        </div>

        {/* Stats Cards Row */}
        <div className="stats-grid mb-6">
          <div className="stat-card">
            <div className="stat-icon">
              <BsCalendarEvent />
            </div>
            <div className="stat-content">
              <div className="stat-number">{dashboardData?.stats?.totalSessions || 0}</div>
              <div className="stat-label">Total Sessions</div>
              <div className="stat-change">+3 from last month</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <BsClock />
            </div>
            <div className="stat-content">
              <div className="stat-number">{dashboardData?.stats?.hoursLearned || 0}</div>
              <div className="stat-label">Hours Learned</div>
              <div className="stat-change">+4.5 from last month</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <BsLightning />
            </div>
            <div className="stat-content">
              <div className="stat-number">75%</div>
              <div className="stat-label">Progress</div>
              <div className="stat-change">Course completion</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <BsPersonBadge />
            </div>
            <div className="stat-content">
              <div className="stat-number">{dashboardData?.stats?.achievements || 0}</div>
              <div className="stat-label">Achievements</div>
              <div className="stat-change">Badges earned</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Left Column */}
          <div className="content-left">
            {/* Upcoming Sessions */}
            <div className="section-card mb-6">
              <div className="section-header">
                <div className="section-title">
                  <BsCalendarEvent className="section-icon" />
                  Upcoming Sessions
                </div>
                <div className="section-subtitle">Your scheduled mentorship sessions for this month</div>
              </div>
              <div className="sessions-list">
                {dashboardData?.upcomingSessions && dashboardData.upcomingSessions.length > 0 ? (
                  dashboardData.upcomingSessions.map((session, index) => (
                    <div key={session._id || index} className="session-item">
                      <div className="session-avatar">
                        <div className="avatar-circle">
                          {session.mentor?.name ? getInitials(session.mentor.name) : 'M'}
                        </div>
                      </div>
                      <div className="session-content">
                        <div className="session-title">{session.topic || session.title || 'Mentorship Session'}</div>
                        <div className="session-mentor">with {session.mentor?.name || 'Your Mentor'}</div>
                        <div className="session-time">{formatDateTime(session.datetime)}</div>
                      </div>
                      <div className="session-actions">
                        <span className="session-status">Scheduled</span>
                        <button className="btn-join" onClick={() => handleJoinSession(session)}>Join</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <BsCalendarEvent />
                    </div>
                    <div className="empty-text">No upcoming sessions scheduled</div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="section-card">
              <div className="section-header">
                <div className="section-title">Recent Sessions</div>
                <div className="section-subtitle">Your completed mentorship sessions</div>
              </div>
              <div className="sessions-list">
                {dashboardData?.completedSessions && dashboardData.completedSessions.length > 0 ? (
                  dashboardData.completedSessions.slice(0, 3).map((session, index) => (
                    <div key={session._id || index} className="session-item completed">
                      <div className="session-avatar">
                        <div className="avatar-circle completed">
                          <div className="completion-icon">✓</div>
                        </div>
                      </div>
                      <div className="session-content">
                        <div className="session-title">{session.title || 'Completed Session'}</div>
                        <div className="session-mentor">with {session.mentor?.name || 'Your Mentor'}</div>
                        <div className="session-time">{formatDateTime(session.datetime)}</div>
                      </div>
                      <div className="session-actions">
                        <div className="session-rating">⭐⭐⭐⭐⭐</div>
                        <span className="session-status completed">Completed</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-text">No completed sessions yet</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="content-right">
            {/* Your Mentor */}
            <div className="section-card mb-6">
              <div className="section-header">
                <div className="section-title">Your Mentor</div>
              </div>
              <div className="mentor-card">
                <div className="mentor-avatar">
                  <div className="avatar-circle large">
                    {dashboardData?.mentor?.name ? getInitials(dashboardData.mentor.name) : 'M'}
                  </div>
                </div>
                <div className="mentor-info">
                  <div className="mentor-name">{dashboardData?.mentor?.name || 'No mentor assigned'}</div>
                  {dashboardData?.mentor?.designation && (
                    <div className="mentor-title">{dashboardData.mentor.designation}</div>
                  )}
                  {dashboardData?.mentor?.experience && (
                    <div className="mentor-experience">{dashboardData.mentor.experience}</div>
                  )}
                  <div className="mentor-details">
                    {dashboardData?.mentor?.specialization && (
                      <div className="detail-row">
                        <span className="detail-label">Specialization:</span>
                        <span className="detail-value">{dashboardData.mentor.specialization}</span>
                      </div>
                    )}
                    {dashboardData?.mentor?.email && (
                      <div className="detail-row">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{dashboardData.mentor.email}</span>
                      </div>
                    )}
                    {dashboardData?.mentor?.phone && (
                      <div className="detail-row">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{dashboardData.mentor.phone}</span>
                      </div>
                    )}
                    {dashboardData?.mentor?.bio && (
                      <div className="detail-row">
                        <span className="detail-label">Bio:</span>
                        <span className="detail-value">{dashboardData.mentor.bio}</span>
                      </div>
                    )}
                  </div>
                  <button className="btn-message-mentor">Message Mentor</button>
                </div>
              </div>
            </div>

            {/* Learning Progress */}
            <div className="section-card">
              <div className="section-header">
                <div className="section-title">Learning Progress</div>
              </div>
              <div className="progress-list">
                <div className="progress-item">
                  <div className="progress-info">
                    <span className="progress-label">Full Stack Development</span>
                    <span className="progress-percent">75%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '75%'}}></div>
                  </div>
                </div>
                
                <div className="progress-item">
                  <div className="progress-info">
                    <span className="progress-label">React.js</span>
                    <span className="progress-percent">90%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '90%'}}></div>
                  </div>
                </div>
                
                <div className="progress-item">
                  <div className="progress-info">
                    <span className="progress-label">Node.js</span>
                    <span className="progress-percent">60%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '60%'}}></div>
                  </div>
                </div>
                
                <div className="progress-item">
                  <div className="progress-info">
                    <span className="progress-label">Database Design</span>
                    <span className="progress-percent">45%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '45%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Modals */}
      {showTaskUploadModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Submit Your Work</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowTaskUploadModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <FileUpload
                  type="task"
                  onUploadSuccess={handleFileUploadSuccess}
                  onUploadError={handleFileUploadError}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showRequestSessionModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Request Residential Session</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowRequestSessionModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Message to Mentor (will be sent via WhatsApp):</label>
                <textarea
                  className="form-control mb-3"
                  rows="3"
                  value={requestMessage}
                  onChange={e => setRequestMessage(e.target.value)}
                  placeholder="Enter your message or reason for requesting a residential session..."
                />
                <button 
                  className="btn btn-success w-100"
                  onClick={handleSendWhatsAppRequest}
                  disabled={!requestMessage.trim()}
                >
                  Send via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
