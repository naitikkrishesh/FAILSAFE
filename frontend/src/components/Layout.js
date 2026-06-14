import React, { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/dashboard", icon: "⬡", label: "Dashboard" },
  { to: "/students", icon: "◈", label: "Students" },
  { to: "/students/add", icon: "⊕", label: "Add Student" },
];

function SettingsMenu({ onClose }) {
  const { user, theme, toggleTheme, logout } = useAuth();
  const navigate = useNavigate();
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: "absolute", bottom: 70, left: 12, right: 12,
      background: "var(--bg2)", border: "1px solid var(--border)",
      borderRadius: 8, overflow: "hidden", zIndex: 200,
      boxShadow: "var(--card-shadow)",
    }}>
      {/* Profile */}
      <button
        onClick={() => { navigate("/profile"); onClose(); }}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", background: "none", border: "none",
          color: "var(--text)", cursor: "pointer", textAlign: "left",
          transition: "background 0.15s",
          borderBottom: "1px solid var(--border)",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--hover-bg)"}
        onMouseLeave={e => e.currentTarget.style.background = "none"}
      >
        <span style={{ fontSize: 16 }}>👤</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: "var(--text2)" }}>Edit Profile</div>
        </div>
      </button>

      {/* Dark/Light Mode Toggle */}
      <button
        onClick={() => { toggleTheme(); onClose(); }}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 10,
          padding: "12px 16px", background: "none", border: "none",
          color: "var(--text)", cursor: "pointer",
          borderBottom: "1px solid var(--border)",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--hover-bg)"}
        onMouseLeave={e => e.currentTarget.style.background = "none"}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>{theme === "dark" ? "☀️" : "🌙"}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text2)" }}>
              Currently: {theme === "dark" ? "Dark" : "Light"}
            </div>
          </div>
        </div>
        {/* Toggle pill */}
        <div style={{
          width: 40, height: 22, borderRadius: 11,
          background: theme === "dark" ? "var(--accent)" : "var(--border2)",
          position: "relative", transition: "background 0.3s", flexShrink: 0,
        }}>
          <div style={{
            position: "absolute", top: 3,
            left: theme === "dark" ? 21 : 3,
            width: 16, height: 16, borderRadius: "50%",
            background: "#fff", transition: "left 0.3s",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }} />
        </div>
      </button>

      {/* Logout */}
      <button
        onClick={() => { logout(); navigate("/login"); onClose(); }}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", background: "none", border: "none",
          color: "var(--danger)", cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(224,35,71,0.06)"}
        onMouseLeave={e => e.currentTarget.style.background = "none"}
      >
        <span style={{ fontSize: 16 }}>↩</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Logout</span>
      </button>
    </div>
  );
}

export default function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 220,
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        transition: "width 0.25s",
        position: "fixed", top: 0, left: 0, bottom: 0,
        zIndex: 100, overflow: "hidden",
      }}>
        {/* Fix 7: Logo click → home page */}
        <div
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "20px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 12,
            minHeight: 64, cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--hover-bg)"}
          onMouseLeave={e => e.currentTarget.style.background = ""}
        >
          <div style={{
            width: 32, height: 32, background: "var(--accent)", borderRadius: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Space Mono", fontWeight: 700, fontSize: 14,
            color: "#fff", flexShrink: 0,
          }}>FS</div>
          {!collapsed && (
            <span style={{ fontFamily: "Space Mono", fontWeight: 700, fontSize: 16, letterSpacing: 2, color: "var(--text)" }}>
              FAILSAFE
            </span>
          )}
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 16px",
                color: isActive ? "var(--accent)" : "var(--text2)",
                textDecoration: "none",
                fontFamily: "Space Mono", fontSize: 12, fontWeight: 700,
                letterSpacing: "0.05em", textTransform: "uppercase",
                background: isActive ? "rgba(224,35,71,0.08)" : "transparent",
                borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                transition: "all 0.15s",
              })}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: settings + collapse */}
        <div style={{ borderTop: "1px solid var(--border)", padding: 12, position: "relative" }}>
          {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}

          {!collapsed && (
            <div style={{ padding: "6px 4px", marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name}
              </div>
              <div style={{ color: "var(--text3)", fontSize: 11, fontFamily: "Space Mono", textTransform: "uppercase" }}>
                {user?.role}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setShowSettings(s => !s)}
              className="btn btn-ghost btn-sm"
              style={{ flex: 1, justifyContent: "center" }}
              title="Settings"
            >
              {collapsed ? "⚙" : "⚙ Settings"}
            </button>
            {/* <button
              onClick={() => setCollapsed(c => !c)}
              className="btn btn-ghost btn-sm"
              style={{ padding: "6px 10px" }}
            >
              {collapsed ? "→" : "←"}
            </button> */}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: collapsed ? 64 : 220,
        flex: 1, padding: "32px 36px",
        transition: "margin-left 0.25s",
        minHeight: "100vh",
        background: "var(--bg)",
      }}>
        <Outlet />
      </main>
    </div>
  );
}
  