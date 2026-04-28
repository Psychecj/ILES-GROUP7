import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { confirmPasswordReset } from '../services/api';
import './Register.css';  // reuse same CSS

function ResetPasswordConfirm() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await confirmPasswordReset({
        uid,
        token,
        newPassword,
        confirmPassword,
      });
      if (data.success) {
        setSuccess('Password reset successful. Redirecting to login...');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(data.error || 'Reset failed. The link may have expired.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Set New Password</h2>
        <p className="auth-subtitle">Enter your new password below</p>

        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}

        <input
          type="password"
          placeholder="New password (min 8 chars)"
          className="auth-input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm new password"
          className="auth-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          className={`auth-btn ${loading ? 'disabled' : ''}`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <p className="auth-link">
          <Link to="/">Cancel and return to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordConfirm;