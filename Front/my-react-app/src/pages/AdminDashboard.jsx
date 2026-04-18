import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logOut, getPlacements, updatePlacement } from '../services/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    getPlacements()
      .then(data => setPlacements(data.results ?? data))
      .finally(() => setLoading(false));
  }, []);

  const handleActivate = async (id) => {
    await updatePlacement(id, { status: 'Active' });
    setPlacements(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'Active' } : p
    ));
  };

  const handleLogout = () => { logOut(); navigate('/'); };

  if (loading) return <div className='ad-loading'>Loading...</div>;

  return (
    <div className='ad-root'>
      <div className='ad-header'>
        <h1 className='ad-title'>Admin Dashboard</h1>
        <button className='ad-logout' onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className='ad-table-wrap'>
        <table className='ad-table'>
          <thead>
            <tr>
              <th>Student</th>
              <th>Company</th>
              <th>Status</th>
              <th>Academic Supervisor</th>
              <th>Workplace Supervisor</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {placements.map((p, i) => (
              <tr key={p.id} className={i % 2 === 0 ? 'ad-row-alt' : ''}>
                <td>{p.student?.username}</td>
                <td>{p.company_name}</td>
                <td>
                  <span className={'ad-badge ad-badge-${p.status.toLowerCase()}'}>
                    {p.status}
                  </span>
                </td>
                <td>{p.academic_supervisor?.username ?? '—'}</td>
                <td>{p.workplace_supervisor?.username ?? '—'}</td>
                <td>
                  {p.status !== 'Active' && (
                    <button className='ad-activate-btn'
                      onClick={() => handleActivate(p.id)}>
                      Set Active
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
