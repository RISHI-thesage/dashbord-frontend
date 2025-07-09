import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { BsCheckCircle, BsPencil, BsSave } from 'react-icons/bs';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getProfile();
      setProfile(res.data.data);
      setForm(res.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await userAPI.updateProfile(form);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  if (!profile) {
    return <div className="alert alert-danger">Profile not found.</div>;
  }

  // Profile completion calculation
  const requiredFields = ['name', 'bio', 'designation', 'experience'];
  const completedFields = requiredFields.filter(f => form[f] && form[f].trim() !== '');
  const completion = Math.round((completedFields.length / requiredFields.length) * 100);

  // Avatar initials
  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="modern-dashboard">
      <div className="dashboard-container" style={{ maxWidth: 600, margin: '0 auto', marginTop: 80 }}>
        <div className="dashboard-card bg-soft-cream shadow" style={{ border: 'none', boxShadow: '0 4px 24px rgba(255,107,0,0.08)', padding: '2rem' }}>
          <div className="d-flex align-items-center mb-4">
            <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 70, height: 70, background: 'linear-gradient(135deg, #0D1B2A 0%, #FF6B00 100%)', color: '#FFF7EC', fontSize: 32, fontWeight: 700 }}>
              {getInitials(profile.name)}
            </div>
            <div>
              <h3 className="mb-1 text-deep-blue" style={{ fontWeight: 800 }}>{profile.name}</h3>
              <div className="text-muted">{profile.role && profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</div>
            </div>
            <div className="ms-auto">
              {!editMode ? (
                <button className="btn btn-outline-primary" onClick={() => setEditMode(true)}><BsPencil className="me-1" />Edit</button>
              ) : (
                <button className="btn btn-success" onClick={handleSave}><BsSave className="me-1" />Save</button>
              )}
            </div>
          </div>
          {/* Profile Completion Bar */}
          <div className="mb-4">
            <div className="d-flex align-items-center mb-1">
              <span className="me-2">Profile Completion</span>
              {completion === 100 && <BsCheckCircle className="text-success" />}
            </div>
            <div className="progress" style={{ height: 8 }}>
              <div className="progress-bar" style={{ width: `${completion}%`, background: 'linear-gradient(135deg, #FF6B00 0%, #FFB366 100%)' }}></div>
            </div>
            <small className="text-muted">{completion}% complete</small>
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          {success && <div className="alert alert-success py-2">{success}</div>}
          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input type="text" className="form-control" name="name" value={form.name || ''} onChange={handleChange} disabled={!editMode} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" name="email" value={form.email || ''} disabled readOnly />
            </div>
            {profile.role === 'mentor' && (
              <>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input type="text" className="form-control" name="phone" value={form.phone || ''} onChange={handleChange} disabled={!editMode} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Designation</label>
                  <input type="text" className="form-control" name="designation" value={form.designation || ''} onChange={handleChange} disabled={!editMode} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Experience</label>
                  <input type="text" className="form-control" name="experience" value={form.experience || ''} onChange={handleChange} disabled={!editMode} />
                </div>
              </>
            )}
            <div className="mb-3">
              <label className="form-label">Bio</label>
              <textarea className="form-control" name="bio" value={form.bio || ''} onChange={handleChange} rows={3} disabled={!editMode} />
            </div>
            {profile.role === 'student' && profile.assignedMentor && (
              <div className="mb-3 p-3 rounded bg-light border">
                <div className="fw-bold mb-1">Assigned Mentor</div>
                <div>{profile.assignedMentor.name} ({profile.assignedMentor.email})</div>
                <div className="text-muted small">{profile.assignedMentor.designation || 'Mentor'}</div>
              </div>
            )}
            {editMode && (
              <button type="submit" className="btn btn-primary w-100 mt-2">Save Changes</button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
