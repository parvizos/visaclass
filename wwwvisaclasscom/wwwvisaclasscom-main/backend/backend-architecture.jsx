import { useState } from "react";

const modules = [
  {
    id: "auth",
    icon: "🔐",
    title: "Authentication",
    color: "#e85d4a",
    accent: "#ff8a7a",
    priority: "Critical",
    tech: "JWT + bcrypt",
    items: [
      { label: "Student Register / Login", done: false },
      { label: "Email Verification", done: false },
      { label: "Password Reset Flow", done: false },
      { label: "Admin Secure Login", done: false },
      { label: "Role System (admin / staff)", done: false },
      { label: "Password Hashing (bcrypt)", done: false },
    ],
    description: "Every user must be verified. Passwords hashed with bcrypt. JWT tokens for session management.",
  },
  {
    id: "student",
    icon: "🎓",
    title: "Student Management",
    color: "#4a90d9",
    accent: "#7ab8f5",
    priority: "Critical",
    tech: "MySQL / Express",
    items: [
      { label: "Personal Info Storage", done: false },
      { label: "Academic Info", done: false },
      { label: "Nationality + Passport", done: false },
      { label: "Unique Student ID", done: false },
      { label: "Application History", done: false },
      { label: "Student Dashboard Access", done: false },
    ],
    description: "Each student gets a unique ID, personal profile, and a private dashboard to track all their applications.",
  },
  {
    id: "university",
    icon: "🏛️",
    title: "University Management",
    color: "#7c5cbf",
    accent: "#b08fff",
    priority: "High",
    tech: "MySQL / Admin API",
    items: [
      { label: "University Name + City", done: false },
      { label: "Programs & Tuition Fees", done: false },
      { label: "Application Deadlines", done: false },
      { label: "Required Documents", done: false },
      { label: "Admin: Add / Edit University", done: false },
      { label: "Admin: Close Applications", done: false },
    ],
    description: "Admin controls all university & program data. Students browse and select programs to apply to.",
  },
  {
    id: "application",
    icon: "📋",
    title: "Application Workflow",
    color: "#e8a23a",
    accent: "#ffd080",
    priority: "Critical",
    tech: "Express + MySQL",
    items: [
      { label: "Create Application Record", done: false },
      { label: "Link Student → University → Program", done: false },
      { label: "Status: Draft", done: false },
      { label: "Status: Submitted", done: false },
      { label: "Status: Under Review", done: false },
      { label: "Status: Accepted / Rejected", done: false },
      { label: "Status: Missing Documents", done: false },
    ],
    description: "The heart of the platform. Each application links a student to a program and tracks its lifecycle status.",
  },
  {
    id: "documents",
    icon: "📁",
    title: "Document Upload",
    color: "#3ab87a",
    accent: "#72e8ab",
    priority: "High",
    tech: "Multer + Secure Storage",
    items: [
      { label: "Accept PDF / JPG / PNG", done: false },
      { label: "File Size Limit", done: false },
      { label: "Auto-Rename Files", done: false },
      { label: "Store File Path in DB", done: false },
      { label: "Secure Folder (no public access)", done: false },
      { label: "Passport, Diploma, Transcript", done: false },
      { label: "English Certificate Support", done: false },
    ],
    description: "Files are stored securely server-side. Never publicly accessible. File paths saved in the database per application.",
  },
  {
    id: "admin",
    icon: "⚙️",
    title: "Admin Panel",
    color: "#d4436e",
    accent: "#ff7aa0",
    priority: "Critical",
    tech: "Express + Role Auth",
    items: [
      { label: "View All Applications", done: false },
      { label: "Filter by University", done: false },
      { label: "Filter by Status", done: false },
      { label: "Download Documents", done: false },
      { label: "Change Application Status", done: false },
      { label: "Leave Notes on Application", done: false },
    ],
    description: "Without this, the platform is useless. Admins manage every application and communicate with students.",
  },
  {
    id: "email",
    icon: "✉️",
    title: "Email Notifications",
    color: "#5ba8c4",
    accent: "#96d8f0",
    priority: "Medium",
    tech: "Nodemailer / SMTP",
    items: [
      { label: "Registration Confirmation", done: false },
      { label: "Application Submitted Email", done: false },
      { label: "Application Approved Email", done: false },
      { label: "Missing Document Request", done: false },
    ],
    description: "Automated emails keep students informed at every stage. Use SMTP or a provider like SendGrid.",
  },
  {
    id: "security",
    icon: "🛡️",
    title: "Security",
    color: "#888",
    accent: "#bbb",
    priority: "Critical",
    tech: "HTTPS + Validation",
    items: [
      { label: "HTTPS Everywhere", done: false },
      { label: "Hash All Passwords", done: false },
      { label: "Validate All Inputs", done: false },
      { label: "Protect File Uploads", done: false },
      { label: "Limit Admin Access", done: false },
      { label: "Regular DB Backups", done: false },
    ],
    description: "You're storing passport data and diplomas. A breach = serious legal problems. Security is non-negotiable.",
  },
];

