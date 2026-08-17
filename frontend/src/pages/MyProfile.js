import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

const STATUS_LABEL = { ACTIVE: 'Active', ON_LEAVE: 'On leave', TERMINATED: 'Terminated' };

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/employees/me')
      .then(({ data }) => setProfile(data))
      .catch((err) => setError(err.response?.data?.error || 'No employee profile is linked to your account yet. Ask an admin to link one.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>My profile</h1>
          <p>What Roster has on file for you.</p>
        </div>
      </div>

      {loading && <div className="card empty-state">Loading…</div>}
      {error && <div className="banner banner-error">{error}</div>}

      {profile && (
        <div className="card" style={{ padding: 24, maxWidth: 480 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2>{profile.firstName} {profile.lastName}</h2>
              <p style={{ color: 'var(--ink-soft)', margin: '4px 0 0' }}>{profile.jobTitle}</p>
            </div>
            <span className={`status-dot status-${profile.status}`}>{STATUS_LABEL[profile.status]}</span>
          </div>

          <div style={{ marginTop: 20, display: 'grid', gap: 12 }}>
            <Row label="Email" value={profile.email} />
            <Row label="Phone" value={profile.phone || '—'} />
            <Row label="Department" value={profile.departmentName || 'Unassigned'} />
            <Row label="Date of joining" value={profile.dateOfJoining} />
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eef0f2', paddingBottom: 10 }}>
      <span style={{ color: 'var(--ink-soft)', fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: 500, fontSize: 13.5 }}>{value}</span>
    </div>
  );
}
