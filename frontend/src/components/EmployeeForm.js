import React, { useEffect, useState } from 'react';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  salary: '',
  dateOfJoining: '',
  status: 'ACTIVE',
  departmentId: '',
};

export default function EmployeeForm({ initial, departments, onCancel, onSubmit, submitting, serverErrors }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({
        firstName: initial.firstName || '',
        lastName: initial.lastName || '',
        email: initial.email || '',
        phone: initial.phone || '',
        jobTitle: initial.jobTitle || '',
        salary: initial.salary ?? '',
        dateOfJoining: initial.dateOfJoining || '',
        status: initial.status || 'ACTIVE',
        departmentId: initial.departmentId || '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [initial]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.phone && !/^[0-9+()\-\s]{7,20}$/.test(form.phone)) e.phone = 'Enter a valid phone number';
    if (!form.jobTitle.trim()) e.jobTitle = 'Job title is required';
    if (form.salary === '' || Number(form.salary) < 0) e.salary = 'Enter a valid salary';
    if (!form.dateOfJoining) e.dateOfJoining = 'Date of joining is required';
    else if (new Date(form.dateOfJoining) > new Date()) e.dateOfJoining = 'Date cannot be in the future';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      salary: Number(form.salary),
      departmentId: form.departmentId ? Number(form.departmentId) : null,
    });
  };

  const fieldError = (name) => errors[name] || serverErrors?.[name];

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className={`form-field ${fieldError('firstName') ? 'has-error' : ''}`}>
          <label>First name</label>
          <input value={form.firstName} onChange={update('firstName')} />
          {fieldError('firstName') && <span className="field-error">{fieldError('firstName')}</span>}
        </div>

        <div className={`form-field ${fieldError('lastName') ? 'has-error' : ''}`}>
          <label>Last name</label>
          <input value={form.lastName} onChange={update('lastName')} />
          {fieldError('lastName') && <span className="field-error">{fieldError('lastName')}</span>}
        </div>

        <div className={`form-field ${fieldError('email') ? 'has-error' : ''}`}>
          <label>Email</label>
          <input type="email" value={form.email} onChange={update('email')} />
          {fieldError('email') && <span className="field-error">{fieldError('email')}</span>}
        </div>

        <div className={`form-field ${fieldError('phone') ? 'has-error' : ''}`}>
          <label>Phone (optional)</label>
          <input value={form.phone} onChange={update('phone')} placeholder="+1 555 000 1234" />
          {fieldError('phone') && <span className="field-error">{fieldError('phone')}</span>}
        </div>

        <div className={`form-field ${fieldError('jobTitle') ? 'has-error' : ''}`}>
          <label>Job title</label>
          <input value={form.jobTitle} onChange={update('jobTitle')} />
          {fieldError('jobTitle') && <span className="field-error">{fieldError('jobTitle')}</span>}
        </div>

        <div className={`form-field ${fieldError('salary') ? 'has-error' : ''}`}>
          <label>Annual salary (USD)</label>
          <input type="number" min="0" step="0.01" value={form.salary} onChange={update('salary')} />
          {fieldError('salary') && <span className="field-error">{fieldError('salary')}</span>}
        </div>

        <div className={`form-field ${fieldError('dateOfJoining') ? 'has-error' : ''}`}>
          <label>Date of joining</label>
          <input type="date" value={form.dateOfJoining} onChange={update('dateOfJoining')} />
          {fieldError('dateOfJoining') && <span className="field-error">{fieldError('dateOfJoining')}</span>}
        </div>

        <div className="form-field">
          <label>Status</label>
          <select value={form.status} onChange={update('status')}>
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On leave</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>

        <div className="form-field full">
          <label>Department</label>
          <select value={form.departmentId} onChange={update('departmentId')}>
            <option value="">Unassigned</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add employee'}
        </button>
      </div>
    </form>
  );
}
