<<<<<<< HEAD
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { getPlacements, getWeeklyLogs, getGrades } from "../services/api";
import { useNavigate } from "react-router-dom"; // this is a named export, so we use curly braces to import.
import { logOut } from "../services/api";
=======
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logOut, getPlacements, getWeeklyLogs, getGrades } from '../services/services/api';
import './AcademicSupervisorDashboard.css';
>>>>>>> e4d34376dcc4c5451cd161cd622a7a2e2da2d5df

export default function AcademicSupervisorDashboard() {
  const [placements, setPlacements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getUser();

  const navigate = useNavigate();
  const handleLogout = () => {
    logOut(); // Clear token and user info from localStorage
    navigate('/'); // Redirect to login page
  }

  useEffect(() => {
    Promise.all([getPlacements(), getWeeklyLogs(), getGrades()])
      .then(([pData, lData, gData]) => {
        setPlacements(pData.results ?? pData);
        setLogs(lData.results ?? lData);
        setGrades(gData.results ?? gData);
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const ScoreBar = ({ label, value, max = 10 }) => (
    <div className='as-score-row'>
      <span className='as-score-label'>{label}</span>
      <div className='as-bar-bg'>
        <div className='as-bar-fill'
          style={{ width: '${(value / max) * 100}%' }} />
      </div>
      <span className='as-score-val'>{value}/{max}</span>
    </div>
  );

  if (loading) return <div className='as-loading'>Loading...</div>;
  if (error) return <div className='as-error'>{error}</div>;

  return (
<<<<<<< HEAD
    <div>
       <Navbar /> 
      <h2>Academic Supervisor Dashboard</h2>
      <button onClick={handleLogout} style={{ position: 'absolute', top: '10px', right: '10px', padding: '8px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
  Logout
</button>
      {placements.map(p => (
        <div key={p.id}>
          <h3>{p.student_name}</h3>
          <h4>Weekly Logs</h4>
          {logs.filter(l => l.student === p.student).map(log => (
            <div key={log.id}>
              <p>{log.description}</p>
              <p>Status: {log.status}</p>
=======
    <div className='as-root'>
      <aside className='as-sidebar'>
        <div className='as-logo'>ILES</div>
        <button className='as-logout'
          onClick={() => { logOut(); navigate('/'); }}>
          Logout
        </button>
      </aside>
      <main className='as-main'>
        <h1 className='as-title'>Academic Supervisor Dashboard</h1>
        {placements.map(p => {
          const stuLogs = logs.filter(l => l.placement === p.id);
          const stuGrades = grades.filter(g => g.placement === p.id);
          return (
            <div key={p.id} className='as-student-card'>
              <h2 className='as-student-name'>{p.student?.username}</h2>
              <h3 className='as-section-hdr'>Weekly Logs</h3>
              {stuLogs.map(log => (
                <div key={log.id} className='as-log-row'>
                  <span>Week {log.week}</span>
                  <span className={'as-badge as-badge-${log.status.toLowerCase()}'}>
                    {log.status}
                  </span>
                  <span>{log.tasks?.slice(0, 60)}...</span>
                </div>
              ))}
              <h3 className='as-section-hdr'>Evaluation Scores</h3>
              {stuGrades.map(g => (
                <div key={g.id} className='as-scores'>
                  <ScoreBar label='Technical' value={g.technical_skills} />
                  <ScoreBar label='Communication' value={g.communication_skills} />
                  <ScoreBar label='Punctuality' value={g.punctuality} />
                </div>
              ))}
>>>>>>> e4d34376dcc4c5451cd161cd622a7a2e2da2d5df
            </div>
          );
        })}
      </main>
    </div>
  );
}

