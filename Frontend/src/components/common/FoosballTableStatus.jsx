import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockTables, mockBookings, timeSlots } from '../../utils/mockData';
import './FoosballTableStatus.scss';

const FoosballTableStatus = () => {
  const navigate = useNavigate();
  
  const today = new Date().toISOString().split('T')[0];
  
  const getAvailableSlots = () => {
    const bookedSlots = mockBookings
      .filter(booking => booking.date === today)
      .map(booking => booking.startTime);
    
    return timeSlots.filter(slot => !bookedSlots.includes(slot));
  };

  const isTableAvailable = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${Math.floor(currentMinute / 30) * 30 === 0 ? '00' : '30'}`;
    
    return getAvailableSlots().includes(currentTime);
  };

  const getNextSlot = () => {
    const availableSlots = getAvailableSlots();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    for (let slot of availableSlots) {
      const [hour, minute] = slot.split(':').map(Number);
      const slotTime = new Date();
      slotTime.setHours(hour, minute, 0, 0);
      
      if (slotTime > now) {
        return {
          startTime: slot,
          endTime: timeSlots[timeSlots.indexOf(slot) + 1] || '18:00'
        };
      }
    }
    return null;
  };

  const tableAvailable = isTableAvailable();
  const nextSlot = getNextSlot();
  const availableTables = mockTables.filter(table => table.status === 'available').length;

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="foosball-table-status">
      <div className="status-card">
        <div className="table-icon">
          <div className="table-graphic">
            <div className="table-surface">
              <div className="center-line"></div>
              <div className="player-figure player-1">⚽</div>
              <div className="player-figure player-2">⚽</div>
              <div className="goal goal-left"></div>
              <div className="goal goal-right"></div>
            </div>
          </div>
        </div>
        
        <div className="status-info">
          <h2>🏓 Foosball Tables</h2>
          <div className={`status-indicator ${tableAvailable ? 'available' : 'busy'}`}>
            <span className="status-dot"></span>
            {tableAvailable ? 'Available now!' : 'Currently busy'}
          </div>
          
          <div className="table-stats">
            <span className="stat">
              <strong>{availableTables}</strong> of <strong>{mockTables.length}</strong> tables free
            </span>
          </div>
          
          {nextSlot && (
            <p className="next-slot">
              Next available: <strong>{formatTime(nextSlot.startTime)} - {formatTime(nextSlot.endTime)}</strong>
            </p>
          )}
        </div>
        
        <div className="action-buttons">
          <button 
            className="book-now-btn primary"
            onClick={() => navigate('/book')}
          >
            <span className="btn-icon">🎯</span>
            Book Table
          </button>
          <button 
            className="book-now-btn secondary"
            onClick={() => navigate('/tournaments')}
          >
            <span className="btn-icon">🏆</span>
            Join Tournament
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoosballTableStatus;