const dbTables = [
  { name: "students", fields: ["id", "name", "email", "password", "nationality", "passport_number"] },
  { name: "universities", fields: ["id", "name", "city", "deadline"] },
  { name: "programs", fields: ["id", "university_id", "program_name", "tuition_fee"] },
  { name: "applications", fields: ["id", "student_id", "program_id", "status", "created_at"] },
  { name: "documents", fields: ["id", "application_id", "document_type", "file_path"] },
  { name: "admins", fields: ["id", "email", "password", "role"] },
];

const flowSteps = [
  { step: "1", label: "Student logs in", icon: "👤" },
  { step: "2", label: "Fills application form", icon: "📝" },
  { step: "3", label: "Uploads documents", icon: "📎" },
  { step: "4", label: "Clicks Submit", icon: "🚀" },
  { step: "5", label: "Backend validates", icon: "✅" },
  { step: "6", label: "Saves to database", icon: "🗄️" },
  { step: "7", label: "Stores files securely", icon: "🔒" },
  { step: "8", label: "Sends confirmation email", icon: "✉️" },
  { step: "9", label: "Appears in admin panel", icon: "⚙️" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("modules");
  const [selectedModule, setSelectedModule] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

  const toggleItem = (moduleId, index) => {
    const key = `${moduleId}-${index}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getProgress = (moduleId, items) => {
    const checked = items.filter((_, i) => checkedItems[`${moduleId}-${i}`]).length;
    return Math.round((checked / items.length) * 100);
  };

  const totalItems = modules.reduce((a, m) => a + m.items.length, 0);
  const totalChecked = Object.values(checkedItems).filter(Boolean).length;
  const overallProgress = Math.round((totalChecked / totalItems) * 100);

  const priorityColor = (p) => p === "Critical" ? "#e85d4a" : p === "High" ? "#e8a23a" : "#3ab87a";

  return (
    <div style={{
      fontFamily: "'Georgia', serif",
      background: "#0f0f14",
      minHeight: "100vh",
      color: "#e8e4dc",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a24 0%, #0f0f14 100%)",
        borderBottom: "1px solid #2a2a38",
        padding: "32px 40px 24px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "#7c5cbf", textTransform: "uppercase", marginBottom: 8, fontFamily: "monospace" }}>
                Backend Architecture
              </div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#f0ece4", lineHeight: 1.2 }}>
                Turkish University<br />Application Platform
              </h1>
              <p style={{ margin: "10px 0 0", color: "#888", fontSize: 13, fontFamily: "monospace" }}>
                Node.js + Express · MySQL · JWT · Multer
              </p>
            </div>
            <div style={{
              background: "#1a1a24",
              border: "1px solid #2a2a38",
              borderRadius: 12,
              padding: "16px 24px",
              textAlign: "center",
              minWidth: 140,
            }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: overallProgress > 0 ? "#7c5cbf" : "#444" }}>
                {overallProgress}%
              </div>
              <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace", letterSpacing: 1 }}>OVERALL PROGRESS</div>
              <div style={{ marginTop: 8, background: "#2a2a38", borderRadius: 4, height: 4, overflow: "hidden" }}>
                <div style={{ width: `${overallProgress}%`, background: "#7c5cbf", height: "100%", transition: "width 0.3s" }} />
              </div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 6, fontFamily: "monospace" }}>
                {totalChecked} / {totalItems} tasks
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginTop: 28, borderBottom: "1px solid #2a2a38" }}>
            {[
              { id: "modules", label: "Modules" },
              { id: "database", label: "Database" },
              { id: "flow", label: "App Flow" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                background: activeTab === tab.id ? "#7c5cbf" : "transparent",
                color: activeTab === tab.id ? "#fff" : "#666",
                border: "none",
                borderRadius: "6px 6px 0 0",
                padding: "8px 20px",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "monospace",
                letterSpacing: 0.5,
                transition: "all 0.2s",
              }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px" }}>

        {/* MODULES TAB */}
        {activeTab === "modules" && (
          <div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}>
              {modules.map((mod) => {
                const progress = getProgress(mod.id, mod.items);
                const isSelected = selectedModule === mod.id;
                return (
                  <div
                    key={mod.id}
                    onClick={() => setSelectedModule(isSelected ? null : mod.id)}
                    style={{
                      background: isSelected ? "#1a1a24" : "#16161e",
                      border: `1px solid ${isSelected ? mod.color : "#2a2a38"}`,
                      borderRadius: 12,
                      padding: "20px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: isSelected ? `0 0 20px ${mod.color}22` : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{mod.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 15, color: "#f0ece4" }}>{mod.title}</div>
                          <div style={{ fontSize: 10, fontFamily: "monospace", color: mod.color, marginTop: 2 }}>{mod.tech}</div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: 10,
                        fontFamily: "monospace",
                        background: `${priorityColor(mod.priority)}22`,
                        color: priorityColor(mod.priority),
                        border: `1px solid ${priorityColor(mod.priority)}44`,
                        borderRadius: 4,
                        padding: "3px 8px",
                      }}>
                        {mod.priority}
                      </span>
                    </div>

                    <p style={{ fontSize: 12, color: "#666", margin: "0 0 14px", lineHeight: 1.5 }}>{mod.description}</p>

                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: "#555", fontFamily: "monospace" }}>PROGRESS</span>
                        <span style={{ fontSize: 10, color: mod.color, fontFamily: "monospace" }}>{progress}%</span>
                      </div>
                      <div style={{ background: "#2a2a38", borderRadius: 4, height: 3 }}>
                        <div style={{ width: `${progress}%`, background: mod.color, height: "100%", borderRadius: 4, transition: "width 0.3s" }} />
                      </div>
                    </div>

                    {isSelected && (
                      <div style={{ marginTop: 16, borderTop: "1px solid #2a2a38", paddingTop: 14 }}>
                        {mod.items.map((item, i) => {
                          const key = `${mod.id}-${i}`;
                          const checked = !!checkedItems[key];
                          return (
                            <div
                              key={i}
                              onClick={(e) => { e.stopPropagation(); toggleItem(mod.id, i); }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "7px 0",
                                cursor: "pointer",
                                borderBottom: i < mod.items.length - 1 ? "1px solid #1e1e2a" : "none",
                              }}
                            >
                              <div style={{
                                width: 16, height: 16, borderRadius: 4,
                                border: `1.5px solid ${checked ? mod.color : "#3a3a4a"}`,
                                background: checked ? mod.color : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0, transition: "all 0.15s",
                              }}>
                                {checked && <span style={{ color: "#fff", fontSize: 10, lineHeight: 1 }}>✓</span>}
                              </div>
                              <span style={{
                                fontSize: 12,
                                color: checked ? "#555" : "#ccc",
                                textDecoration: checked ? "line-through" : "none",
                                transition: "all 0.15s",
                              }}>
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {!isSelected && (
                      <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace", marginTop: 4 }}>
                        Click to expand checklist →
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DATABASE TAB */}
        {activeTab === "database" && (
          <div>
            <p style={{ color: "#666", fontFamily: "monospace", fontSize: 12, marginBottom: 24 }}>
              Core database tables and their fields. Use MySQL with foreign key constraints.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {dbTables.map((table, i) => {
                const colors = ["#e85d4a","#4a90d9","#7c5cbf","#e8a23a","#3ab87a","#d4436e"];
                const col = colors[i % colors.length];
                return (
                  <div key={table.name} style={{
                    background: "#16161e",
                    border: `1px solid #2a2a38`,
                    borderTop: `3px solid ${col}`,
                    borderRadius: 10,
                    overflow: "hidden",
                  }}>
                    <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid #2a2a38" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 14, color: col, fontWeight: 700 }}>
                        {table.name}
                      </span>
                    </div>
                    <div style={{ padding: "10px 18px 14px" }}>
                      {table.fields.map((field, fi) => (
                        <div key={field} style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "5px 0",
                          borderBottom: fi < table.fields.length - 1 ? "1px solid #1e1e28" : "none",
                        }}>
                          <span style={{ color: fi === 0 ? "#e8a23a" : "#555", fontSize: 10, fontFamily: "monospace", width: 12 }}>
                            {fi === 0 ? "🔑" : "·"}
                          </span>
                          <span style={{ fontFamily: "monospace", fontSize: 12, color: fi === 0 ? "#e8a23a" : "#aaa" }}>
                            {field}
                          </span>
                          {field.endsWith("_id") && fi > 0 && (
                            <span style={{ fontSize: 9, color: "#4a90d9", fontFamily: "monospace", marginLeft: "auto" }}>FK</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{
              marginTop: 24, background: "#16161e", border: "1px solid #2a2a38",
              borderRadius: 10, padding: "16px 20px",
            }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "#7c5cbf", marginBottom: 8, letterSpacing: 2 }}>RELATIONSHIPS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {[
                  "students → applications (one-to-many)",
                  "universities → programs (one-to-many)",
                  "programs → applications (one-to-many)",
                  "applications → documents (one-to-many)",
                ].map(rel => (
                  <span key={rel} style={{
                    fontFamily: "monospace", fontSize: 11, color: "#888",
                    background: "#1e1e28", border: "1px solid #2a2a38",
                    borderRadius: 6, padding: "5px 12px",
                  }}>{rel}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FLOW TAB */}
        {activeTab === "flow" && (
          <div>
            <p style={{ color: "#666", fontFamily: "monospace", fontSize: 12, marginBottom: 28 }}>
              What happens when a student submits an application — end to end.
            </p>
            <div style={{ position: "relative" }}>
              {flowSteps.map((step, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 8,
                }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "#7c5cbf22",
                      border: "1.5px solid #7c5cbf",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, flexShrink: 0,
                    }}>
                      {step.icon}
                    </div>
                    {i < flowSteps.length - 1 && (
                      <div style={{ width: 1, height: 28, background: "#2a2a38", margin: "4px 0" }} />
                    )}
                  </div>
                  <div style={{
                    background: "#16161e",
                    border: "1px solid #2a2a38",
                    borderRadius: 10,
                    padding: "10px 18px",
                    flex: 1,
                    marginBottom: i < flowSteps.length - 1 ? 0 : 0,
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <span style={{ fontFamily: "monospace", fontSize: 10, color: "#7c5cbf", width: 20 }}>
                      {step.step}
                    </span>
                    <span style={{ fontSize: 14, color: "#d0ccc4" }}>{step.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 24, background: "#1a1218",
              border: "1px solid #e85d4a44",
              borderRadius: 10, padding: "16px 20px",
            }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "#e85d4a", marginBottom: 8, letterSpacing: 2 }}>
                ⚠ SECURITY REMINDER
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "#888", lineHeight: 1.6 }}>
                You store passport numbers, diplomas, and personal data. Always use HTTPS, validate every input, hash all passwords, and never trust frontend-only confirmations (especially for payments). A data breach carries serious legal liability.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
