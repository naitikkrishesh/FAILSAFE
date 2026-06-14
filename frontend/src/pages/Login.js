import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
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
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
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

      <div className="fade-in" style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 56, height: 56, background: "var(--accent)", borderRadius: 8,
            fontFamily: "Space Mono", fontWeight: 700, fontSize: 22, color: "#fff", marginBottom: 16,
          }}>FS</div>
          <h1 style={{ fontSize: 28, fontFamily: "Space Mono", letterSpacing: 4, color: "var(--text)" }}>FAILSAFE</h1>
          
        </div>

        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 18, marginBottom: 24, fontFamily: "Space Mono", color: "var(--text)" }}>
           Login
          </h2>

          {error && (
            <div style={{
              background: "rgba(224,35,71,0.1)", border: "1px solid rgba(224,35,71,0.3)",
              borderRadius: 4, padding: "10px 14px", marginBottom: 20,
              color: "var(--danger)", fontSize: 13,
            }}>⚠ {error}</div>
          )}

          
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="faculty@institution.edu"
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", padding: "13px 20px", marginTop: 4 }}
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: "center", color: "var(--text2)", fontSize: 13 }}>
            Not Having an Account ? {" "}
            <Link to="/register" style={{ color: "var(--accent)", textDecoration: "none" }}>
              Register here
            </Link>
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
