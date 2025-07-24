import React from 'react';
import { mockUsers, mockTables } from '../../utils/mockData';
import './BookingCard.scss';

const BookingCard = ({ booking, onCancel, onModify, showActions = true }) => {
  // Use backend fields if present, fallback to mock fields for compatibility
  const bookedByUser = mockUsers.find(user => user.id === booking.bookedBy) || { name: booking.bookedBy || booking.employee_name || booking.employee };
  const table = mockTables.find(t => t.id === (booking.tableId || booking.table_id || 'table_001'));
  // If participants is not available, fallback to 1 (the booked by user)
  const participants = booking.participants && Array.isArray(booking.participants)
    ? mockUsers.filter(user => booking.participants.includes(user.id))
    : [];
  const participantsCount = booking.participants && Array.isArray(booking.participants)
    ? booking.participants.length
    : 1;

  const formatTime = (time) => {
    // Accepts "14:00:00" or "14:00"
    if (!time) return '';
    const t = time.length === 8 ? time.slice(0,5) : time;
    return new Date(`2000-01-01T${t}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateStr) => {
    // Accepts "YYYY-MM-DD"
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'cancelled': return 'danger';
      case 'pending': return 'warning';
      default: return 'info';
    }
  };

  return (
    <div className="booking-card">
      <div className="booking-card__header">
        <div className="booking-card__date-time">
          <h3>{formatDate(booking.date)}</h3>
          <p>
            {formatTime(booking.start_time || booking.startTime)} - {formatTime(booking.end_time || booking.endTime)}
          </p>
        </div>
        <span className={`booking-card__status booking-card__status--${getStatusColor(booking.status)}`}>
          {booking.status}
        </span>
      </div>

      <div className="booking-card__details">
        <div className="booking-card__table">
          <strong>📍 {table?.name || 'Table 1'}</strong>
          <span>{table?.location || 'Main Office'}</span>
        </div>

        <div className="booking-card__booked-by">
          <strong>Booked by:</strong> {bookedByUser?.name}
        </div>

        <div className="booking-card__participants">
          <strong>Players ({participantsCount}/4):</strong>
          <div className="participants-list">
            {participants.length > 0
              ? participants.map(participant => (
                  <span key={participant.id} className="participant-tag">
                    {participant.name}
                  </span>
                ))
              : <span className="participant-tag">{bookedByUser?.name}</span>
            }
          </div>
        </div>

        {booking.notes && (
          <div className="booking-card__notes">
            <strong>Notes:</strong> {booking.notes}
          </div>
        )}
      </div>

      {showActions && booking.status === 'confirmed' && (
        <div className="booking-card__actions">
          <button 
            className="btn btn--secondary btn--small"
            onClick={() => onModify && onModify(booking)}
          >
            Modify
          </button>
          <button 
            className="btn btn--danger btn--small"
            onClick={() => onCancel && onCancel(booking)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
