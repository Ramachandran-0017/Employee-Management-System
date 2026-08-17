import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user.role === 'ADMIN' || user.role === 'MANAGER') {
      api.get('/employees')
        .then(({ data }) => {
          const active = data.filter((e) => e.status === 'ACTIVE').length;
          const onLeave = data.filter((e) => e.status === 'ON_LEAVE').length;
          setStats({ total: data.length, active, onLeave });
        })
        .catch(() => setError('Could not load employee stats.'));
    }
  }, [user.role]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Good to see you, {user.username}</h1>
          <p>Here's a quick look at your workspace.</p>
        </div>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {(user.role === 'ADMIN' || user.role === 'MANAGER') && stats && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="num">{stats.total}</div>
            <div className="label">Total employees</div>
          </div>
          <div className="stat-card">
            <div className="num">{stats.active}</div>
            <div className="label">Active</div>
          </div>
          <div className="stat-card">
            <div className="num">{stats.onLeave}</div>
            <div className="label">On leave</div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ marginBottom: 10 }}>Quick links</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
            <Link className="btn btn-secondary" to="/employees">View employee roster</Link>
          )}
          {user.role === 'EMPLOYEE' && (
            <Link className="btn btn-secondary" to="/me">View my profile</Link>
          )}
          <Link className="btn btn-secondary" to="/departments">Browse departments</Link>
        </div>
      </div>
    </>
  );
}
