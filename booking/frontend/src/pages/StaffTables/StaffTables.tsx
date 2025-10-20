import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api';
import { Button } from '../../components/Buttons';
import '../../components/Buttons/Button.css';
import './StaffTables.css';

// Types
interface Table {
  id: number;
  number: number;
  seats: number;
  is_active: boolean;
}

interface AuthMe {
  is_staff: boolean;
  is_superuser: boolean;
}

export default function StaffTables() {
  // Hooks
  const navigate = useNavigate();
  
  // State
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [seats, setSeats] = useState('2');
  const [isActive, setIsActive] = useState(true);

  // Effects
  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/staff');
      return;
    }
    
    apiGet<AuthMe>('/auth/me/')
      .then((data) => {
        if (!data.is_staff && !data.is_superuser) {
          navigate('/');
        }
      })
      .catch(() => {
        navigate('/staff');
      });
  }, [navigate]);

  // Load tables
  useEffect(() => {
    loadTables();
  }, []);

  // Functions
  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Table[]>('/tables/');
      setTables(data);
      setError(null);
    } catch (err) {
      setError('Failed to load tables. Please try again.');
      console.error('Error loading tables:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTableNumber('');
    setSeats('2');
    setIsActive(true);
    setShowAddForm(false);
  };

  // Handlers
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTable = await apiPost<Table>('/tables/', {
        number: parseInt(tableNumber),
        seats: parseInt(seats),
        is_active: isActive
      });
      
      setTables([...tables, newTable]);
      resetForm();
    } catch (err) {
      setError('Failed to create table. Please check your inputs and try again.');
      console.error('Error creating table:', err);
    }
  };

  const handleDeleteTable = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await apiDelete(`/tables/${id}/`);
        setTables(tables.filter(table => table.id !== id));
      } catch (err) {
        setError('Failed to delete table. Please try again.');
        console.error('Error deleting table:', err);
      }
    }
  };
  
  const handleToggleStatus = async (table: Table) => {
    try {
      const updatedTable = await apiPut<Table>(`/tables/${table.id}/`, {
        ...table,
        is_active: !table.is_active
      });
      
      setTables(tables.map(t => t.id === table.id ? updatedTable : t));
    } catch (err) {
      setError('Failed to update table status. Please try again.');
      console.error('Error updating table status:', err);
    }
  };

  // Render
  return (
    <div className="page-staff-tables">
      <div className="staff-tables-container">
        <div className="page-header">
          <h1>Gestão de Mesas</h1>
          <p>Crie, visualize e gerencie as mesas do restaurante</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {/* Add Table Button / Form */}
        {!showAddForm ? (
          <div className="add-table-button">
            <Button 
              variant="primary"
              onClick={() => setShowAddForm(true)}
            >
              ➕ Adicionar Nova Mesa
            </Button>
          </div>
        ) : (
          <div className="add-table-form">
            <h2>Adicionar Nova Mesa</h2>
            <form onSubmit={handleAddTable}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Número da Mesa</label>
                  <input 
                    type="number" 
                    value={tableNumber} 
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Ex: 1, 2, 3..."
                    required
                    min="1"
                  />
                </div>
                
                <div className="form-group">
                  <label>Capacidade (Pessoas)</label>
                  <input 
                    type="number" 
                    value={seats} 
                    onChange={(e) => setSeats(e.target.value)}
                    placeholder="Ex: 2, 4, 6..."
                    required
                    min="1"
                  />
                </div>
                
                <div className="form-group">
                  <label>Status Inicial</label>
                  <select 
                    value={isActive ? 'active' : 'inactive'} 
                    onChange={(e) => setIsActive(e.target.value === 'active')}
                  >
                    <option value="active">Ativa</option>
                    <option value="inactive">Inativa</option>
                  </select>
                </div>
              </div>
              
              <div className="form-actions">
                <Button type="button" variant="cancel" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Criar Mesa
                </Button>
              </div>
            </form>
          </div>
        )}
        
        {/* Tables Grid */}
        {loading ? (
          <p className="loading-spinner">A carregar mesas...</p>
        ) : (
          <div className="tables-grid">
            {tables.map((table) => (
              <div key={table.id} className="table-card">
                <div className="table-card-header">
                  <div className="table-number">Mesa {table.number}</div>
                  <div className="table-icon">🪑</div>
                </div>
                
                <div className="table-info">
                  <div className="info-row">
                    <span className="info-label">Capacidade</span>
                    <span className="info-value">{table.seats} pessoas</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">Status</span>
                    <span className={`table-status ${table.is_active ? 'available' : 'occupied'}`}>
                      {table.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>
                
                <div className="table-actions">
                  <Button 
                    variant={table.is_active ? "secondary" : "success"}
                    onClick={() => handleToggleStatus(table)}
                  >
                    {table.is_active ? '🔒 Desativar' : '✅ Ativar'}
                  </Button>
                  <Button 
                    variant="danger"
                    onClick={() => handleDeleteTable(table.id)}
                  >
                    🗑️ Eliminar
                  </Button>
                </div>
              </div>
            ))}
            
            {tables.length === 0 && !loading && (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-gray-400)', padding: '3rem' }}>
                Nenhuma mesa encontrada. Adicione a primeira mesa para começar.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
