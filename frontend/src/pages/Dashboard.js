import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const COLORS = { high: "#ff3c5f", medium: "#ffb830", low: "#00d68f" };

function StatCard({ label, value, sub, color, onClick }) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        borderLeft: `3px solid ${color || "var(--border)"}`,
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow)"; }}}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontSize: 36, fontFamily: "var(--mono)", fontWeight: 700, color: color || "var(--text)", lineHeight: 1 }}>
        {value ?? "—"}
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 4, padding: "10px 14px" }}>
      <p style={{ fontFamily: "var(--mono)", fontSize: 12, marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: COLORS[p.name] || p.color, fontSize: 12 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/stats")
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pieData = stats ? [
    { name: "High Risk", value: stats.high_risk, color: COLORS.high },
    { name: "Medium Risk", value: stats.medium_risk, color: COLORS.medium },
    { name: "Low Risk", value: stats.low_risk, color: COLORS.low },
  ] : [];

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ fontFamily: "var(--mono)", color: "var(--text2)", animation: "pulse 1.5s infinite" }}>
        Loading intelligence...
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 26, letterSpacing: 1 }}>Risk Dashboard</h1>
            <p style={{ color: "var(--text2)", marginTop: 4 }}>
              Welcome back, {user?.name} — {user?.department || "Faculty"}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/students/add")}>
            Add Student
          </button>
        </div>
        <div style={{ height: 1, background: "var(--border)", marginTop: 20 }} />
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Students" value={stats?.total_students} color="var(--info)" />
        <StatCard
          label="High Risk" value={stats?.high_risk} color={COLORS.high}
          sub="Requires immediate action"
          onClick={() => navigate("/students?risk=high")}
        />
        <StatCard
          label="Medium Risk" value={stats?.medium_risk} color={COLORS.medium}
          sub="Monitor closely"
          onClick={() => navigate("/students?risk=medium")}
        />
        <StatCard
          label="Low Risk" value={stats?.low_risk} color={COLORS.low}
          sub="On track"
          onClick={() => navigate("/students?risk=low")}
        />
        <StatCard label="Avg Risk Score" value={stats ? `${(stats.avg_risk_score * 100).toFixed(0)}%` : null} color="var(--purple)" />
        <StatCard label="Pending Actions" value={stats?.interventions_pending} color="var(--warn)" />
        <StatCard label="Completed" value={stats?.interventions_completed} color={COLORS.low} />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 24 }}>
        {/* Trend Chart */}
        {/* <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 14 }}>Risk Trend</h3>
            <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text3)" }}>LAST 5 DAYS</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats?.risk_trend || []}>
              <defs>
                <linearGradient id="gradHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.high} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.high} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradMed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.medium} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.medium} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="var(--text3)" tick={{ fontSize: 11, fontFamily: "var(--mono)" }} />
              <YAxis stroke="var(--text3)" tick={{ fontSize: 11, fontFamily: "var(--mono)" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="high" stroke={COLORS.high} fill="url(#gradHigh)" strokeWidth={2} />
              <Area type="monotone" dataKey="medium" stroke={COLORS.medium} fill="url(#gradMed)" strokeWidth={2} />
              <Area type="monotone" dataKey="low" stroke={COLORS.low} fill="none" strokeWidth={2} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div> */}

        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 20 }}>Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData} cx="50%" cy="50%"
                innerRadius={50} outerRadius={80}
                paddingAngle={3} dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 4 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                  <span style={{ fontSize: 12, color: "var(--text2)" }}>{d.name}</span>
                </div>
                <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: d.color }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text2)", alignSelf: "center", marginRight: 8 }}>
          QUICK ACTIONS:
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate("/students?risk=high")}>
          🔴 View High-Risk Students
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate("/students")}>
          ◈ All Students
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => navigate("/students/add")}>
          ⊕ Upload CSV
        </button>
      </div>
    </div>
  );
}
