import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, saveToken, saveUser } from "../services/api";
import "./Login.css";
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slowLoad, setSlowLoad] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const slowTimer = setTimeout(() => setSlowLoad(true), 4000);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      clearTimeout(slowTimer);
      setSlowLoad(false);
      setLoading(false);
      return;
    }

    try {
      const data = await loginUser({ email, password, role });
      if (!data.success) {
        setError(data.error || "Login failed");
        return;
      }

      saveToken(data.token);
      saveUser(data.user);

      const roleRoutes = {
        STUDENT: '/student',
        WORKPLACE_SUPERVISOR: '/workplace-supervisor',
        ACADEMIC_SUPERVISOR: '/academic-supervisor',
        INTERNSHIP_ADMIN: '/admin',
      };

      const destination = roleRoutes[data.user.role] || '/';
      navigate(destination);
    } catch (err) {
      setError(err.message || "An error occurred during login, try again");
    } finally {
      clearTimeout(slowTimer);
      setSlowLoad(false);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>ILES System</h2>
        <p>Sign in to your account</p>

        {error && <p className="error-message">{error}</p>}

        <input
          className="input-field"
          type="text"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input-field"
        >
          <option value="STUDENT">Student</option>
          <option value="WORKPLACE_SUPERVISOR">Workplace Supervisor</option>
          <option value="ACADEMIC_SUPERVISOR">Academic Supervisor</option>
          <option value="INTERNSHIP_ADMIN">Admin</option>
        </select>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="login-button"
        >
          {loading
            ? slowLoad
              ? "Server is waking up, please wait..."
              : "Logging in..."
            : "Login"}
        </button>

        <div className='login-links'>
          <Link to='/register'>Don't have an account? Sign up</Link>
          <Link to='/forgot-password'>Forgot your password?</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
