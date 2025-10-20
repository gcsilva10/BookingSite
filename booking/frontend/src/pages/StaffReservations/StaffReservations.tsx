import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { apiGet, apiPatch, apiDelete } from '../../lib/api';
import { Button } from '../../components/Buttons';
import '../../components/Buttons/Button.css';
import './StaffReservations.css';

// Types
interface Table {
  id: number;
  number: number;
  seats: number;
  is_active: boolean;
}

interface Reservation {
  id: number;
  customer_name: string;
  customer_phone: string;
  start_datetime: string;
  guests: number;
  notes: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  tables: Table[];
}

interface AuthMe {
  id: number;
  username: string;
  email: string;
  is_superuser: boolean;
  is_staff: boolean;
  is_active: boolean;
}

// Utility functions
const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const StaffReservations: React.FC = () => {
  // Hooks
  const navigate = useNavigate();
  
  // State
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Effects
  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      apiGet<AuthMe>('/auth/me/')
        .then((data) => {
          if (!data.is_staff && !data.is_superuser) {
            navigate('/');
          }
        })
        .catch(() => {
          navigate('/staff');
        });
    }
  }, [navigate]);

  // Fetch reservations
  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<Reservation[]>('/reservations/');
      setReservations(data);
      setError(null);
    } catch (err) {
      setError('Failed to load reservations. Please try again.');
      console.error('Error loading reservations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Handlers
  const handleEventClick = (info: any) => {
    const reservationId = parseInt(info.event.id);
    const reservation = reservations.find(r => r.id === reservationId);
    
    if (reservation) {
      setSelectedReservation(reservation);
    }
  };

  const updateReservationStatus = async (id: number, newStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED') => {
    try {
      const reservationToUpdate = reservations.find(res => res.id === id);
      if (!reservationToUpdate) {
        throw new Error('Reservation not found');
      }

      await apiPatch(`/reservations/${id}/`, { status: newStatus });
      
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res.id === id ? { ...res, status: newStatus } : res
        )
      );
      
      if (selectedReservation?.id === id) {
        setSelectedReservation({ ...selectedReservation, status: newStatus });
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to update reservation status. Please try again.');
      console.error('Error updating reservation status:', err);
    }
  };

  const deleteReservation = async (id: number) => {
    if (!confirm("Tem certeza que deseja apagar esta reserva? Esta ação não pode ser desfeita.")) {
      return;
    }
    
    try {
      await apiDelete(`/reservations/${id}/`);
      
      setReservations(prevReservations => 
        prevReservations.filter(res => res.id !== id)
      );
      
      setSelectedReservation(null);
      setError(null);
    } catch (err) {
      setError('Failed to delete reservation. Please try again.');
      console.error('Error deleting reservation:', err);
    }
  };

  const closeReservationDetail = () => {
    setSelectedReservation(null);
  };

  // Computed values
  const filteredReservations = statusFilter === 'all' 
    ? reservations 
    : reservations.filter(r => r.status === statusFilter);

  const events = filteredReservations.map(reservation => ({
    id: String(reservation.id),
    title: `${reservation.customer_name} - ${reservation.guests} pessoas`,
    start: reservation.start_datetime,
    end: new Date(new Date(reservation.start_datetime).getTime() + 2 * 60 * 60 * 1000).toISOString(),
    backgroundColor: reservation.status === 'CONFIRMED' 
      ? '#4CAF50' 
      : reservation.status === 'CANCELLED' 
        ? '#f44336' 
        : '#FFC107',
    borderColor: reservation.status === 'CONFIRMED' 
      ? '#4CAF50' 
      : reservation.status === 'CANCELLED' 
        ? '#f44336' 
        : '#FFC107',
    textColor: '#000',
    extendedProps: {
      status: reservation.status
    }
  }));

  // Render

  return (
    <div className="page-staff-reservations">
      <h1>Gestão de Reservas</h1>
      
      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-item">
            <label>Status</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="PENDING">Pendentes</option>
              <option value="CONFIRMED">Confirmadas</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
          </div>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Calendar */}
      <div className="calendar-container">
        {loading ? (
          <p>A carregar reservas...</p>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            buttonText={{
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia'
            }}
            locale="pt"
            events={events}
            eventClick={handleEventClick}
            height="auto"
            nowIndicator={true}
            allDaySlot={false}
            slotMinTime="10:00:00"
            slotMaxTime="23:59:00"
          />
        )}
      </div>
      
      {/* Reservation Detail */}
      {selectedReservation && (
        <div className="reservation-detail">
          <h3>Detalhes da Reserva</h3>
          
          <div className="reservation-detail-grid">
            <div className="reservation-field">
              <div className="reservation-field-label">Status</div>
              <div className={`status-${selectedReservation.status.toLowerCase()}`}>
                {selectedReservation.status === 'PENDING' && 'Pendente'}
                {selectedReservation.status === 'CONFIRMED' && 'Confirmada'}
                {selectedReservation.status === 'CANCELLED' && 'Cancelada'}
              </div>
            </div>
            
            <div className="reservation-field">
              <div className="reservation-field-label">Nome</div>
              <div>{selectedReservation.customer_name}</div>
            </div>
            
            <div className="reservation-field">
              <div className="reservation-field-label">Telefone</div>
              <div>{selectedReservation.customer_phone}</div>
            </div>
            
            <div className="reservation-field">
              <div className="reservation-field-label">Data & Hora</div>
              <div>{formatDateTime(selectedReservation.start_datetime)}</div>
            </div>
            
            <div className="reservation-field">
              <div className="reservation-field-label">Número de Convidados</div>
              <div>{selectedReservation.guests} pessoas</div>
            </div>
            
            <div className="reservation-field">
              <div className="reservation-field-label">Mesas</div>
              <div className="reservation-tables">
                {selectedReservation.tables.map(table => (
                  <div key={table.id} className="reservation-table-item">
                    Mesa #{table.number} ({table.seats} lugares)
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="reservation-field">
            <div className="reservation-field-label">Observações</div>
            <div>{selectedReservation.notes || 'Sem observações'}</div>
          </div>
          
          <div className="reservation-actions">
            {/* Mostrar botão de Confirmar se não estiver confirmada */}
            {selectedReservation.status !== 'CONFIRMED' && (
              <Button 
                variant="success"
                className="confirm-btn"
                onClick={() => updateReservationStatus(selectedReservation.id, 'CONFIRMED')}
              >
                ✓ Confirmar Reserva
              </Button>
            )}
            
            {/* Mostrar botão de Pendente se não estiver pendente */}
            {selectedReservation.status !== 'PENDING' && (
              <Button 
                variant="primary"
                className="pending-btn"
                onClick={() => updateReservationStatus(selectedReservation.id, 'PENDING')}
              >
                ⏳ Marcar como Pendente
              </Button>
            )}
            
            {/* Mostrar botão de Cancelar se não estiver cancelada */}
            {selectedReservation.status !== 'CANCELLED' && (
              <Button 
                variant="secondary"
                className="cancel-btn"
                onClick={() => updateReservationStatus(selectedReservation.id, 'CANCELLED')}
              >
                ✕ Cancelar Reserva
              </Button>
            )}
            
            {/* Botão para apagar a reserva */}
            <Button 
              variant="danger"
              className="delete-btn"
              onClick={() => deleteReservation(selectedReservation.id)}
            >
              🗑️ Eliminar Reserva
            </Button>
            
            <Button variant="cancel" className="close-btn" onClick={closeReservationDetail}>
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffReservations;
