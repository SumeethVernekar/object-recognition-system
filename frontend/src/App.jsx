import { useState } from 'react';
import Login from './components/Login';
import WebcamDetector from './components/WebcamDetector';
import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const handleLogin = (token, user) => { setToken(token); setUser(user); };
  const handleLogout = () => { setToken(null); setUser(null); };

  if (!token) return <Login onLogin={handleLogin} />;

  return (
    <div>
      <header className="app-header">
        <h1>LENS<span>SCAN</span></h1>
        <div className="user-controls">
          <span className='user'>
            <span className="user-name">{user?.name}</span>
            
          </span>
          <button className="btn-ghost" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <WebcamDetector token={token} />
    </div>
  );
}

export default App;