import React from 'react';
import './Home.css';
import { apiGet, apiPost } from '../../lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function Home() {
  const [isStaff, setIsStaff] = React.useState<boolean>(Boolean(localStorage.getItem('access_token')));

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

  if (isStaff) {
    // Dashboard state for staff
    const [stats, setStats] = React.useState<any>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);
    
    // Color scheme for pie chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    // Fetch statistics for today
    React.useEffect(() => {
      async function fetchStats() {
        try {
          setLoading(true);
          const data = await apiGet('/reservations/stats/');
          setStats(data);
          setError(null);
        } catch (err) {
          console.error('Failed to load statistics:', err);
          setError('Não foi possível carregar as estatísticas. Tente novamente mais tarde.');
        } finally {
          setLoading(false);
        }
      }
      
      fetchStats();
      
      // Refresh stats every 5 minutes
      const interval = setInterval(fetchStats, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }, []);
    
    return (
      <div className="page-home">
        <div className="dashboard">
          <h1>Dashboard - Couraça Booking</h1>
          <p className="date-display">Estatísticas para hoje: {stats?.date ? new Date(stats.date).toLocaleDateString('pt-PT') : ''}</p>
          
          {loading ? (
            <div className="loading-spinner">Carregando estatísticas...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : stats ? (
            <>
              <div className="stats-cards">
                <div className="stat-card">
                  <h2>Reservas Hoje</h2>
                  <div className="stat-number">{stats.total_reservations}</div>
                  <div className="stat-detail">
                    <div className="stat-item">
                      <span className="stat-label">Pendentes:</span>
                      <span className="stat-value pending">{stats.pending_reservations}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Confirmadas:</span>
                      <span className="stat-value confirmed">{stats.confirmed_reservations}</span>
                    </div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <h2>Pessoas Hoje</h2>
                  <div className="stat-number">{stats.total_guests}</div>
                  <div className="stat-detail">
                    <div className="stat-item">
                      <span className="stat-label">Média por reserva:</span>
                      <span className="stat-value">
                        {stats.total_reservations > 0 
                          ? (stats.total_guests / stats.total_reservations).toFixed(1) 
                          : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="charts-container">
                <div className="chart-card">
                  <h3>Reservas por Hora</h3>
                  <div className="chart">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={stats.hourly_data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="reservations" name="Reservas" fill="#8884d8" />
                        <Bar yAxisId="right" dataKey="guests" name="Pessoas" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="chart-card">
                  <h3>Status das Reservas</h3>
                  <div className="chart">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Confirmadas', value: stats.confirmed_reservations },
                            { name: 'Pendentes', value: stats.pending_reservations }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    );
  }

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

  function validate(): string | null {
    if (!fullName.trim()) return 'Por favor indica o teu nome.';
    if (!phone.trim()) return 'Fornece telefone.';
    if (!date) return 'Escolhe a data.';
    if (!time) return 'Escolhe a hora.';
    if (!guests || guests < 1) return 'Número de pessoas inválido.';
    if (selectedTables.length === 0) return 'Por favor seleciona pelo menos uma mesa.';
    return null;
  }

  // Load available tables when date or time changes
  React.useEffect(() => {
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
  }, [date, time]);
  
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

  return (
    <div className="page-home">
      <div className="home-card">
        <h1 className="home-title">Reserva uma mesa no Couraça!</h1>
        <form onSubmit={handleSubmit} className="reservation-form">
          <label>
            Nome completo:
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="O teu nome" />
          </label>
          <div className="row two">
            <label>
              Telefone:
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(+351) 9xx xxx xxx" />
            </label>
          </div>
          <div className="row three">
            <label>
              Data:
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label>
              Hora:
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </label>
          </div>
          <div className="row three">
            <label>
              Pessoas:
              <input type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value) || 1)} />
            </label>
          </div>
          
          <div className="tables-selection">
            <label>Mesas disponíveis:</label>
            <div className="tables-grid">
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
                    className={`table-item ${selectedTables.includes(table.id) ? 'selected' : ''}`}
                    onClick={() => handleTableSelectionChange(table.id)}
                  >
                    <div className="table-number">Mesa #{table.number}</div>
                    <div className="table-seats">{table.seats} pessoas</div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="row four">
            <label>
              Observações:
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Preferências, alergias, ocasiões especiais..." />
            </label>
          </div>
          <button className="reserve-btn" type="submit" disabled={submitting}>{submitting ? 'A enviar...' : 'Pedir reserva'}</button>
        </form>
        {error && <p className="msg error">{error}</p>}
        {success && <p className="msg success">{success}</p>}
      </div>
    </div>
  );
}
