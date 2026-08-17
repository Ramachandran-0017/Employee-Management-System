import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="mark" />
          Roster
        </div>

        <div className="sidebar-section-label">Workspace</div>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
            <NavLink to="/employees">Employees</NavLink>
          )}
          {user.role === 'EMPLOYEE' && <NavLink to="/me">My Profile</NavLink>}
          <NavLink to="/departments">Departments</NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="who">
            Signed in as <strong>{user.username}</strong>
            <span className="badge-role">{user.role}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
