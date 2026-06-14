import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "faculty", department: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
        backgroundSize: "40px 40px", opacity: 0.3,
      }} />

      <div className="fade-in" style={{ width: "100%", maxWidth: 460, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 48, height: 48, background: "var(--accent)", borderRadius: 8,
            fontFamily: "Space Mono", fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 12,
          }}>FS</div>
          <h1 style={{ fontSize: 24, fontFamily: "Space Mono", letterSpacing: 3, color: "var(--text)" }}>FAILSAFE</h1>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 18, marginBottom: 24, fontFamily: "Space Mono", color: "var(--text)" }}>
            Create Account
          </h2>

          {error && (
            <div style={{
              background: "rgba(224,35,71,0.1)", border: "1px solid rgba(224,35,71,0.3)",
              borderRadius: 4, padding: "10px 14px", marginBottom: 20,
              color: "var(--danger)", fontSize: 13,
            }}>⚠ {error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Dr. Jane Smith"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="faculty@institution.edu"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="********"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={labelStyle}>Department</label>
              <input
                name="department"
                type="text"
                placeholder="Physics"
                value={form.department}
                onChange={handleChange}
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", padding: "13px 20px", marginTop: 6 }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: "center", color: "var(--text2)", fontSize: 13 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: 11, fontFamily: "Space Mono",
  color: "var(--text2)", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.08em",
};
