import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const TABS = ["Manual Entry", "Upload CSV"];

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

export default function AddStudent() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [csvResult, setCsvResult] = useState(null);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const payload = { ...form };
      ["age","medu","fedu","traveltime","studytime","failures","famrel","freetime","goout","dalc","walc","health","absences","g1","g2","g3"].forEach(k => {
        if (payload[k] !== undefined && payload[k] !== "") payload[k] = parseFloat(payload[k]);
      });
      const res = await api.post("/students/", payload);
      navigate(`/students/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add student.");
    }
    setLoading(false);
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    setLoading(true); setError(""); setCsvResult(null);
    try {
      const fd = new FormData();
      fd.append("file", csvFile);
      const res = await api.post("/students/upload-csv", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setCsvResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "CSV upload failed.");
    }
    setLoading(false);
  };

  return (
    <div className="fade-in" style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }} onClick={() => navigate("/students")}>
          ← Back
        </button>
        <h1 style={{ fontSize: 24, letterSpacing: 1 }}>Add Student</h1>
        <p style={{ color: "var(--text2)", marginTop: 4 }}></p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 28 }}>
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            style={{
              padding: "10px 20px", background: "none", border: "none",
              fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.05em",
              color: tab === i ? "var(--accent)" : "var(--text2)",
              borderBottom: tab === i ? "2px solid var(--accent)" : "2px solid transparent",
              cursor: "pointer", marginBottom: -1, transition: "all 0.15s",
            }}
          >{t}</button>
        ))}
      </div>

      {error && (
        <div style={{
          background: "rgba(255,60,95,0.1)", border: "1px solid rgba(255,60,95,0.3)",
          borderRadius: 4, padding: "10px 14px", marginBottom: 20, color: "var(--danger)", fontSize: 13,
        }}>⚠ {error}</div>
      )}

      {/* Manual Entry */}

      {tab === 0 && (
        <form onSubmit={handleManualSubmit}>
          {FIELD_GROUPS.map(group => (
            <div key={group.title} className="card" style={{ marginBottom: 20 }}>
              <h3 style={{
                fontSize: 11, fontFamily: "var(--mono)", textTransform: "uppercase",
                letterSpacing: "0.08em", color: "var(--text2)", marginBottom: 18,
                borderBottom: "1px solid var(--border)", paddingBottom: 12,
              }}>{group.title}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                {group.fields.map(f => (
                  <div key={f.name}>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "var(--mono)", color: "var(--text2)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {f.label}{f.required && " *"}
                    </label>
                    {f.type === "select" ? (
                      <select
                        value={form[f.name] || ""}
                        onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                      >
                        <option value="">Select...</option>
                        {f.options.map((o, i) => <option key={o} value={o}>{f.full_option ? f.full_option[i]: o}</option>)}
                        

                      </select>
                    ) : (
                      <input
                        type={f.type || "text"}
                        required={f.required}
                        placeholder={f.placeholder}
                        value={form[f.name] || ""}
                        onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate("/students")}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Adding..." : "Add Student & Predict →"}
            </button>
          </div>
        </form>
      )}

      {/* CSV Upload */}
      {tab === 1 && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 13, fontFamily: "var(--mono)", marginBottom: 16 }}>Upload CSV File</h3>
            

            <div
              style={{
                border: "2px dashed var(--border2)", borderRadius: 8,
                padding: 40, textAlign: "center", cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--accent)"; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; }}
              onDrop={e => {
                e.preventDefault();
                e.currentTarget.style.borderColor = "var(--border2)";
                const f = e.dataTransfer.files[0];
                if (f) setCsvFile(f);
              }}
              onClick={() => document.getElementById("csv-input").click()}
            >
              <input
                id="csv-input" type="file" accept=".csv" style={{ display: "none" }}
                onChange={e => setCsvFile(e.target.files[0])}
              />
              <div style={{ fontSize: 32, marginBottom: 12 }}>⊕</div>
              {csvFile ? (
                <div>
                  <div style={{ fontFamily: "var(--mono)", color: "var(--accent)", fontSize: 14 }}>{csvFile.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>{(csvFile.size / 1024).toFixed(1)} KB</div>
                </div>
              ) : (
                <div>
                  <div style={{ color: "var(--text2)", marginBottom: 4 }}>Drop CSV here or click to browse</div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn btn-primary"
                disabled={!csvFile || loading}
                onClick={handleCsvUpload}
              >
                {loading ? "Uploading & Predicting..." : "Upload & Auto-Predict All →"}
              </button>
            </div>
          </div>

          {csvResult && (
            <div className="card" style={{ borderLeft: "3px solid var(--safe)" }}>
              <h3 style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--safe)", marginBottom: 12 }}>
                ✓ Upload Complete
              </h3>
              <p style={{ color: "var(--text2)", marginBottom: 8 }}>
                <strong style={{ color: "var(--text)" }}>{csvResult.added}</strong> students added and predicted.
              </p>
              {csvResult.errors?.length > 0 && (
                <details>
                  <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--warn)" }}>
                    {csvResult.errors.length} errors
                  </summary>
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--text2)", fontFamily: "var(--mono)" }}>
                    {csvResult.errors.map((e, i) => <div key={i}>{e}</div>)}
                  </div>
                </details>
              )}
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/students")}>
                View All Students →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
