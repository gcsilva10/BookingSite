import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const isStaff = Boolean(localStorage.getItem('access_token'));

  function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
    // Garantir atualização imediata de UI simples
    window.location.reload();
  }

  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      {isStaff ? (
        <button onClick={handleLogout} style={{ marginLeft: 'auto' }}>Logout</button>
      ) : (
        <Link to="/staff" style={{ marginLeft: 'auto' }}>Staff</Link>
      )}
    </nav>
  );
}
