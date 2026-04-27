<<<<<<< HEAD
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { getPlacements, updatePlacement } from "../services/api";
import { useNavigate } from "react-router-dom"; // this is a named export, so we use curly braces to import.
import { logOut } from "../services/api";

export default function AdminDashboard() {
  const [placements, setPlacements] = useState([]);
  const navigate = useNavigate();
=======
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logOut, getPlacements, updatePlacement } from '../services/services/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [placements, setPlacements] = useState([]); // we start with an empty array
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getUser();
>>>>>>> e4d34376dcc4c5451cd161cd622a7a2e2da2d5df

  useEffect(() => {
    // we add a catch here because if the backend returns 401 res.data will be empty
    getPlacements()
      
      .then(data => {
        if (res.data) setPlacements(data.results ?? data);
      })
      .catch(err => console.error("failed to fetch placements probably a 401", err))
      .finally(() => setLoading(false));
  }, []);

  const handleActivate = (id) => {
    updatePlacement(id, { status: "Active" })
      .then(() => {
        // we update the local state so the button disappears immediately
        // this avoids needing a page refresh to see the change
        setPlacements(prev => prev.map(p => p.id === id ? { ...p, status: "Active" } : p));
      })
      .catch(err => console.error("failed to update placement", err));
  };

  const handleLogout = () => {
    logOut();
    navigate('/');
  };

  return (
    <div>
      <button onClick={handleLogout} style={{ position: 'absolute', top: '10px', right: '10px', padding: '8px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
  Logout
</button>
      <Navbar />
      <h2>Admin Dashboard</h2>
      <table>
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
          {/* we use p here instead of item so it matches your table rows */}
          {placements?.map((p) => (
            <tr key={p.id}>
              <td>{p.student_name}</td>
              <td>{p.company}</td>
              <td>{p.status}</td>
              <td>{p.academic_supervisor}</td>
              <td>{p.workplace_supervisor}</td>
              <td>
                {p.status !== "Active" && (
                  <button onClick={() => handleActivate(p.id)}>
                    Set Active
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}