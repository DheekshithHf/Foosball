import React from 'react';
import './TimeSlotPicker.scss';

const TimeSlotPicker = ({ 
  availableSlots = [], 
  bookedSlots = [], 
  selectedSlot, 
  onSlotSelect, 
  timeSlots = [] 
}) => {
  const getSlotStatus = (slot) => {
    if (bookedSlots.includes(slot)) return 'booked';
    if (selectedSlot === slot) return 'selected';
    if (availableSlots.includes(slot)) return 'available';
    return 'unavailable';
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="time-slot-picker">
      <div className="time-slot-picker__legend">
        <div className="legend-item">
          <span className="legend-color legend-color--available"></span>
          Available
        </div>
        <div className="legend-item">
          <span className="legend-color legend-color--booked"></span>
          Booked
        </div>
        <div className="legend-item">
          <span className="legend-color legend-color--selected"></span>
          Selected
        </div>
      </div>

      <div className="time-slot-picker__grid">
        {timeSlots.map(slot => {
          const status = getSlotStatus(slot);
          const isClickable = status === 'available' || status === 'selected';

          return (
            <button
              key={slot}
              className={`time-slot time-slot--${status}`}
              onClick={() => isClickable && onSlotSelect(slot)}
              disabled={!isClickable}
            >
              {formatTime(slot)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSlotPicker;
