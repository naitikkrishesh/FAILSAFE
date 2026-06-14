import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import api from "../utils/api";

const INTERVENTION_ICONS = {
  counselling: "🧠", extra_classes: "📚", study_plan: "📋",
  attendance_monitoring: "📊", academic_support: "🎯",
  wellness_check: "❤️", motivation_session: "🚀", progress_monitoring: "📈",
};

// const FIELD_GROUPS = [
//   { title: "Basic Info", fields: [
//     { name: "name", label: "Name", type: "text" },
//     { name: "age", label: "Age", type: "number" },
//     { name: "gender", label: "Gender", type: "select", options: ["M","F"] },
//     { name: "school", label: "School", type: "select", options: ["GP","MS"] },
//     { name: "address", label: "Address", type: "select", options: ["U","R"] },
//   ]},
//   { title: "Academic", fields: [
//     { name: "studytime", label: "Study Time (1-4)", type: "number" },
//     { name: "failures", label: "Failures", type: "number" },
//     { name: "absences", label: "Absences", type: "number" },
//     { name: "g1", label: "G1 Grade", type: "number" },
//     { name: "g2", label: "G2 Grade", type: "number" },
//     { name: "g3", label: "G3 Final", type: "number" },
//     { name: "higher", label: "Higher Edu", type: "select", options: ["yes","no"] },
//     { name: "schoolsup", label: "School Support", type: "select", options: ["yes","no"] },
//   ]},
//   { title: "Family", fields: [
//     { name: "famsize", label: "Family Size", type: "select", options: ["LE3","GT3"] },
//     { name: "pstatus", label: "Parent Status", type: "select", options: ["T","A"] },
//     { name: "medu", label: "Mother Edu (0-4)", type: "number" },
//     { name: "fedu", label: "Father Edu (0-4)", type: "number" },
//     { name: "mjob", label: "Mother Job", type: "select", options: ["teacher","health","services","at_home","other"] },
//     { name: "fjob", label: "Father Job", type: "select", options: ["teacher","health","services","at_home","other"] },
//     { name: "guardian", label: "Guardian", type: "select", options: ["mother","father","other"] },
//     { name: "famrel", label: "Family Rel (1-5)", type: "number" },
//   ]},
//   { title: "Lifestyle", fields: [
//     { name: "freetime", label: "Freetime (1-5)", type: "number" },
//     { name: "goout", label: "Goes Out (1-5)", type: "number" },
//     { name: "dalc", label: "Weekday Alcohol (1-5)", type: "number" },
//     { name: "walc", label: "Weekend Alcohol (1-5)", type: "number" },
//     { name: "health", label: "Health (1-5)", type: "number" },
//     { name: "internet", label: "Internet", type: "select", options: ["yes","no"] },
//     { name: "romantic", label: "Romantic", type: "select", options: ["yes","no"] },
//   ]},
// ];


