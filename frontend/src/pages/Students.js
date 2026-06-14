import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";

function RiskBadge({ label }) {
  if (!label) return <span className="badge" style={{ background: "var(--bg3)", color: "var(--text3)" }}>—</span>;
  return <span className={`badge badge-${label}`}>● {label}</span>;
}

function RiskBar({ score }) {
  if (score == null) return null;
  const pct = Math.round(score * 100);
  const color = score >= 0.65 ? "var(--danger)" : score >= 0.35 ? "var(--warn)" : "var(--safe)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: "var(--bg3)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.5s" }} />
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color, minWidth: 32 }}>{pct}%</span>
    </div>
  );
}

export default function Students() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState(searchParams.get("risk") || "all");
  const [predicting, setPredicting] = useState(null);

  useEffect(() => {
    const params = riskFilter !== "all" ? `?risk_filter=${riskFilter}` : "";
    api.get(`/students/${params}`)
      .then(r => setStudents(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [riskFilter]);

  const runPredict = async (e, studentId) => {
    e.stopPropagation();
    setPredicting(studentId);
    try {
      await api.post(`/predictions/predict/${studentId}`);
      const r = await api.get("/students/");
      setStudents(r.data);
    } catch {}
    setPredicting(null);
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, letterSpacing: 1 }}>Students</h1>
          <p style={{ color: "var(--text2)", marginTop: 2 }}>{students.length} students enrolled</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/students/add")}>
          ⊕ Add / Upload
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          placeholder="Search by name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        {["all", "high", "medium", "low"].map(r => (
          <button
            key={r}
            onClick={() => setRiskFilter(r)}
            className={`btn btn-sm ${riskFilter === r ? "btn-primary" : "btn-ghost"}`}
          >
            {r === "all" ? "All Students" : `Students at ${r.charAt(0).toUpperCase() + r.slice(1)} Risk`}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text2)", fontFamily: "var(--mono)", animation: "pulse 1.5s infinite" }}>
          Loading students...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>◈</div>
          <div style={{ color: "var(--text2)" }}>No students found.</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/students/add")}>
            Add First Student
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Student ID", "Name", "Absences", "G1", "G2", "Failures", "Risk", "Score", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "14px 16px", textAlign: "left",
                    fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    color: "var(--text3)", background: "var(--bg3)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const pred = s.latest_prediction;
                return (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/students/${s.id}`)}
                    style={{
                      cursor: "pointer",
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}
                  >
                    <td style={{ padding: "14px 16px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--text2)" }}>
                      {s.student_id}
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: 500 }}>{s.name}</td>
                    <td style={{ padding: "14px 16px", fontFamily: "var(--mono)", color: s.absences > 15 ? "var(--warn)" : "var(--text2)" }}>
                      {s.absences ?? "—"}
                    </td>
                    <td style={{ padding: "14px 16px", fontFamily: "var(--mono)", color: s.g1 < 8 ? "var(--danger)" : "var(--text2)" }}>
                      {s.g1 ?? "—"}
                    </td>
                    <td style={{ padding: "14px 16px", fontFamily: "var(--mono)", color: s.g2 < 8 ? "var(--danger)" : "var(--text2)" }}>
                      {s.g2 ?? "—"}
                    </td>
                    <td style={{ padding: "14px 16px", fontFamily: "var(--mono)", color: s.failures > 0 ? "var(--danger)" : "var(--text2)" }}>
                      {s.failures ?? 0}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <RiskBadge label={pred?.risk_label} />
                    </td>
                    <td style={{ padding: "14px 16px", minWidth: 140 }}>
                      <RiskBar score={pred?.risk_score} />
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        disabled={predicting === s.id}
                        onClick={e => runPredict(e, s.id)}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {predicting === s.id ? "..." : " Predict"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
