import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logOut, getPlacements, getWeeklyLogs, updateWeeklyLog } from '../services/api';
import './WorkplaceSupervisorDashboard.css';

export default function WorkplaceSupervisorDashboard() {
  const [placements, setPlacements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    Promise.all([getPlacements(), getWeeklyLogs()])
      .then(([pData, lData]) => {
        setPlacements(pData.results ?? pData);
        setLogs(lData.results ?? lData);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (logId) => {
    await updateWeeklyLog(logId, { status: 'Approved' });
    setLogs(prev => prev.map(l =>
      l.id === logId ? { ...l, status: 'Approved' } : l
    ));
  };

  const handleReject = async (logId) => {
    await updateWeeklyLog(logId, { status: 'Rejected' });
    setLogs(prev => prev.map(l =>
      l.id === logId ? { ...l, status: 'Rejected' } : l
    ));
  };

  const handleLogout = () => { logOut(); navigate('/'); };

  if (loading) return <div className='ws-loading'>Loading...</div>;

  return (
    <div className='ws-root'>
      <aside className='ws-sidebar'>
        <div className='ws-logo'>ILES</div>
        <button className='ws-logout' onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <main className='ws-main'>
        <h1 className='ws-title'>Workplace Supervisor Dashboard</h1>
        {placements.map(p => (
          <div key={p.id} className='ws-intern-card'>
            <h2 className='ws-intern-name'>
              {p.student?.username} — {p.company_name}
            </h2>
            {logs.filter(l => l.placement === p.id).map(log => (
              <div key={log.id} className='ws-log-card'>
                <p className='ws-log-tasks'>{log.tasks}</p>
                <p className='ws-log-status'>
                  Status: <span className={'ws-badge ws-badge-${log.status.toLowerCase()}'}>
                    {log.status}
                  </span>
                </p>
                {log.status === 'Submitted' && (
                  <div className='ws-actions'>
                    <button className='ws-btn-approve'
                      onClick={() => handleApprove(log.id)}>
                      Approve
                    </button>
                    <button className='ws-btn-reject'
                      onClick={() => handleReject(log.id)}>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}
