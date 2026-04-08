// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import './Register.css';

function Register() {
  const [form, setForm] = useState({
    username: "", email: "", password: "",
    confirmPassword: "", role: "STUDENT"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    setLoading(true); setError(""); setSuccess("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); setLoading(false); return;
    }
    try {
      const data = await registerUser({
        username: form.username, email: form.email,
        password: form.password, confirmPassword: form.confirmPassword,
        role: form.role,
      });
      if (!data.success) {
        setError(data.errors?.email?.[0] ||
          data.errors?.username?.[0] || "Registration failed");
        return;
      }
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join the ILES System</p>
        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}
        <input name="username" placeholder="Username"
          className="auth-input" onChange={handleChange} />
        <input name="email" type="email" placeholder="Email"
          className="auth-input" onChange={handleChange} />
        <input name="password" type="password"
          placeholder="Password (min 8 chars)"
          className="auth-input" onChange={handleChange} />
        <input name="confirmPassword" type="password"
          placeholder="Confirm Password"
          className="auth-input" onChange={handleChange} />
        <select name="role" value={form.role}
          className="auth-input" onChange={handleChange}>
          <option value="STUDENT">Student</option>
          <option value="WORKPLACE_SUPERVISOR">Workplace Supervisor</option>
          <option value="ACADEMIC_SUPERVISOR">Academic Supervisor</option>
          <option value="INTERNSHIP_ADMIN">Internship Admin</option>
        </select>
        <button className={'auth-btn ${loading ? "disabled" : ""}'}
          onClick={handleRegister} disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
        <p className="auth-link">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;