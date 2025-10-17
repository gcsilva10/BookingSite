import React, { useState } from 'react';
import './StaffLogin.css';
import { API_BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Buttons';
import { GeometricShapes } from '../../components/GeometricShapes';
import '../../components/Buttons/Button.css';

export default function StaffLogin() {
  // Hooks
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handlers
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('Credenciais inválidas');
      const data = await res.json();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      setSuccess('Login efetuado.');
      try { window.dispatchEvent(new Event('auth:changed')); } catch {}
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro de autenticação');
    } finally {
      setLoading(false);
    }
  }

  // Render
  return (
    <div className="page-staff-login">
      <GeometricShapes />
      
      <div className="login-card">
        <div className="login-logo">
          <h1>Couraça</h1>
          <p>Restaurant & Bar</p>
        </div>
        
        <h2 className="login-title">Acesso Staff</h2>
        
        <form onSubmit={handleSubmit} className="staff-form">
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="O teu username"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="A tua password"
            />
          </div>
          
          <Button variant="primary" type="submit" disabled={loading} className="login-button">
            {loading ? 'A entrar...' : 'Entrar'}
          </Button>
        </form>
        
        {error && <p className="msg error">{error}</p>}
        {success && <p className="msg success">{success}</p>}
      </div>
    </div>
  );
}
