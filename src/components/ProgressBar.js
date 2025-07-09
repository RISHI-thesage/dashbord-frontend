// Basic progress bar component
const ProgressBar = ({ skillName, percentage, showPercentage = true, color = '#FF6B00' }) => {
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between mb-1">
        <small className="fw-medium">{skillName}</small>
        {showPercentage && <small className="text-muted">{percentage}%</small>}
      </div>
      <div className="progress-bar-custom">
        <div 
          className="progress-bar-fill" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color
          }}
        ></div>
      </div>
    </div>
  );
};

// Dashboard progress tracker (HTML, JS, CSS, Other)
export const DashboardProgressTracker = ({ progress }) => {
  const progressColors = {
    html: '#FF6B00',
    js: '#28a745', 
    css: '#17a2b8',
    other: '#ffc107'
  };

  const progressLabels = {
    html: 'HTML',
    js: 'JavaScript',
    css: 'CSS',
    other: 'Other'
  };

  return (
    <div className="dashboard-progress">
      <h5 className="fw-bold mb-3">Learning Progress</h5>
      <div className="alert alert-info p-2 mb-3" style={{ fontSize: '0.95em' }}>
        <i className="bi bi-info-circle me-1"></i> Your progress is updated by your mentor after each session.
      </div>
      {Object.entries(progress).map(([skill, percentage]) => (
        <div key={skill} className="mb-2">
          {progressLabels[skill]}
          <div className="progress">
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{ 
                width: `${percentage}%`, 
                backgroundColor: progressColors[skill] 
              }} 
              aria-valuenow={percentage} 
              aria-valuemin="0" 
              aria-valuemax="100"
            >
              {percentage}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Dashboard progress editor for mentors
export const DashboardProgressEditor = ({ progress, onProgressUpdate, studentName }) => {
  const handleProgressUpdate = (skillKey, newPercentage) => {
    onProgressUpdate({ ...progress, [skillKey]: newPercentage });
  };

  const progressLabels = {
    html: 'HTML',
    js: 'JavaScript', 
    css: 'CSS',
    other: 'Other'
  };

  const progressColors = {
    html: '#FF6B00',
    js: '#28a745',
    css: '#17a2b8', 
    other: '#ffc107'
  };

  return (
    <div className="dashboard-progress-editor">
      <h6 className="mb-3">Update Progress for {studentName}</h6>
      {Object.entries(progress).map(([skill, percentage]) => (
        <div key={skill} className="mb-3">
          <div className="d-flex justify-content-between mb-1">
            <small className="fw-medium">{progressLabels[skill]}</small>
            <small className="text-muted">{percentage}%</small>
          </div>
          <div className="progress-bar-custom mb-2">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${percentage}%`,
                backgroundColor: progressColors[skill]
              }}
            ></div>
          </div>
          <input
            type="range"
            className="form-range"
            min="0"
            max="100"
            value={percentage}
            onChange={(e) => handleProgressUpdate(skill, parseInt(e.target.value))}
            style={{ height: '6px' }}
          />
        </div>
      ))}
    </div>
  );
};
