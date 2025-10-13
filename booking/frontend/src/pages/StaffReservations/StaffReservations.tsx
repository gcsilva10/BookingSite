import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { apiGet } from '../../lib/api';
import './StaffReservations.css';

// Define interfaces for our data
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

// Format date for display
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
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  // Handle event click on calendar
  const handleEventClick = (info: any) => {
    const reservationId = parseInt(info.event.id);
    const reservation = reservations.find(r => r.id === reservationId);
    
    if (reservation) {
      setSelectedReservation(reservation);
    }
  };

  // Update reservation status
  const updateReservationStatus = async (id: number, newStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED') => {
    try {
      // Find the reservation we're updating
      const reservationToUpdate = reservations.find(res => res.id === id);
      if (!reservationToUpdate) {
        throw new Error('Reservation not found');
      }

      // Create a direct status update without using the serializer
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/reservations/${id}/`, {
        method: 'PATCH',  // Use PATCH for partial updates
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }
      
      // Update the reservation in our state
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res.id === id ? { ...res, status: newStatus } : res
        )
      );
      
      // Also update the selected reservation if it's the one we just updated
      if (selectedReservation?.id === id) {
        setSelectedReservation({ ...selectedReservation, status: newStatus });
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to update reservation status. Please try again.');
      console.error('Error updating reservation status:', err);
    }
  };

  // Close reservation detail panel
  const closeReservationDetail = () => {
    setSelectedReservation(null);
  };

  // Filter reservations based on status
  const filteredReservations = statusFilter === 'all' 
    ? reservations 
    : reservations.filter(r => r.status === statusFilter);

  // Map reservations to FullCalendar events
  const events = filteredReservations.map(reservation => ({
    id: String(reservation.id),
    title: `${reservation.customer_name} - ${reservation.guests} pessoas`,
    start: reservation.start_datetime,
    end: new Date(new Date(reservation.start_datetime).getTime() + 2 * 60 * 60 * 1000).toISOString(), // Default 2-hour reservation
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

  return (
    <div className="page-staff-reservations">
      <h1>Reservations Calendar</h1>
      
      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-item">
            <label>Status</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Calendar */}
      <div className="calendar-container">
        {loading ? (
          <p>Loading reservations...</p>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
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
          <h3>Reservation Details</h3>
          
          <div className="reservation-detail-grid">
            <div className="reservation-field">
              <div className="reservation-field-label">Status</div>
              <div className={`status-${selectedReservation.status.toLowerCase()}`}>
                {selectedReservation.status === 'PENDING' && 'Pending'}
                {selectedReservation.status === 'CONFIRMED' && 'Confirmed'}
                {selectedReservation.status === 'CANCELLED' && 'Cancelled'}
              </div>
            </div>
            
            <div className="reservation-field">
              <div className="reservation-field-label">Name</div>
              <div>{selectedReservation.customer_name}</div>
            </div>
            
            <div className="reservation-field">
              <div className="reservation-field-label">Phone</div>
              <div>{selectedReservation.customer_phone}</div>
            </div>
            
            <div className="reservation-field">
              <div className="reservation-field-label">Date & Time</div>
              <div>{formatDateTime(selectedReservation.start_datetime)}</div>
            </div>
            
            <div className="reservation-field">
              <div className="reservation-field-label">Number of Guests</div>
              <div>{selectedReservation.guests} pessoas</div>
            </div>
            
            <div className="reservation-field">
              <div className="reservation-field-label">Tables</div>
              <div className="reservation-tables">
                {selectedReservation.tables.map(table => (
                  <div key={table.id} className="reservation-table-item">
                    Mesa #{table.number} ({table.seats} seats)
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="reservation-field">
            <div className="reservation-field-label">Notes</div>
            <div>{selectedReservation.notes || 'No notes'}</div>
          </div>
          
          <div className="reservation-actions">
            {selectedReservation.status === 'PENDING' && (
              <>
                <button 
                  className="confirm-btn"
                  onClick={() => updateReservationStatus(selectedReservation.id, 'CONFIRMED')}
                >
                  Confirm Reservation
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => updateReservationStatus(selectedReservation.id, 'CANCELLED')}
                >
                  Cancel Reservation
                </button>
              </>
            )}
            {selectedReservation.status === 'CONFIRMED' && (
              <button 
                className="cancel-btn"
                onClick={() => updateReservationStatus(selectedReservation.id, 'CANCELLED')}
              >
                Cancel Reservation
              </button>
            )}
            <button className="close-btn" onClick={closeReservationDetail}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffReservations;
