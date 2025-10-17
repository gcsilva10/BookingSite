import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import { apiGet } from '../../lib/api';
import { NavButton } from '../Buttons';

// Types
type AuthMe = {
  id: number;
  username: string;
  email: string;
  is_superuser: boolean;
  is_staff: boolean;
  is_active: boolean;
};

export default function Navbar() {
  // Hooks
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = React.useState<boolean>(Boolean(localStorage.getItem('access_token')));
  const [isSuper, setIsSuper] = React.useState<boolean>(false);

  // Effects
  // On mount, check if token is valid and if user is superuser
  React.useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!localStorage.getItem('access_token')) return;
      try {
        const data = await apiGet<AuthMe>(`/auth/me/`);
        if (!cancelled) {
          setIsSuper(Boolean(data.is_superuser));
          setIsLogged(Boolean(localStorage.getItem('access_token')));
        }
      } catch {
        if (!cancelled) {
          setIsSuper(false);
          setIsLogged(Boolean(localStorage.getItem('access_token')));
        }
      }
    }
    check();
    return () => { cancelled = true };
  }, [isLogged]);

  // Listen to auth changes (login/logout) via custom event or storage event
  React.useEffect(() => {
    function onAuthChanged() {
      const t = localStorage.getItem('access_token');
      setIsLogged(Boolean(t));
      if (!t) { setIsSuper(false); return; }
      apiGet<AuthMe>(`/auth/me/`)
        .then((data) => {
          setIsSuper(Boolean(data.is_superuser));
        })
        .catch(() => { setIsSuper(false); });
    }
    window.addEventListener('auth:changed', onAuthChanged);
    window.addEventListener('storage', onAuthChanged);
    return () => {
      window.removeEventListener('auth:changed', onAuthChanged);
      window.removeEventListener('storage', onAuthChanged);
    };
  }, []);

  // Handlers
  function handleLogout() {  
    // First, clear auth tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Then notify auth change
    try { window.dispatchEvent(new Event('auth:changed')); } catch {}
    
    // Finally navigate to the root URL
    navigate('/');
  }

  // Render

  return (
    <nav className="navbar">
      <div>
        <div className="navbar-left">
          <NavButton to="/" text="Home" />
          {isLogged && (<NavButton to="/staff/tables" text="Mesas" />)}
          {isLogged && (<NavButton to="/staff/reservations" text="Reservas" />)}
          {isSuper && (<NavButton to="/staff/users" text="Staff" />)}
        </div>

        <div className="navbar-center">
          <div className="logo">Couraça</div>
          <div className="subtitle">Restaurant & Bar</div>
        </div>

        <div className="navbar-right">
          {isLogged ? (
            <NavButton onClick={handleLogout} text="Logout" />
          ) : (
            <NavButton to="/staff" text="Staff Login" />
          )}
        </div>
      </div>
    </nav>
  );
}
