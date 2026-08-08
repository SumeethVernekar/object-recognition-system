import { useState } from 'react';
import axios from 'axios';
import './Login.css';
const API_URL = import.meta.env.VITE_API_URL;

function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isSignup ? 'signup' : 'login';

    try {
      const res = await axios.post(`${API_URL}/api/auth/${endpoint}`, form);
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="auth-screen">
  <div className="auth-card">
    <p className="auth-eyebrow">Object Recognition</p>
    <h2>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
    <form onSubmit={handleSubmit}>
      {isSignup && (
        <input className="field" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
      )}
      <input className="field" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input className="field" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      {error && <p className="error-text">{error}</p>}
      <button type="submit" className="btn-primary">{isSignup ? 'Sign Up' : 'Login'}</button>
    </form>
    <p className="auth-switch">
      {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
      <button className="link-btn" onClick={() => setIsSignup(!isSignup)}>
        {isSignup ? 'Login' : 'Sign Up'}
      </button>
    </p>
  </div>
</div>
  );
}

export default Login;