import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import EmployeeForm from '../components/EmployeeForm';

const STATUS_LABEL = { ACTIVE: 'Active', ON_LEAVE: 'On leave', TERMINATED: 'Terminated' };

export default function EmployeeList() {
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState(null);
  const [banner, setBanner] = useState('');

  const loadEmployees = async (search) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/employees', { params: search ? { keyword: search } : {} });
      setEmployees(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees('');
    api.get('/departments').then(({ data }) => setDepartments(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadEmployees(keyword), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const openCreate = () => {
    setEditingEmployee(null);
    setServerErrors(null);
    setModalOpen(true);
  };

  const openEdit = (emp) => {
    setEditingEmployee(emp);
    setServerErrors(null);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setServerErrors(null);
    try {
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.id}`, payload);
        setBanner('Employee updated.');
      } else {
        await api.post('/employees', payload);
        setBanner('Employee added.');
      }
      setModalOpen(false);
      loadEmployees(keyword);
      setTimeout(() => setBanner(''), 3000);
    } catch (err) {
      if (err.response?.status === 400 && err.response.data.fieldErrors) {
        setServerErrors(err.response.data.fieldErrors);
      } else {
        setServerErrors({ _general: err.response?.data?.error || 'Could not save employee.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (emp) => {
    if (!window.confirm(`Remove ${emp.firstName} ${emp.lastName} from the roster?`)) return;
    try {
      await api.delete(`/employees/${emp.id}`);
      setBanner('Employee removed.');
      loadEmployees(keyword);
      setTimeout(() => setBanner(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not delete employee.');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Employee roster</h1>
          <p>{employees.length} {employees.length === 1 ? 'person' : 'people'} on record</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>+ Add employee</button>
        )}
      </div>

      {banner && <div className="banner banner-success">{banner}</div>}
      {error && <div className="banner banner-error">{error}</div>}

      <div className="card">
        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search by name, email, or title…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="empty-state">Loading roster…</div>
        ) : employees.length === 0 ? (
          <div className="empty-state">No employees match your search.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Title</th>
                <th>Department</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td><span className="emp-id">#{String(emp.id).padStart(4, '0')}</span></td>
                  <td>
                    <div className="emp-name">{emp.firstName} {emp.lastName}</div>
                    <div className="emp-email">{emp.email}</div>
                  </td>
                  <td>{emp.jobTitle}</td>
                  <td>{emp.departmentName ? <span className="tag">{emp.departmentName}</span> : '—'}</td>
                  <td><span className={`status-dot status-${emp.status}`}>{STATUS_LABEL[emp.status]}</span></td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => openEdit(emp)}>Edit</button>
                      {isAdmin && (
                        <button className="icon-btn" style={{ color: '#b3261e' }} onClick={() => handleDelete(emp)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-card">
            <h2 style={{ marginBottom: 4 }}>{editingEmployee ? 'Edit employee' : 'Add employee'}</h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 4, marginBottom: 20 }}>
              {editingEmployee ? `Updating ${editingEmployee.firstName} ${editingEmployee.lastName}` : 'Fill in the details below.'}
            </p>
            {serverErrors?._general && <div className="banner banner-error">{serverErrors._general}</div>}
            <EmployeeForm
              initial={editingEmployee}
              departments={departments}
              onCancel={closeModal}
              onSubmit={handleSubmit}
              submitting={submitting}
              serverErrors={serverErrors}
            />
          </div>
        </div>
      )}
    </>
  );
}