const FIELD_GROUPS = [
  {
    title: "Basic Info",
    fields: [
      { name: "student_id", label: "Student ID", placeholder: "STU001", required: true },
      { name: "name", label: "Full Name", placeholder: "John Doe", required: true },
      { name: "age", label: "Age", type: "number", placeholder: "17" },
      { name: "gender", label: "Gender", type: "select", options: ["M", "F"],full_option: ["Male", "Female"], required: true  },
      { name: "school", label: "School", type: "select", options: ["GP", "MS"],full_option: ["Gabriel Pereira (GP)" , "Mousinho da Silveira (MS)"] , required: true  },
      { name: "address", label: "Address", type: "select", options: ["U", "R"],full_option: ["Urban" , "Rular"], required: true   },
    ]
  },
  {
    title: "Family",
    fields: [
      { name: "famsize", label: "Family Size", type: "select", options: ["LE3", "GT3"] ,full_option: ["Less than or equal to 3" , "Greater than 3"], required: true  },
      { name: "pstatus", label: "Parent Status", type: "select", options: ["T", "A"] ,full_option: ["Living together" , "Divorced"], required: true  },
      { name: "medu", label: "Mother Education", type: "select", options: [1, 2, 3, 4, 0] ,full_option: ["Primary education (upto 4th grade)", "5th to 9th grade", "Secondary education", "Higher education" , "No education"], required: true  },
      { name: "fedu", label: "Father Education", type: "select", options: [1, 2, 3, 4, 0] ,full_option: ["Primary education (upto 4th grade)", "5th to 9th grade", "Secondary education", "Higher education" , "No education"] , required: true },
      { name: "mjob", label: "Mother's Job", type: "select", options: ["teacher", "health", "services", "at_home", "other"], full_option: ["Teacher", "Health care professional", "Services (e.g. administrative or police)", "Home manager", "Other"], required: true },
      { name: "fjob", label: "Father's Job", type: "select", options: ["teacher", "health", "services", "at_home", "other"], full_option: ["Teacher", "Health care professional", "Services (e.g. administrative or police)", "Home Servent", "Other"] , required: true },
      { name: "guardian", label: "Guardian", type: "select", options: ["mother", "father", "other"]  ,full_option:["Mother", "Father", "Other"], required: true },
      { name: "famrel", label: "Family Relations", type: "select", options: [1, 2, 3, 4, 5] ,full_option: ["Very bad", "Bad" , "Good" ,"Better" , "Excellent"] , required: true },

    ]
  },
  {
    title: "Academic",
    fields: [
      { name: "traveltime", label: "Home to school travel time", type: "select", options: [1, 2, 3, 4] ,full_option: ["Less than 15 minutes", "15 to 30 minutes" , "30 minutes to 1 hour","More than 1 hour"], required: true },
      { name: "studytime", label: "Weekly study time", type: "select", options: [1, 2, 3, 4] ,full_option: ["Less than 2 hours", "2 to 5 hours" , "5 to 10 hours","More than 10 hours"], required: true },
      { name: "failures", label: "Number of past class failures", type: "select", options: [0,1, 2, 3, 4] ,full_option: ["Never failed","Only once", "Twice" , "Thrice" ,"4 or More"] , required: true  },
      { name: "absences", label: "Number of absences", type: "number", placeholder: "0" , required: true },
      { name: "reason", label: "Reason to choose this school", type: "select", options: ["home", "reputation", "course", "other"],full_option: ["Close to home", "Reputation of school", "Course preference", "Other"], required: true  },
    ]
  },
  {
    title: "Support & Lifestyle ",
    fields: [
      { name: "schoolsup", label: "Extra educational support from school", type: "select", options: ["yes", "no"] , full_option: ["Yes", "No"], required: true },
      { name: "famsup", label: "Educational support from Family", type: "select", options: ["yes", "no"] , full_option: ["Yes", "No"], required: true },
      { name: "paid", label: "Extra paid classes within the course subject", type: "select", options: ["yes", "no"] , full_option: ["Yes", "No"], required: true },
      { name: "activities", label: "Activities", type: "select", options: ["yes", "no"], full_option: ["Yes", "No"], required: true  },
      { name: "nursery", label: "Attended Nursery School", type: "select", options: ["yes", "no"] , full_option: ["Yes", "No"], required: true },
      { name: "higher", label: "Wants to take higher education", type: "select", options: ["yes", "no"] , full_option: ["Yes", "No"], required: true },
      { name: "internet", label: "Internet Access at home", type: "select", options: ["yes", "no"] , full_option: ["Yes", "No"], required: true },
      { name: "romantic", label: "In a Romantic Relationship", type: "select", options: ["yes", "no"] , full_option: ["Yes", "No"], required: true },
      { name: "freetime", label: "Free time after school",  type: "select", options: [1, 2, 3, 4, 5] ,full_option: ["Not at all", "Rarely" , "Sometimes" ,"Often" , "Always"] , required: true },
      { name: "goout", label: "going out with friends",  type: "select", options: [1, 2, 3, 4, 5] ,full_option: ["Not at all", "Rarely" , "Sometimes" ,"Often" , "Always"] , required: true },
      { name: "Dalc", label: "Weekday alcohol consumption",  type: "select", options: [1, 2, 3, 4, 5] ,full_option: ["Not at all", "Rarely" , "Sometimes" ,"Often" , "Always"] , required: true },
      { name: "Walc", label: "Weekend alcohol consumption",  type: "select", options: [1, 2, 3, 4, 5] ,full_option: ["Not at all", "Rarely" , "Sometimes" ,"Often" , "Always"] , required: true },
      { name: "health", label: "Current health status", type: "select", options: [1, 2, 3, 4, 5] ,full_option: ["Very bad", "Bad" , "Good" ,"Better" , "Excellent"] , required: true },
      
    ]
  },
  {
    title: "Grades",
    fields: [
      { name: "g1", label: "G1 Grade (0-20)", type: "number", placeholder: "12" },
      { name: "g2", label: "G2 Grade (0-20)", type: "number", placeholder: "11"},
      { name: "g3", label: "G3 Final (0-20)", type: "number", placeholder: "11"    },
    ]
  }
];


