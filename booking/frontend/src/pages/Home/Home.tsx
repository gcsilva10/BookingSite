import React from 'react';
import './Home.css';
import { apiGet, apiPost } from '../../lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Button } from '../../components/Buttons';
import '../../components/Buttons/Button.css';

export default function Home() {
  const [isStaff, setIsStaff] = React.useState<boolean>(Boolean(localStorage.getItem('access_token')));

  // Dashboard state for staff (always declare, but only use when isStaff is true)
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [staffError, setStaffError] = React.useState<string | null>(null);
  
  // Customer reservation form state (always declare, but only use when isStaff is false)
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [guests, setGuests] = React.useState<number>(2);
  const [notes, setNotes] = React.useState('');
  const [selectedTables, setSelectedTables] = React.useState<number[]>([]);
  const [availableTables, setAvailableTables] = React.useState<{id: number; number: number; seats: number}[]>([]);
  const [loadingTables, setLoadingTables] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  // Color scheme for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  React.useEffect(() => {
    function onAuthChanged() {
      setIsStaff(Boolean(localStorage.getItem('access_token')));
    }
    window.addEventListener('auth:changed', onAuthChanged);
    window.addEventListener('storage', onAuthChanged);
    return () => {
      window.removeEventListener('auth:changed', onAuthChanged);
      window.removeEventListener('storage', onAuthChanged);
    };
  }, []);

  // Fetch statistics for staff dashboard
  React.useEffect(() => {
    if (!isStaff) return;
    
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await apiGet('/reservations/stats/');
        setStats(data);
        setStaffError(null);
      } catch (err) {
        console.error('Failed to load statistics:', err);
        setStaffError('Não foi possível carregar as estatísticas. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
    
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isStaff]);

  // Load available tables when date or time changes (for customer form)
  React.useEffect(() => {
    if (isStaff) return; // Only run for customers
    
    async function fetchAvailableTables() {
      // Only fetch tables if both date and time are selected
      if (!date || !time) {
        return;
      }

      try {
        setLoadingTables(true);
        
        // Format date and time into ISO string
        const reservationDateTime = new Date(`${date}T${time}`);
        
        // Fetch tables available at the selected time
        const tables = await apiGet<{id: number; number: number; seats: number}[]>(
          `/tables/?datetime=${reservationDateTime.toISOString()}`
        );
        setAvailableTables(tables);
        
        // Clear selected tables if they are no longer available
        setSelectedTables(prev => 
          prev.filter(tableId => tables.some(t => t.id === tableId))
        );
      } catch (err) {
        console.error('Failed to load available tables:', err);
      } finally {
        setLoadingTables(false);
      }
    }
    
    fetchAvailableTables();
  }, [isStaff, date, time]);

  // Validation function for customer form
  function validate(): string | null {
    if (!fullName.trim()) return 'Por favor indica o teu nome.';
    if (!phone.trim()) return 'Fornece telefone.';
    if (!date) return 'Escolhe a data.';
    if (!time) return 'Escolhe a hora.';
    if (!guests || guests < 1) return 'Número de pessoas inválido.';
    if (selectedTables.length === 0) return 'Por favor seleciona pelo menos uma mesa.';
    return null;
  }
  
  // Handle table selection changes
  const handleTableSelectionChange = (tableId: number) => {
    setSelectedTables(prevSelected => {
      if (prevSelected.includes(tableId)) {
        return prevSelected.filter(id => id !== tableId);
      } else {
        return [...prevSelected, tableId];
      }
    });
  };
  
  // Handle form submission for customer reservations
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const msg = validate();
    if (msg) { setError(msg); return; }
    try {
      setSubmitting(true);
      
      // Format date and time into ISO string
      const reservationDateTime = new Date(`${date}T${time}`);
      
      // Submit reservation to backend
      await apiPost('/reservations/', {
        customer_name: fullName,
        customer_phone: phone,
        start_datetime: reservationDateTime.toISOString(),
        guests: guests,
        notes: notes,
        tables_ids: selectedTables
      });
      
      setSuccess('Pedido de reserva enviado. Entraremos em contacto em breve.');
      setFullName(''); 
      setPhone(''); 
      setDate(''); 
      setTime(''); 
      setGuests(2); 
      setNotes('');
      setSelectedTables([]);
    } catch (err: any) {
      setError(err?.message || 'Falha ao enviar pedido.');
    } finally {
      setSubmitting(false);
    }
  }

  // Render staff dashboard
  if (isStaff) {
    return (
      <div className="page-home">
        <div className="dashboard-section">
          <div className="dashboard-header">
            <h2>Dashboard</h2>
            <p className="date-display">
              Estatísticas para hoje: {stats?.date ? new Date(stats.date).toLocaleDateString('pt-PT') : ''}
            </p>
          </div>
          
          {loading ? (
            <div className="loading-spinner">Carregando estatísticas...</div>
          ) : staffError ? (
            <div className="error-message">{staffError}</div>
          ) : stats ? (
            <div className="dashboard-content">
              {/* Coluna 1: Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Reservas Hoje</div>
                  <div className="stat-value">{stats.total_reservations}</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-label">Pendentes</div>
                  <div className="stat-value">{stats.pending_reservations}</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-label">Confirmadas</div>
                  <div className="stat-value">{stats.confirmed_reservations}</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-label">Pessoas Hoje</div>
                  <div className="stat-value">{stats.total_guests}</div>
                </div>
              </div>
              
              {/* Coluna 2: Gráfico de Atividade */}
              <div className="chart-activity">
                <div className="chart-card">
                  <div className="chart-header">
                    <h3 className="chart-title">Atividade por Hora</h3>
                    <div className="chart-icon">📊</div>
                  </div>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart
                      data={stats.hourly_data}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(232, 183, 1, 0.1)" />
                      <XAxis 
                        dataKey="hour" 
                        stroke="var(--color-gray-400)"
                        style={{ fontSize: '0.75rem' }}
                      />
                      <YAxis 
                        yAxisId="left" 
                        orientation="left" 
                        stroke="var(--color-primary)"
                        style={{ fontSize: '0.75rem' }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="#82ca9d"
                        style={{ fontSize: '0.75rem' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(26, 26, 26, 0.95)', 
                          border: '1px solid rgba(232, 183, 1, 0.3)',
                          borderRadius: '8px',
                          fontSize: '0.875rem'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
                      <Bar 
                        yAxisId="left" 
                        dataKey="reservations" 
                        name="Reservas" 
                        fill="var(--color-primary)"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar 
                        yAxisId="right" 
                        dataKey="guests" 
                        name="Pessoas" 
                        fill="#82ca9d"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Coluna 3: Gráfico de Status */}
              <div className="chart-status">
                <div className="chart-card">
                  <div className="chart-header">
                    <h3 className="chart-title">Status das Reservas</h3>
                    <div className="chart-icon">📈</div>
                  </div>
                  <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Confirmadas', value: stats.confirmed_reservations },
                          { name: 'Pendentes', value: stats.pending_reservations }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        innerRadius={50}
                        fill="var(--color-primary)"
                        dataKey="value"
                        paddingAngle={5}
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(26, 26, 26, 0.95)', 
                          border: '1px solid rgba(232, 183, 1, 0.3)',
                          borderRadius: '8px',
                          fontSize: '0.875rem'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
  
  // Render customer reservation form
  return (
    <div className="page-home">
      <section className="reservation-section">
        <div className="reservation-container">
          <div className="reservation-header">
            <h2>Reserve a Sua Mesa</h2>
            <p>Garanta o seu lugar no melhor restaurante da cidade</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome Completo</label>
                <input 
                  type="text"
                  className="input-name"
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="O teu nome"
                />
              </div>

              <div className="form-group">
                <label>Telefone</label>
                <input 
                  type="tel"
                  className="input-phone"
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="(+351) 9xx xxx xxx"
                />
              </div>

              <div className="form-group">
                <label>Data</label>
                <input 
                  type="date"
                  className="input-date"
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Hora</label>
                <input 
                  type="time"
                  className="input-time"
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Número de Pessoas</label>
                <input 
                  type="number"
                  className="input-guests"
                  min={1} 
                  value={guests} 
                  onChange={(e) => setGuests(Number(e.target.value) || 1)} 
                />
              </div>
            </div>
          
          <div className="table-selection">
            <h4>Mesas disponíveis:</h4>
            <div className="tables-choice-grid">
              {!date || !time ? (
                <p>Selecione data e hora para ver as mesas disponíveis.</p>
              ) : loadingTables ? (
                <p>Carregando mesas disponíveis...</p>
              ) : availableTables.length === 0 ? (
                <p>Não existem mesas disponíveis nesse horário. Por favor, escolha outro horário.</p>
              ) : (
                availableTables.map(table => (
                  <div 
                    key={table.id} 
                    className={`table-option ${selectedTables.includes(table.id) ? 'selected' : ''}`}
                    onClick={() => handleTableSelectionChange(table.id)}
                  >
                    <div className="table-number">Mesa {table.number}</div>
                    <div className="table-seats">{table.seats} pessoas</div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label>Observações (opcional)</label>
            <textarea 
              className="input-notes"
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Preferências, alergias, ocasiões especiais..." 
            />
          </div>
          <div className="submit-button-container">
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'A enviar...' : 'Confirmar Reserva'}
            </Button>
          </div>

          {error && <p className="msg error">{error}</p>}
          {success && <p className="msg success">{success}</p>}
        </form>
        </div>
      </section>
    </div>
  );
}
