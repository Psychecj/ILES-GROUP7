import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logOut, getWeeklyLogs, getPlacements } from '../services/api';
import './StudentDashboard.css';

function StudentDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [logs, setLogs] = useState([]);
  const [placement, setPlacement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    async function loadData() {
      try {
        const [logsData, placementsData] = await Promise.all([
          getWeeklyLogs(), getPlacements(),
        ]);
        setLogs(logsData);
        setPlacement(placementsData[0] || null);
      } catch (err) {
        setError("Failed to load data. Please try again.");
      } finally { setLoading(false); }
    }
    loadData();
  }, []);

  const handleLogout = () => { logOut(); navigate("/"); };

  if (loading) return <p className="loading-msg">Loading...</p>;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {user.email}</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
      {placement ? (
        <div className="placement-card">
          <h3>My Placement</h3>
          <p><b>Company:</b> {placement.company_name}</p>
          <p><b>Status:</b> {placement.status}</p>
          <p><b>Start:</b> {placement.start_date}</p>
          <p><b>End:</b> {placement.end_date}</p>
        </div>
      ) : <p>No placement assigned yet.</p>}
      <h3>My Weekly Logs ({logs.length})</h3>
      {logs.length === 0
        ? <p>No logs yet. Submit your first log!</p>
        : <table className="logs-table">
            <thead>
              <tr><th>Week</th><th>Tasks</th><th>Hours</th><th>Status</th></tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>{log.week}</td>
                  <td>{log.tasks
                    ? log.tasks.slice(0,60)+"..." : "No description"}</td>
                  <td>{log.hours}</td>
                  <td><span className={'status-badge ${log.status.toLowerCase()}'}>
                    {log.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
      }
    </div>
  );
}
export default StudentDashboard;