function InfoGrid({ data }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 12 }}>
      {data.map(([label, value, warn]) => (
        <div key={label} style={{ background: "var(--bg3)", borderRadius: 4, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, fontFamily: "Space Mono", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
          <div style={{ fontFamily: "Space Mono", fontSize: 14, fontWeight: 700, color: warn ? "var(--warn)" : "var(--text)" }}>{value ?? "—"}</div>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 12, fontFamily: "Space Mono", letterSpacing: "0.05em", color: "var(--text2)", textTransform: "uppercase", marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// Fix 5: Edit modal
function EditStudentModal({ student, onClose, onSaved }) {
  const [form, setForm] = useState({ ...student });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const numeric = ["age","medu","fedu","traveltime","studytime","failures","famrel","freetime","goout","dalc","walc","health","absences","g1","g2","g3"];
      const payload = { ...form };
      numeric.forEach(k => { if (payload[k] !== undefined && payload[k] !== "") payload[k] = parseFloat(payload[k]); });
      await api.patch(`/students/${student.id}`, payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save changes.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12,
        width: "100%", maxWidth: 700, maxHeight: "90vh", overflow: "auto",
        padding: 32,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontFamily: "Space Mono", color: "var(--text)" }}>Edit Student</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ Close</button>
        </div>

        {error && (
          <div style={{
            background: "rgba(224,35,71,0.1)", border: "1px solid rgba(224,35,71,0.3)",
            borderRadius: 4, padding: "10px 14px", marginBottom: 20,
            color: "var(--danger)", fontSize: 13,
          }}>⚠ {error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {FIELD_GROUPS.map(group => (
            <div key={group.title} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontFamily: "Space Mono", color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>
                {group.title}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {group.fields.map(f => (
                  <div key={f.name}>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "Space Mono", color: "var(--text2)", marginBottom: 5, textTransform: "uppercase" }}>
                      {f.label}
                    </label>
                    {f.type === "select" ? (
                      <select name={f.name} value={form[f.name] || ""} onChange={handleChange}>
                        {f.options.map((o, i) => <option key={o} value={o}>{f.full_option ? f.full_option[i]: o}</option>)}
                      </select>
                    ) : (
                      <input
                        name={f.name} type={f.type}
                        value={form[f.name] ?? ""}
                        onChange={handleChange}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save & Re-Predict →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showEdit, setShowEdit] = useState(false); // Fix 5

  const load = async () => {
    const [sRes, iRes] = await Promise.all([
      api.get(`/students/${id}`),
      api.get(`/predictions/interventions/student/${id}`),
    ]);
    setStudent(sRes.data);
    setInterventions(iRes.data);
  };

  useEffect(() => { load().catch(() => {}).finally(() => setLoading(false)); }, [id]);

  const runPredict = async () => {
    setPredicting(true);
    try { await api.post(`/predictions/predict/${id}`); await load(); } catch {}
    setPredicting(false);
  };

  const generateInterventions = async () => {
    setGenerating(true);
    try { const r = await api.post(`/predictions/interventions/generate/${id}`); setInterventions(r.data); }
    catch (e) { alert(e.response?.data?.detail || "Error"); }
    setGenerating(false);
  };

  const updateIntervention = async (iid, status) => {
    await api.patch(`/predictions/interventions/${iid}`, { status });
    setInterventions(iv => iv.map(i => i.id === iid ? { ...i, status } : i));
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ fontFamily: "Space Mono", color: "var(--text2)", animation: "pulse 1.5s infinite" }}>Loading...</div>
    </div>
  );

  if (!student) return (
    <div className="card" style={{ textAlign: "center", padding: 60 }}>
      <div style={{ color: "var(--text2)" }}>Student not found.</div>
      <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate("/students")}>← Back</button>
    </div>
  );

  const pred = student.latest_prediction;
  const riskScore = pred ? Math.round(pred.risk_score * 100) : null;
  const riskColor = pred?.risk_label === "high" ? "var(--danger)" : pred?.risk_label === "medium" ? "var(--warn)" : pred?.risk_label === "low" ? "var(--safe)" : "var(--text2)";
  const shapData = pred?.top_factors?.map(f => ({
    name: f.feature, value: Math.abs(f.shap_value),
    raw: f.shap_value, impact: f.impact, description: f.description,
  })) || [];

  return (
    <div className="fade-in">
      {/* Fix 5: Edit modal */}
      {showEdit && (
        <EditStudentModal
          student={student}
          onClose={() => setShowEdit(false)}
          onSaved={load}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }} onClick={() => navigate("/students")}>← Back</button>
          <h1 style={{ fontSize: 26, letterSpacing: 1, color: "var(--text)" }}>{student.name}</h1>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
            <span style={{ fontFamily: "Space Mono", fontSize: 12, color: "var(--text3)" }}>{student.student_id}</span>
            {pred && <span className={`badge badge-${pred.risk_label}`}>● {pred.risk_label} risk</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {/* Fix 5: edit button */}
          <button className="btn btn-secondary" onClick={() => setShowEdit(true)}>✏ Edit Student</button>
          <button className="btn btn-secondary" disabled={predicting} onClick={runPredict}>
            {predicting ? "Predicting..." : "⟳ Re-Predict"}
          </button>
          <button className="btn btn-primary" disabled={generating || !pred} onClick={generateInterventions}>
            {generating ? "Generating..." : "✦ Generate Interventions"}
          </button>
        </div>
      </div>

      {/* Risk Score Banner */}
      {pred && (
        <div className="card" style={{
          marginBottom: 20, padding: "20px 28px",
          borderLeft: `4px solid ${riskColor}`,
          display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap",
        }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: "Space Mono", color: "var(--text2)", textTransform: "uppercase", marginBottom: 4 }}>Failure Risk Score</div>
            <div style={{ fontSize: 52, fontFamily: "Space Mono", fontWeight: 700, color: riskColor, lineHeight: 1 }}>{riskScore}%</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ height: 8, background: "var(--bg3)", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ width: `${riskScore}%`, height: "100%", background: riskColor, borderRadius: 4, transition: "width 1s ease" }} />
            </div>
            <div style={{ fontSize: 13, color: "var(--text2)" }}>
              {pred.risk_label === "high" ? "⚠ Immediate intervention required."
                : pred.risk_label === "medium" ? "◈ Moderate risk. Monitor closely."
                : "✓ Student is performing within acceptable range."}
            </div>
            <div style={{ fontSize: 11, fontFamily: "Space Mono", color: "var(--text3)", marginTop: 6 }}>
              Model: {pred.model_version} · {new Date(pred.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {!pred && (
        <div className="card" style={{ marginBottom: 20, textAlign: "center", padding: 32, border: "1px dashed var(--border2)" }}>
          <div style={{ color: "var(--text2)", marginBottom: 12 }}>No prediction yet.</div>
          <button className="btn btn-primary" onClick={runPredict} disabled={predicting}>
            {predicting ? "Running..." : "⟳ Run Prediction Now"}
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <Section title="Academic Profile">
            <InfoGrid data={[
              ["Age", student.age], ["Gender", student.gender], ["School", student.school],
              ["Study Time", student.studytime], ["Failures", student.failures, student.failures > 0],
              ["Absences", student.absences, student.absences > 15],
              ["G1", student.g1, student.g1 < 8], ["G2", student.g2, student.g2 < 8],
              ["G3 Final", student.g3, student.g3 < 10],
              ["Higher Edu", student.higher], ["School Support", student.schoolsup],
            ]} />
          </Section>
          <Section title="Family & Background">
            <InfoGrid data={[
              ["Family Size", student.famsize], ["Parent Status", student.pstatus],
              ["Mother Edu", student.medu], ["Father Edu", student.fedu],
              ["Mother Job", student.mjob], ["Father Job", student.fjob],
              ["Guardian", student.guardian], ["Family Rel", student.famrel],
              ["Internet", student.internet],
            ]} />
          </Section>
        </div>
        <div>
          {shapData.length > 0 && (
            <Section title="⚡ XAI — Why This Prediction?">
              <p style={{ fontSize: 12, color: "var(--text2)", marginBottom: 16, lineHeight: 1.7 }}>
                SHAP values show which factors most influenced this prediction.
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={shapData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke="var(--text3)" tick={{ fontSize: 10, fontFamily: "Space Mono" }} />
                  <YAxis type="category" dataKey="name" stroke="var(--text3)" tick={{ fontSize: 11, fontFamily: "Space Mono" }} width={80} />
                  <Tooltip contentStyle={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 4, fontSize: 12 }} />
                  <Bar dataKey="value" radius={2}>
                    {shapData.map((entry, i) => (
                      <Cell key={i} fill={entry.impact === "increases_risk" ? "var(--danger)" : "var(--safe)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {pred?.top_factors?.map((f, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    background: "var(--bg3)", borderRadius: 4, padding: "10px 14px",
                    borderLeft: `3px solid ${f.impact === "increases_risk" ? "var(--danger)" : "var(--safe)"}`,
                  }}>
                    <div style={{ fontFamily: "Space Mono", fontSize: 11, color: f.impact === "increases_risk" ? "var(--danger)" : "var(--safe)", minWidth: 40, fontWeight: 700 }}>
                      {f.impact === "increases_risk" ? "▲" : "▼"} {Math.abs(f.shap_value).toFixed(3)}
                    </div>
                    <div>
                      <div style={{ fontFamily: "Space Mono", fontSize: 11, fontWeight: 700, marginBottom: 2, color: "var(--text)" }}>{f.feature.toUpperCase()}</div>
                      <div style={{ fontSize: 12, color: "var(--text2)" }}>{f.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
          <Section title="Lifestyle Factors">
            <InfoGrid data={[
              ["Freetime", student.freetime], ["Goes Out", student.goout, student.goout >= 4],
              ["Weekday Alcohol", student.dalc, student.dalc >= 3], ["Weekend Alcohol", student.walc, student.walc >= 3],
              ["Health", student.health], ["Romantic", student.romantic], ["Activities", student.activities],
            ]} />
          </Section>
        </div>
      </div>

      {/* Interventions */}
      <Section title={`✦ Intervention Plans (${interventions.length})`}>
        {interventions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text2)" }}>
            <div style={{ marginBottom: 12 }}>No interventions yet.</div>
            <button className="btn btn-primary btn-sm" disabled={!pred || generating} onClick={generateInterventions}>
              {generating ? "Generating..." : "✦ Auto-Generate with AI"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {interventions.map(iv => (
              <div key={iv.id} style={{
                background: "var(--bg3)", borderRadius: 6, padding: "16px 20px",
                borderLeft: `3px solid ${iv.status === "completed" ? "var(--safe)" : iv.status === "in_progress" ? "var(--info)" : "var(--border2)"}`,
                display: "flex", gap: 16, alignItems: "flex-start",
              }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{INTERVENTION_ICONS[iv.intervention_type] || "📌"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontFamily: "Space Mono", fontSize: 11, textTransform: "uppercase", fontWeight: 700, color: "var(--text2)" }}>
                      {iv.intervention_type.replace(/_/g, " ")}
                    </span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {iv.ai_generated && (
                        <span style={{ fontSize: 10, fontFamily: "Space Mono", color: "var(--purple)", background: "rgba(124,58,237,0.1)", padding: "2px 8px", borderRadius: 100 }}>AI</span>
                      )}
                      <span style={{ fontSize: 10, fontFamily: "Space Mono", textTransform: "uppercase", color: iv.status === "completed" ? "var(--safe)" : iv.status === "in_progress" ? "var(--info)" : "var(--text3)" }}>
                        {iv.status}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, marginBottom: 12 }}>{iv.description}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {iv.status === "pending" && <button className="btn btn-sm btn-secondary" onClick={() => updateIntervention(iv.id, "in_progress")}>▶ Start</button>}
                    {iv.status === "in_progress" && <button className="btn btn-sm btn-success" onClick={() => updateIntervention(iv.id, "completed")}>✓ Complete</button>}
                    {iv.status === "completed" && <span style={{ fontSize: 12, color: "var(--safe)" }}>✓ Completed</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
