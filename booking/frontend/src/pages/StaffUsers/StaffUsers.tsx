import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiDelete } from '../../lib/api';
import './StaffUsers.css';

type UserDto = {
  id: number;
  username: string;
  email: string;
  is_superuser: boolean;
  is_staff: boolean;
  is_active: boolean;
};

export default function StaffUsers() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isStaff, setIsStaff] = useState(true);
  const [isSuperuser, setIsSuperuser] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<{ results: UserDto[] }>(`/admin/users/`);
      setUsers(data.results);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar utilizadores');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiPost(`/admin/users/create/`, {
        username,
        password,
        email,
        is_staff: isStaff,
        is_superuser: isSuperuser,
      });
      setUsername('');
      setPassword('');
      setEmail('');
      setIsStaff(true);
      setIsSuperuser(false);
      await load();
    } catch (err: any) {
      setError(err.message || 'Falha ao criar utilizador');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Eliminar este utilizador?')) return;
    setError(null);
    try {
      await apiDelete(`/admin/users/${id}/`);
      await load();
    } catch (err: any) {
      setError(err.message || 'Falha ao eliminar utilizador');
    }
  }

  return (
    <div className="staff-users-page">
      <h2>Gestão de Utilizadores Staff</h2>
      {loading && <p className="loading-message">A carregar...</p>}
      {error && <p className="error-message">{error}</p>}

      <h3>Criar novo utilizador</h3>
      <form onSubmit={handleCreate} className="user-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input 
            id="username"
            type="text"
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            id="email"
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        
        <div className="checkbox-group">
          <input 
            id="is_staff" 
            type="checkbox" 
            checked={isStaff} 
            onChange={(e) => setIsStaff(e.target.checked)}
          />
          <label htmlFor="is_staff">Acesso Staff</label>
        </div>
        
        <div className="checkbox-group">
          <input 
            id="is_superuser" 
            type="checkbox" 
            checked={isSuperuser} 
            onChange={(e) => setIsSuperuser(e.target.checked)}
          />
          <label htmlFor="is_superuser">Acesso Superuser</label>
        </div>
        
        <button className="create-button" type="submit">Criar utilizador</button>
      </form>

      <h3>Utilizadores do sistema</h3>
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Staff</th>
            <th>Superuser</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email || '-'}</td>
              <td>
                <span className={`checkbox-value ${u.is_staff ? 'yes' : 'no'}`}>
                  {u.is_staff ? 'Sim' : 'Não'}
                </span>
              </td>
              <td>
                <span className={`checkbox-value ${u.is_superuser ? 'yes' : 'no'}`}>
                  {u.is_superuser ? 'Sim' : 'Não'}
                </span>
              </td>
              <td>
                <button className="delete-button" onClick={() => handleDelete(u.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                Nenhum utilizador encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


