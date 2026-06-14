import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function EditProfile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    department: user?.department || "",
    role: user?.role || "faculty",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(false); setLoading(true);
    try {
      await updateProfile(form);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 520, margin: "0 auto" }}>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1 style={{ fontSize: 24, letterSpacing: 1, marginBottom: 6, color: "var(--text)" }}>Edit Profile</h1>
      <p style={{ color: "var(--text2)", marginBottom: 28 }}>Update your account information</p>

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "var(--accent)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "Space Mono", fontWeight: 700, fontSize: 22,
        }}>
          {(form.name || user?.name || "?").charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16, color: "var(--text)" }}>{form.name || user?.name}</div>
          <div style={{ color: "var(--text2)", fontSize: 13 }}>{user?.email}</div>
          <div style={{ color: "var(--text3)", fontSize: 12, fontFamily: "Space Mono", textTransform: "uppercase", marginTop: 2 }}>
            {user?.role}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 32 }}>
        {error && (
          <div style={{
            background: "rgba(224,35,71,0.1)", border: "1px solid rgba(224,35,71,0.3)",
            borderRadius: 4, padding: "10px 14px", marginBottom: 20,
            color: "var(--danger)", fontSize: 13,
          }}>⚠ {error}</div>
        )}

        {success && (
          <div style={{
            background: "rgba(0,168,107,0.1)", border: "1px solid rgba(0,168,107,0.3)",
            borderRadius: 4, padding: "10px 14px", marginBottom: 20,
            color: "var(--safe)", fontSize: 13,
          }}>✓ Profile updated successfully! Redirecting...</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Dr. Jane Smith"
            />
          </div>

          {/* Email is read-only — can't change */}
          <div>
            <label style={labelStyle}>Email (cannot be changed)</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              style={{ opacity: 0.5, cursor: "not-allowed" }}
            />
          </div>

          <div>
            <label style={labelStyle}>Department</label>
            <input
              name="department"
              type="text"
              value={form.department}
              onChange={handleChange}
              placeholder="Computer Science"
            />
          </div>

          <div>
            <label style={labelStyle}>Role</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="faculty">Faculty</option>
              <option value="hod">Head of Department (HOD)</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate(-1)}
              style={{ flex: 1, justifyContent: "center" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 2, justifyContent: "center" }}
            >
              {loading ? "Saving..." : "Save Changes →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: 11, fontFamily: "Space Mono",
  color: "var(--text2)", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.08em",
};
