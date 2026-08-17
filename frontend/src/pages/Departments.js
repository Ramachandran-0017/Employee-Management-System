import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";

export default function Departments() {
  const { user } = useAuth();
  const isAdmin = user.role === "ADMIN";

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);

    api
      .get("/departments")
      .then(({ data }) => {
        setDepartments(data);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Could not load departments.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      await api.post("/departments", {
        name,
        description,
      });

      setName("");
      setDescription("");
      setBanner("Department created.");

      load();

      setTimeout(() => {
        setBanner("");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Could not create department.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (dept) => {
    if (
      !window.confirm(
        `Delete "${dept.name}"? Employees keep their record but lose this department tag.`,
      )
    ) {
      return;
    }

    try {
      await api.delete(`/departments/${dept.id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete department.");
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Departments</h1>
          <p>Groups used to organize the roster.</p>
        </div>
      </div>

      {banner && <div className="banner banner-success">{banner}</div>}

      {error && <div className="banner banner-error">{error}</div>}

      {isAdmin && (
        <div
          className="card"
          style={{
            padding: 18,
            marginBottom: 20,
          }}
        >
          <h3 style={{ marginBottom: 14 }}>Add a department</h3>

          <form onSubmit={handleCreate} className="form-grid">
            <div className="form-field">
              <label>Name</label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marketing"
              />
            </div>

            <div className="form-field">
              <label>Description (optional)</label>

              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this team does"
              />
            </div>

            <div
              className="form-field full"
              style={{
                alignItems: "flex-start",
              }}
            >
              <button
                className="btn btn-primary"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Adding…" : "Add department"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="empty-state">Loading departments…</div>
        ) : departments.length === 0 ? (
          <div className="empty-state">No departments yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Headcount</th>

                {isAdmin && <th></th>}
              </tr>
            </thead>

            <tbody>
              {departments.map((d) => (
                <tr key={d.id}>
                  <td className="emp-name">{d.name}</td>

                  <td
                    style={{
                      color: "var(--ink-soft)",
                    }}
                  >
                    {d.description || "—"}
                  </td>

                  {/* Department employee count */}
                  <td>{d.headcount ?? 0}</td>

                  {isAdmin && (
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-btn"
                          style={{
                            color: "#b3261e",
                          }}
                          onClick={() => handleDelete(d)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
