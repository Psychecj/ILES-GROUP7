import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logOut, getPlacements, updatePlacement, createPlacement, publishGrade, getUsers } from "../services/api";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./AdminDashboard.css";

const emptyPlacement = {
  student_id: "",
  company_name: "",
  start_date: "",
  end_date: "",
  workplace_supervisor_id: "",
  academic_supervisor_id: "",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const displayName = user?.username || user?.email?.split("@")[0] || "Admin";

  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [students, setStudents] = useState([]);
  const [wps, setWps] = useState([]);
  const [academics, setAcademics] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formMsg, setFormMsg] = useState("");
  const [newPlacement, setNewPlacement] = useState(emptyPlacement);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [placementData, studentData, wpData, academicData] = await Promise.all([
        getPlacements(),
        getUsers("STUDENT"),
        getUsers("WORKPLACE_SUPERVISOR"),
        getUsers("ACADEMIC_SUPERVISOR"),
      ]);
      setPlacements(Array.isArray(placementData) ? placementData : placementData.results ?? []);
      setStudents(Array.isArray(studentData) ? studentData : studentData.results ?? []);
      setWps(Array.isArray(wpData) ? wpData : wpData.results ?? []);
      setAcademics(Array.isArray(academicData) ? academicData : academicData.results ?? []);
    } catch (err) {
      setError(err.message || "Could not load admin dashboard data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const countStatus = (status) => placements.filter((p) => String(p.status).toLowerCase() === status).length;
  const stats = {
    pending: countStatus("pending"),
    active: countStatus("active"),
    completed: countStatus("completed"),
    rejected: countStatus("rejected"),
  };

  const handlePublish = async (gradeId) => {
    try {
      await publishGrade(gradeId);
      setFormMsg("Grade published successfully!");
      fetchDashboardData();
    } catch (err) {
      setFormMsg("Error: " + (err.message || "Could not publish grade"));
    }
  };

  const handleActivate = async (id) => {
    try {
      await updatePlacement(id, { status: "Active" });
      setPlacements((prev) => prev.map((p) => (p.id === id ? { ...p, status: "Active" } : p)));
      setFormMsg("Placement set to Active.");
    } catch (err) {
      setFormMsg("Error: " + (err.message || "Failed to update placement"));
    }
  };

  const handleLogout = () => {
    logOut();
    navigate("/");
  };

  const handleFormChange = (e) => {
    setNewPlacement((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreatePlacement = async () => {
    setFormMsg("");
    if (!newPlacement.student_id || !newPlacement.company_name.trim()) {
      setFormMsg("Error: Select a student and enter the company name.");
      return;
    }
    try {
      const payload = {
        ...newPlacement,
        company_name: newPlacement.company_name.trim(),
        workplace_supervisor_id: newPlacement.workplace_supervisor_id || null,
        academic_supervisor_id: newPlacement.academic_supervisor_id || null,
      };
      const created = await createPlacement(payload);
      setPlacements((prev) => [created, ...prev]);
      setFormMsg("Placement created successfully!");
      setShowForm(false);
      setNewPlacement(emptyPlacement);
      setTimeout(() => setFormMsg(""), 3000);
    } catch (err) {
      setFormMsg("Error: " + (err.message || "Creation failed"));
    }
  };

  const COLORS = ["#FBBF24", "#60A5FA", "#34D399", "#F87171"];

  const StatsPanel = () => {
    const pieData = [
      { name: "Pending", value: stats.pending },
      { name: "Active", value: stats.active },
      { name: "Completed", value: stats.completed },
      { name: "Rejected", value: stats.rejected },
    ].filter((d) => d.value > 0);

    return (
      <div className="admin-stats-panel">
        <h3>Placement Status Overview</h3>
        <div className="admin-kpi-row">
          <div className="admin-kpi-card"><span className="admin-kpi-val">{placements.length}</span><span className="admin-kpi-label">Placements</span></div>
          <div className="admin-kpi-card"><span className="admin-kpi-val">{students.length}</span><span className="admin-kpi-label">Students</span></div>
          <div className="admin-kpi-card"><span className="admin-kpi-val">{wps.length}</span><span className="admin-kpi-label">Workplace Supervisors</span></div>
          <div className="admin-kpi-card"><span className="admin-kpi-val">{academics.length}</span><span className="admin-kpi-label">Academic Supervisors</span></div>
        </div>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="admin-empty">No placement records yet. Create the first placement using the + New Placement button.</p>
        )}
      </div>
    );
  };

  if (loading) return <div className="admin-loading">Loading admin dashboard...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="ad-root">
      <div className="ad-header">
        <div>
          <h1 className="ad-title">Welcome back, {displayName} 👋</h1>
          <p className="ad-subtitle">Internship Administrator Dashboard</p>
        </div>
        <button className="ad-logout" onClick={handleLogout}>Logout</button>
      </div>

      {formMsg && <div className={formMsg.startsWith("Error") ? "admin-error" : "admin-msg"}>{formMsg}</div>}

      <button className="admin-add-btn" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "+ New Placement"}</button>

      {showForm && (
        <div className="admin-form-card">
          <h3>Create Placement</h3>
          <div className="admin-field">
            <label>Student</label>
            <select name="student_id" value={newPlacement.student_id} onChange={handleFormChange} title="Select the student who will be attached to this internship placement.">
              <option value="">Select student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.username} ({s.email})</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label>Company Name</label>
            <input name="company_name" value={newPlacement.company_name} onChange={handleFormChange} title="Enter the company or organization where the student is placed." />
          </div>
          <div className="admin-field">
            <label>Start Date</label>
            <input type="date" name="start_date" value={newPlacement.start_date} onChange={handleFormChange} title="Choose the first day of the internship." />
          </div>
          <div className="admin-field">
            <label>End Date</label>
            <input type="date" name="end_date" value={newPlacement.end_date} onChange={handleFormChange} title="Choose the last day of the internship. It must be after the start date." />
          </div>
          <div className="admin-field">
            <label>Workplace Supervisor</label>
            <select name="workplace_supervisor_id" value={newPlacement.workplace_supervisor_id} onChange={handleFormChange} title="Select the workplace supervisor assigned to this student.">
              <option value="">Not assigned yet</option>
              {wps.map((s) => <option key={s.id} value={s.id}>{s.username} ({s.email})</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label>Academic Supervisor</label>
            <select name="academic_supervisor_id" value={newPlacement.academic_supervisor_id} onChange={handleFormChange} title="Select the academic supervisor assigned to this student.">
              <option value="">Not assigned yet</option>
              {academics.map((s) => <option key={s.id} value={s.id}>{s.username} ({s.email})</option>)}
            </select>
          </div>
          <button className="admin-submit-btn" onClick={handleCreatePlacement}>Create</button>
        </div>
      )}

      <StatsPanel />

      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr><th>Student</th><th>Company</th><th>Status</th><th>Academic Supervisor</th><th>Workplace Supervisor</th><th>Action</th><th>Grade</th></tr>
          </thead>
          <tbody>
            {placements.length === 0 ? (
              <tr><td colSpan="7" className="admin-empty">No placements found.</td></tr>
            ) : placements.map((p, i) => (
              <tr key={p.id} className={i % 2 === 0 ? "ad-row-alt" : ""}>
                <td>{p.student?.username || "—"}</td>
                <td>{p.company_name}</td>
                <td><span className={`ad-badge ad-badge-${String(p.status).toLowerCase()}`}>{p.status}</span></td>
                <td>{p.academic_supervisor?.username || "—"}</td>
                <td>{p.workplace_supervisor?.username || "—"}</td>
                <td>{p.status === "Pending" ? <button className="ad-activate-btn" onClick={() => handleActivate(p.id)}>Set Active</button> : "—"}</td>
                <td>{p.final_grade && !p.final_grade.published ? <button className="ad-activate-btn" onClick={() => handlePublish(p.final_grade.id)}>Publish Grade</button> : p.final_grade?.published ? "Published" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
