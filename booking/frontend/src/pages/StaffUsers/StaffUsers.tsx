import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiDelete } from '../../lib/api';
import { Button } from '../../components/Buttons';
import { GeometricShapes } from '../../components/GeometricShapes';
import '../../components/Buttons/Button.css';
import './StaffUsers.css';

// Types
type UserDto = {
  id: number;
  username: string;
  email: string;
  is_superuser: boolean;
  is_staff: boolean;
  is_active: boolean;
};

export default function StaffUsers() {
  // State
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isStaff, setIsStaff] = useState(true);
  const [isSuperuser, setIsSuperuser] = useState(false);

  // Effects
  useEffect(() => {
    load();
  }, []);

  // Functions
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

  // Handlers
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

  // Render
  return (
    <div className="page-staff-users">
      <GeometricShapes />
      
      <div className="staff-users-container">
        <div className="page-header">
          <h1>Gestão de Utilizadores</h1>
          <p>Crie e gerencie utilizadores staff da aplicação</p>
        </div>

        {error && <p className="error-message">{error}</p>}

        {/* Create User Form */}
        <section className="create-user-section">
          <h2>Criar Novo Utilizador</h2>
          <form onSubmit={handleCreate} className="create-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input 
                id="username"
                type="text"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Digite o username"
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
            placeholder="Digite a password"
            required
          />
        </div>
        
        <div className="checkbox-group">
            </div>
            
            <div className="form-group">
              <div className="checkbox-group">
                <input 
                  id="is_superuser" 
                  type="checkbox" 
                  checked={isSuperuser} 
                  onChange={(e) => setIsSuperuser(e.target.checked)}
                />
                <label htmlFor="is_superuser">Acesso Superuser</label>
              </div>
            </div>
            
            <div className="form-actions">
              <Button variant="primary" type="submit">
                Criar Utilizador
              </Button>
            </div>
          </form>
        </section>

        {/* Users Table */}
        <section className="users-table-section">
          <h2>Utilizadores Existentes</h2>
          
          {loading ? (
            <p className="loading-spinner">A carregar utilizadores...</p>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Permissões</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td><strong>{u.username}</strong></td>
                    <td>{u.email || '-'}</td>
                    <td>
                      <span className={`user-badge ${u.is_active ? 'active' : 'inactive'}`}>
                        {u.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      {u.is_superuser && <span className="user-badge superuser">Superuser</span>}
                      {u.is_staff && <span className="user-badge staff">Staff</span>}
                      {!u.is_staff && !u.is_superuser && '-'}
                    </td>
                    <td>
                      <Button 
                        variant="danger" 
                        onClick={() => handleDelete(u.id)}
                      >
                        Eliminar
                      </Button>
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
          )}
        </section>
      </div>
    </div>
  );
}


