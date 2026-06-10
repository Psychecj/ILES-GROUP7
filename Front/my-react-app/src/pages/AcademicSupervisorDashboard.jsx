import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUser, logOut, getPlacements, getWeeklyLogs,
  getGrades, getEvaluations, createGrade, publishGrade
} from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './AcademicSupervisorDashboard.css';

export default function AcademicSupervisorDashboard() {
  const [placements, setPlacements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [grades, setGrades] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // FIX: unified form field name — was split between 'score' and 'academic_score'
  const [gradeForm, setGradeForm] = useState({ academic_score: '', remarks: '' });
  const [gradeMsg, setGradeMsg] = useState('');
  const [activePlacementId, setActivePlacementId] = useState(null);
  const [activeTab, setActiveTab] = useState('students');
  const [publishMsg, setPublishMsg] = useState('');

  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pData, lData, gData, eData] = await Promise.all([
        getPlacements(), getWeeklyLogs(), getGrades(), getEvaluations()
      ]);
      setPlacements(Array.isArray(pData) ? pData : pData.results ?? []);
      setLogs(Array.isArray(lData) ? lData : lData.results ?? []);
      setGrades(Array.isArray(gData) ? gData : gData.results ?? []);
      setEvaluations(Array.isArray(eData) ? eData : eData.results ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logOut();
    navigate('/');
  };

  const handleGradeChange = (e) => {
    setGradeForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openGradeForm = (placementId) => {
    setActivePlacementId(placementId);
    setGradeForm({ academic_score: '', remarks: '' });
    setGradeMsg('');
  };

  const handleGradeSubmit = async (placementId) => {
    try {
      await createGrade({
        placement: placementId,
        // FIX: was gradeForm.score — now correctly gradeForm.academic_score
        academic_score: Number(gradeForm.academic_score),
        remarks: gradeForm.remarks,
      });
      setGradeMsg('Grade submitted successfully!');
      setActivePlacementId(null);
      setGradeForm({ academic_score: '', remarks: '' });
      const fresh = await getGrades();
      setGrades(Array.isArray(fresh) ? fresh : fresh.results ?? []);
      setTimeout(() => setGradeMsg(''), 3000);
    } catch (err) {
      setGradeMsg('Error: ' + (err.message || 'Submission failed'));
    }
  };

  const getChartData = () => {
    if (!evaluations.length) return [];
    const avg = (key) =>
      evaluations.reduce((sum, e) => sum + (e[key] || 0), 0) / evaluations.length;
    return [{
      name: 'Average',
      Technical: +avg('technical_skills').toFixed(1),
      Communication: +avg('communication_skills').toFixed(1),
      Punctuality: +avg('punctuality').toFixed(1),
    }];
  };

  if (loading) return <div className="as-loading">Loading...</div>;
  if (error) return <div className="as-error">{error}</div>;

  return (
    <div className="as-root">
      {/* ── Sidebar ── */}
      <aside className="as-sidebar">
        <div className="as-logo">ILES</div>
        <nav className="as-nav">
          {[
            { id: 'students', label: 'Students & Logs' },
            { id: 'grades',   label: 'Assign Grades'  },
            { id: 'charts',   label: 'Overview Chart' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`as-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <button className="as-logout" onClick={handleLogout}>Logout</button>
      </aside>

      {/* ── Main ── */}
      <main className="as-main">
        <h1 className="as-title">
          Welcome, {user?.username || user?.email?.split('@')[0] || 'Academic Supervisor'}
        </h1>

        {gradeMsg   && <div className="as-success">{gradeMsg}</div>}
        {publishMsg && <div className="as-success">{publishMsg}</div>}

        {/* ── Students & Logs tab ── */}
        {activeTab === 'students' && (
          <>
            {placements.length === 0 ? (
              <div className="as-empty">
                No students are currently assigned to you. Once the internship admin assigns students, they will appear here.
              </div>
            ) : (
              placements.map(p => {
                // FIX: was 'placementLogs' (undefined) — corrected to stuLogs
                const stuLogs = logs.filter(l => l.placement === p.id);
                return (
                  <div key={p.id} className="as-student-card">
                    <h2 className="as-student-name">
                      {p.student?.username || 'Student'} — {p.company_name}
                    </h2>
                    <h3 className="as-section-hdr">Weekly Logs</h3>
                    {stuLogs.length === 0 ? (
                      <p className="as-muted">No weekly logs submitted for this placement yet.</p>
                    ) : (
                      stuLogs.map(log => (
                        <div key={log.id} className="as-log-row">
                          <span className="as-log-week">Week {log.week}</span>
                          <span className={`as-badge as-badge-${String(log.status || 'draft').toLowerCase()}`}>
                            {log.status || 'Draft'}
                          </span>
                          <span className="as-log-desc">
                            {log.description?.slice(0, 70)}{log.description?.length > 70 ? '...' : ''}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ── Assign Grades tab ── */}
        {activeTab === 'grades' && (
          <>
            {placements.length === 0 ? (
              <div className="as-empty">No placements assigned yet.</div>
            ) : (
              placements.map(p => {
                const stuGrades = grades.filter(g => g.placement === p.id);
                const hasGrade = stuGrades.length > 0;
                return (
                  <div key={p.id} className="as-student-card">
                    <h2 className="as-student-name">
                      {p.student?.username || 'Student'} — {p.company_name}
                    </h2>

                    {hasGrade ? (
                      stuGrades.map(g => (
                        <div key={g.id} className="as-scores-summary">
                          <p><strong>Final Score:</strong> {g.score}/100 ({g.grade_letter})</p>
                          <p><strong>Academic Score:</strong> {g.academic_score}</p>
                          <p><strong>Published:</strong> {g.published ? 'Yes' : 'No'}</p>
                          {g.remarks && <p><strong>Remarks:</strong> {g.remarks}</p>}
                          {!g.published && (
                            <button
                              className="as-grade-btn"
                              onClick={async () => {
                                try {
                                  await publishGrade(g.id);
                                  setPublishMsg(`Grade for ${p.student?.username} published!`);
                                  const fresh = await getGrades();
                                  setGrades(Array.isArray(fresh) ? fresh : fresh.results ?? []);
                                  setTimeout(() => setPublishMsg(''), 3000);
                                } catch (err) {
                                  setPublishMsg('Publish failed: ' + err.message);
                                }
                              }}
                            >
                              Publish Grade to Student
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="as-grade-section">
                        <button className="as-open-grade" onClick={() => openGradeForm(p.id)}>
                          + Assign Final Grade
                        </button>
                        {activePlacementId === p.id && (
                          <div className="as-grade-form">
                            <input
                              type="number"
                              name="academic_score"
                              placeholder="Academic score (0–100)"
                              value={gradeForm.academic_score}
                              onChange={handleGradeChange}
                              min="0"
                              max="100"
                              title="Enter the academic supervisor score between 0 and 100."
                            />
                            <textarea
                              name="remarks"
                              placeholder="Overall remarks"
                              value={gradeForm.remarks}
                              onChange={handleGradeChange}
                              title="Add a short comment explaining the student's performance."
                              rows={2}
                            />
                            <div className="as-grade-actions">
                              <button onClick={() => handleGradeSubmit(p.id)}>Submit Grade</button>
                              <button onClick={() => setActivePlacementId(null)}>Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ── Overview Chart tab ── */}
        {activeTab === 'charts' && (
          <div className="as-chart-box">
            <h3>Evaluation Scores Overview (Average across all students)</h3>
            {getChartData().length === 0 ? (
              <p className="as-muted">No evaluation data available yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getChartData()} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DEE2E6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Technical"     fill="#1A73E8" radius={[4,4,0,0]} />
                  <Bar dataKey="Communication" fill="#2E7D32" radius={[4,4,0,0]} />
                  <Bar dataKey="Punctuality"   fill="#E65100" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
