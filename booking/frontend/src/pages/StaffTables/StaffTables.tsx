import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api';
import './StaffTables.css';

interface Table {
  id: number;
  number: number;
  seats: number;
  is_active: boolean;
}

export default function StaffTables() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [tableNumber, setTableNumber] = useState('');
  const [seats, setSeats] = useState('2');
  const [isActive, setIsActive] = useState(true);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/staff');
      return;
    }
    
    // Verify if user is staff or superuser
    interface AuthMe {
      is_staff: boolean;
      is_superuser: boolean;
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
  
  // Function to toggle table status
  const handleToggleStatus = async (table: Table) => {
    try {
      // Update the table with opposite status
      const updatedTable = await apiPut<Table>(`/tables/${table.id}/`, {
        ...table,
        is_active: !table.is_active
      });
      
      // Update the table in the state
      setTables(tables.map(t => t.id === table.id ? updatedTable : t));
    } catch (err) {
      setError('Failed to update table status. Please try again.');
      console.error('Error updating table status:', err);
    }
  };

  const resetForm = () => {
    setTableNumber('');
    setSeats('2');
    setIsActive(true);
    setShowAddForm(false);
  };

  return (
    <div className="page-staff-tables">
      <h1>Tables Management</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {!showAddForm ? (
        <button 
          className="form-actions button create" 
          onClick={() => setShowAddForm(true)}
          style={{ marginBottom: '20px' }}
        >
          Add New Table
        </button>
      ) : (
        <div className="add-table-form">
          <h2>Add New Table</h2>
          <form onSubmit={handleAddTable}>
            <div className="form-grid">
              <div className="form-group">
                <label>Table Number</label>
                <input 
                  type="number" 
                  value={tableNumber} 
                  onChange={(e) => setTableNumber(e.target.value)}
                  required
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label>Seats</label>
                <input 
                  type="number" 
                  value={seats} 
                  onChange={(e) => setSeats(e.target.value)}
                  required
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select 
                  value={isActive ? 'active' : 'inactive'} 
                  onChange={(e) => setIsActive(e.target.value === 'active')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="create">
                Create Table
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading ? (
        <p>Loading tables...</p>
      ) : tables.length === 0 ? (
        <div className="empty-state">
          <p>No tables found. Create your first table to get started.</p>
          {!showAddForm && (
            <button onClick={() => setShowAddForm(true)}>
              Create Table
            </button>
          )}
        </div>
      ) : (
        <div className="tables-grid">
          {tables.map(table => (
            <div key={table.id} className="table-card">
              <h3>Table #{table.number}</h3>
              <p><strong>Seats:</strong> {table.seats} people</p>
              <p>
                <strong>Status:</strong> 
                <span style={{ color: table.is_active ? '#4CAF50' : '#F44336' }}>
                  {table.is_active ? 'Active' : 'Inactive'}
                </span>
              </p>
              <div className="table-actions">
                <button 
                  className={table.is_active ? "toggle active" : "toggle inactive"} 
                  onClick={() => handleToggleStatus(table)}
                >
                  {table.is_active ? 'Set Inactive' : 'Set Active'}
                </button>
                <button className="delete" onClick={() => handleDeleteTable(table.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
