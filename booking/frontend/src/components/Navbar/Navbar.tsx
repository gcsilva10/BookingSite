import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import { apiGet } from '../../lib/api';
import NavButton from './NavButton';

export default function Navbar() {
  type AuthMe = {
    id: number;
    username: string;
    email: string;
    is_superuser: boolean;
    is_staff: boolean;
    is_active: boolean;
  };
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = React.useState<boolean>(Boolean(localStorage.getItem('access_token')));
  // Role check via /auth/me (supports both staff and superuser)
  const [isSuper, setIsSuper] = React.useState<boolean>(false);
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

  function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    try { window.dispatchEvent(new Event('auth:changed')); } catch {}
    navigate('/');
  }




  return (
    <nav className="navbar">

      <div className="navbar-left">
        <NavButton to="/" text="Home" />
        {isLogged && (<NavButton to="/staff/tables" text="See Tables" />)}
        {isLogged && (<NavButton to="/staff/reservations" text="See Reservations" />)}
        {isSuper && (<NavButton to="/staff/users" text="See Staff" />)}
      </div>

      <div className="navbar-center">
        <div>Num lugar com tantas histórias,</div>
        <div>Criamos novas memórias.</div>
      </div>

      <div className="navbar-right">
        {isLogged ? (
          <NavButton onClick={handleLogout} text="Logout" />
        ) : (
          <NavButton to="/staff" text="Staff" />
        )}
      </div>
      
    </nav>
  );
}
