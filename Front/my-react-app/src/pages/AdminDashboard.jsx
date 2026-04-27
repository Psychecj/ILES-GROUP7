import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { getPlacements, updatePlacement } from "../services/api";
import { useNavigate } from "react-router-dom"; // this is a named export, so we use curly braces to import.
import { logOut } from "../services/api";

export default function AdminDashboard() {
  const [placements, setPlacements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getPlacements().then(res => setPlacements(res.data));
  }, []);

  const handleActivate = (id) => {
    updatePlacement(id, { status: "Active" });
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
          {placements.map(p => (
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
