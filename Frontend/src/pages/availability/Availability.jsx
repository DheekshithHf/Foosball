import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TimeSlotPicker from '../../components/common/TimeSlotPicker';
import { mockTables, mockBookings, timeSlots } from '../../utils/mockData';
import './Availability.scss';

const Availability = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTable, setSelectedTable] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'calendar'

  // Generate next 14 days
  const getNext14Days = () => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    return days;
  };

  const next14Days = getNext14Days();

  // Get availability data for a specific table and date
  const getTableAvailability = (tableId, date) => {
    const bookedSlots = mockBookings
      .filter(booking => booking.date === date && booking.tableId === tableId)
      .map(booking => booking.startTime);
    
    const availableSlots = timeSlots.filter(slot => !bookedSlots.includes(slot));
    
    return {
      total: timeSlots.length,
      available: availableSlots.length,
      booked: bookedSlots.length,
      availableSlots,
      bookedSlots
    };
  };

  // Get overall availability for all tables on a date
  const getOverallAvailability = (date) => {
    const tablesToCheck = selectedTable === 'all' ? mockTables : mockTables.filter(t => t.id === parseInt(selectedTable));
    
    let totalSlots = 0;
    let totalAvailable = 0;
    let totalBooked = 0;

    tablesToCheck.forEach(table => {
      const availability = getTableAvailability(table.id, date);
      totalSlots += availability.total;
      totalAvailable += availability.available;
      totalBooked += availability.booked;
    });

    return {
      total: totalSlots,
      available: totalAvailable,
      booked: totalBooked,
      percentage: totalSlots > 0 ? Math.round((totalAvailable / totalSlots) * 100) : 0
    };
  };

  const handleQuickBook = (tableId, timeSlot) => {
    navigate('/book', { 
      state: { 
        selectedDate,
        selectedTime: timeSlot,
        preSelectedTable: tableId
      }
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getAvailabilityColor = (percentage) => {
    if (percentage >= 70) return 'high';
    if (percentage >= 40) return 'medium';
    return 'low';
  };

  return (
    <div className="availability">
      <div className="background-pattern"></div>
      <div className="container">
        <div className="availability__header">
          <h1>🗓️ Table Availability</h1>
          <p>Check real-time availability and book your preferred time slots</p>
        </div>

        {/* Controls */}
        <div className="availability__controls">
          <div className="date-selection">
            <label>📅 Select Date:</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="control-select"
            >
              {next14Days.map(day => (
                <option key={day.date} value={day.date}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div className="table-filter">
            <label>🏓 Table:</label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="control-select"
            >
              <option value="all">All Tables</option>
              {mockTables.map(table => (
                <option key={table.id} value={table.id}>
                  {table.name} - {table.location}
                </option>
              ))}
            </select>
          </div>

          <div className="view-toggle">
            <label>👁️ View:</label>
            <div className="toggle-buttons">
              <button
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
              <button
                className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Availability Summary */}
        <div className="availability__summary">
          {(() => {
            const overall = getOverallAvailability(selectedDate);
            return (
              <>
                <div className="summary-card">
                  <div className="summary-icon">📊</div>
                  <div className="summary-content">
                    <h3>Overall Availability</h3>
                    <div className={`availability-percentage availability-percentage--${getAvailabilityColor(overall.percentage)}`}>
                      {overall.percentage}%
                    </div>
                    <p>{overall.available} of {overall.total} slots available</p>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">✅</div>
                  <div className="summary-content">
                    <h3>Available Slots</h3>
                    <div className="summary-number available">{overall.available}</div>
                    <p>Ready to book</p>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">📅</div>
                  <div className="summary-content">
                    <h3>Booked Slots</h3>
                    <div className="summary-number booked">{overall.booked}</div>
                    <p>Currently reserved</p>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Availability Content */}
        <div className="availability__content">
          {viewMode === 'grid' ? (
            <div className="grid-view">
              {(selectedTable === 'all' ? mockTables : mockTables.filter(t => t.id === parseInt(selectedTable))).map(table => {
                const availability = getTableAvailability(table.id, selectedDate);
                const percentage = Math.round((availability.available / availability.total) * 100);

                return (
                  <div key={table.id} className="table-availability-card">
                    <div className="table-header">
                      <div className="table-info">
                        <h3>{table.name}</h3>
                        <p>{table.location}</p>
                        <span className={`table-status table-status--${table.status}`}>
                          {table.status === 'available' ? '✅ Available' : '🔧 Maintenance'}
                        </span>
                      </div>
                      <div className="availability-meter">
                        <div className={`availability-circle availability-circle--${getAvailabilityColor(percentage)}`}>
                          <span className="percentage">{percentage}%</span>
                        </div>
                        <p>{availability.available}/{availability.total} slots</p>
                      </div>
                    </div>

                    {table.status === 'available' && (
                      <div className="time-slots-section">
                        <h4>Available Time Slots</h4>
                        <div className="time-slots-grid">
                          {availability.availableSlots.slice(0, 8).map(slot => (
                            <button
                              key={slot}
                              className="time-slot-btn available"
                              onClick={() => handleQuickBook(table.id, slot)}
                            >
                              {formatTime(slot)}
                            </button>
                          ))}
                          {availability.availableSlots.length > 8 && (
                            <button
                              className="time-slot-btn more"
                              onClick={() => navigate('/book', { 
                                state: { 
                                  selectedDate,
                                  preSelectedTable: table.id
                                }
                              })}
                            >
                              +{availability.availableSlots.length - 8} more
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="calendar-view">
              <div className="calendar-header">
                <h3>📅 {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</h3>
              </div>
              
              {(selectedTable === 'all' ? mockTables : mockTables.filter(t => t.id === parseInt(selectedTable))).map(table => (
                <div key={table.id} className="calendar-table-row">
                  <div className="table-label">
                    <h4>{table.name}</h4>
                    <p>{table.location}</p>
                  </div>
                  <div className="table-timeline">
                    <TimeSlotPicker
                      availableSlots={getTableAvailability(table.id, selectedDate).availableSlots}
                      bookedSlots={getTableAvailability(table.id, selectedDate).bookedSlots}
                      selectedSlot={null}
                      onSlotSelect={(slot) => handleQuickBook(table.id, slot)}
                      timeSlots={timeSlots}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>🚀 Quick Actions</h3>
          <div className="actions-grid">
            <button 
              className="action-btn"
              onClick={() => navigate('/book')}
            >
              <span className="action-icon">📅</span>
              <span className="action-text">Book Now</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/find-players')}
            >
              <span className="action-icon">👥</span>
              <span className="action-text">Find Players</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/my-bookings')}
            >
              <span className="action-icon">📋</span>
              <span className="action-text">My Bookings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Availability;
