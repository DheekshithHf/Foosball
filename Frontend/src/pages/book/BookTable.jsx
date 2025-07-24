import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import TimeSlotPicker from '../../components/common/TimeSlotPicker';
import apiService from '../../services/api';
import './BookTable.scss';

const BookTable = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTable, setSelectedTable] = useState('table_001'); // Backend uses string IDs
  const [selectedSlot, setSelectedSlot] = useState(location.state?.selectedTime || null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [duration, setDuration] = useState(30); // Backend uses 30-minute slots
  const [employees, setEmployees] = useState([]);
  const [currentUser] = useState('emp_001'); // Mock current user - replace with auth
  const [bookingNotes, setBookingNotes] = useState('');
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedSlot) {
      setShowBookingForm(true);
    }
  }, [selectedSlot]);

  // Generate next 7 days
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    return days;
  };

  const next7Days = getNext7Days();

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeeData = await apiService.getEmployees();
        setEmployees(employeeData);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        toast.error('Failed to load employees');
      }
    };
    fetchEmployees();
  }, []);

  // Fetch availability when date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (selectedDate) {
        setLoading(true);
        try {
          console.log('Fetching availability for date:', selectedDate); // Debug log
          const availabilityData = await apiService.getAvailability(selectedDate);
          console.log('Availability data received:', availabilityData); // Debug log
          setAvailability(availabilityData);
        } catch (error) {
          console.error('Failed to fetch availability:', error);
          toast.error(`Failed to load availability: ${error.message}`);
          // Set empty availability to show all slots as available
          setAvailability({
            date: selectedDate,
            time_slots: generateTimeSlots().map(slot => ({
              start_time: slot,
              end_time: addMinutesToTime(slot, 30),
              status: 'available'
            }))
          });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchAvailability();
  }, [selectedDate]);

  // Helper: convert "09:00:00" to "09:00"
  const toShortTime = (t) => t ? t.slice(0,5) : '';

  // Get available slots from API data
  const getAvailableSlots = () => {
    if (!availability || !availability.time_slots) {
      return [];
    }
    return availability.time_slots
      .filter(slot => slot.status === 'available')
      .map(slot => toShortTime(slot.start_time));
  };

  // Get booked slots from API data
  const getBookedSlots = () => {
    if (!availability || !availability.time_slots) {
      return [];
    }
    return availability.time_slots
      .filter(slot => slot.status === 'booked')
      .map(slot => toShortTime(slot.start_time));
  };

  // When user selects a slot, convert to backend format (HH:MM:SS)
  const handleSlotSelect = (slot) => {
    // slot is "09:00"
    // find the corresponding slot in backend data to get "09:00:00"
    const backendSlot = availability?.time_slots?.find(s => toShortTime(s.start_time) === slot);
    setSelectedSlot(backendSlot ? backendSlot.start_time : slot + ':00');
    setShowBookingForm(true);
  };

  const triggerConfetti = () => {
    // Multiple confetti bursts
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
      confetti(Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio)
      }));
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const generateBookingId = () => {
    const dateStr = selectedDate.replace(/-/g, '');
    const timeStr = selectedSlot.replace(':', '');
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `bk_${dateStr}_${timeStr}_${randomStr}`;
  };

  const addMinutesToTime = (time, minutes) => {
    // time: "09:00" or "09:00:00"
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  const handleSubmitBooking = async () => {
    if (!selectedSlot || !currentUser) {
      toast.error('Please select a time slot');
      return;
    }

    // Ensure start_time and end_time are in HH:MM:SS format
    const pad = (n) => n.toString().padStart(2, '0');
    const toHHMMSS = (t) => {
      if (!t) return '';
      const parts = t.split(':');
      if (parts.length === 2) return `${pad(parts[0])}:${pad(parts[1])}:00`;
      if (parts.length === 3) return `${pad(parts[0])}:${pad(parts[1])}:${pad(parts[2])}`;
      return t;
    };

    const bookingData = {
      id: generateBookingId(),
      employee_id: 123,
      date: selectedDate,
      start_time: toHHMMSS(selectedSlot),
      end_time: toHHMMSS(addMinutesToTime(selectedSlot, duration)),
      status: 'confirmed'
    };

    // Show loading toast
    const loadingToast = toast.loading('Creating your booking...', {
      style: {
        borderRadius: '10px',
        background: '#fff',
        color: '#333',
      },
    });

    try {
      const newBooking = await apiService.createBooking(bookingData);
      
      toast.dismiss(loadingToast);
      
      // Success toast with confetti
      toast.success('🎉 Booking confirmed successfully!', {
        duration: 5000,
        style: {
          borderRadius: '10px',
          background: '#fff',
          color: '#333',
          border: '2px solid #28a745',
          boxShadow: '0 8px 32px rgba(40, 167, 69, 0.2)',
        },
      });

      // Trigger confetti
      triggerConfetti();

      // Reset form
      setShowBookingForm(false);
      setSelectedSlot(null);
      setBookingNotes('');
      
      // Refresh availability
      const availabilityData = await apiService.getAvailability(selectedDate);
      setAvailability(availabilityData);
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);

    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Failed to create booking');
      console.error('Booking failed:', error);
    }
  };

  // Mock table data - replace with API call if needed
  const mockTables = [
    {
      id: 'table_001',
      name: 'Table 1',
      location: 'Main Office',
      status: 'available'
    }
  ];

  // Generate time slots for display (9 AM to 6 PM, 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // For display, convert "09:00:00" to "09:00"
  const formatTime = (time) => {
    if (!time) return '';
    const t = time.length === 8 ? time.slice(0,5) : time;
    return new Date(`2000-01-01T${t}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="book-table">
      <div className="background-pattern"></div>
      <div className="container">
        <div className="book-table__header">
          <h1>Book a Foosball Table</h1>
          <p>Select a date, table, and time slot to book your game</p>
        </div>

        <div className="book-table__content">
          {/* Date Selection */}
          <div className="date-selection">
            <h3>📅 Select Date</h3>
            <div className="date-tabs">
              {next7Days.map(day => (
                <button
                  key={day.date}
                  className={`date-tab ${selectedDate === day.date ? 'active' : ''}`}
                  onClick={() => setSelectedDate(day.date)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div className="booking-layout">
            {/* Table Selection */}
            <div className="table-selection">
              <h3>🏓 Select Table</h3>
              <div className="tables-list">
                {mockTables.map(table => (
                  <button
                    key={table.id}
                    className={`table-card ${selectedTable === table.id ? 'selected' : ''} ${table.status !== 'available' ? 'disabled' : ''}`}
                    onClick={() => table.status === 'available' && setSelectedTable(table.id)}
                    disabled={table.status !== 'available'}
                  >
                    <div className="table-name">{table.name}</div>
                    <div className="table-location">{table.location}</div>
                    <div className={`table-status table-status--${table.status}`}>
                      {table.status === 'available' ? '✅ Available' : '🔧 Maintenance'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div className="slot-selection">
              <h3>⏰ Select Time Slot</h3>
              {loading ? (
                <div className="loading-slots">Loading available slots...</div>
              ) : (
                <TimeSlotPicker
                  availableSlots={getAvailableSlots()}
                  bookedSlots={getBookedSlots()}
                  selectedSlot={selectedSlot ? toShortTime(selectedSlot) : null}
                  onSlotSelect={handleSlotSelect}
                  timeSlots={timeSlots}
                />
              )}
            </div>
          </div>

          {/* Booking Form Modal/Sidebar */}
          {showBookingForm && (
            <div className="booking-form-overlay">
              <div className="booking-form">
                <div className="booking-form__header">
                  <h3>Complete Your Booking</h3>
                  <button 
                    className="close-btn"
                    onClick={() => {
                      setShowBookingForm(false);
                      setSelectedSlot(null);
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div className="booking-form__content">
                  {/* Booking Summary */}
                  <div className="booking-summary">
                    <h4>📋 Booking Summary</h4>
                    <div className="summary-item">
                      <strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="summary-item">
                      <strong>Table:</strong> {mockTables.find(t => t.id === selectedTable)?.name}
                    </div>
                    <div className="summary-item">
                      <strong>Time:</strong> {formatTime(selectedSlot)} - {formatTime(addMinutesToTime(toShortTime(selectedSlot), duration))}
                    </div>
                  </div>

                  {/* Duration Selection */}
                  <div className="form-group">
                    <label>⏱️ Duration</label>
                    <select 
                      value={duration} 
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="form-control"
                    >
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="form-group">
                    <label>📝 Notes (Optional)</label>
                    <textarea
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="Add any notes for this booking..."
                      className="form-control"
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="form-actions">
                    <button 
                      className="btn btn--secondary"
                      onClick={() => {
                        setShowBookingForm(false);
                        setSelectedSlot(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn--primary"
                      onClick={handleSubmitBooking}
                    >
                      Confirm Booking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookTable;
