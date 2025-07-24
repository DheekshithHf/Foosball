import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingCard from '../../components/common/BookingCard';
import apiService from '../../services/api';
import './MyBookings.scss';

const MyBookings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');

  const currentUserId = "123"; // Use the same mock user as BookTable

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await apiService.getUserBookings(currentUserId);
        console.log('Fetched bookings data:', data); // <-- log the raw API response
        // Combine upcoming and past for unified filtering
        const allBookings = [
          ...(data.upcoming || []),
          ...(data.past || [])
        ];
        // Only include bookings where employee matches current user
        const userBookings = allBookings.filter(
          booking => booking.employee === currentUserId
        );
        console.log('Filtered user bookings:', userBookings); // <-- log filtered bookings
        setBookings(userBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error); // <-- log error
        setBookings([]);
      }
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    let filtered = [...bookings];

    // Filter by tab
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (activeTab) {
      case 'upcoming':
        filtered = filtered.filter(booking => 
          new Date(booking.date) >= new Date(today) && booking.status !== 'cancelled'
        );
        break;
      case 'past':
        filtered = filtered.filter(booking => 
          new Date(booking.date) < new Date(today) || booking.status === 'completed'
        );
        break;
      case 'cancelled':
        filtered = filtered.filter(booking => booking.status === 'cancelled');
        break;
    }

    // Filter by period
    if (filterPeriod !== 'all') {
      const filterDate = new Date();
      if (filterPeriod === 'week') {
        filterDate.setDate(filterDate.getDate() - 7);
      } else if (filterPeriod === 'month') {
        filterDate.setMonth(filterDate.getMonth() - 1);
      }
      
      filtered = filtered.filter(booking => 
        new Date(booking.date) >= filterDate
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        (booking.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.date.includes(searchTerm))
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, activeTab, searchTerm, filterPeriod]);

  const handleCancelBooking = (booking) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      // In a real app, this would be an API call
      const updatedBookings = bookings.map(b => 
        b.id === booking.id ? { ...b, status: 'cancelled' } : b
      );
      setBookings(updatedBookings);
      alert('Booking cancelled successfully');
    }
  };

  const handleModifyBooking = (booking) => {
    navigate('/book', { state: { modifyBooking: booking } });
  };

  const handleNewBooking = () => {
    navigate('/book');
  };

  const getTabCount = (tab) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (tab) {
      case 'upcoming':
        return bookings.filter(booking => 
          new Date(booking.date) >= new Date(today) && booking.status !== 'cancelled'
        ).length;
      case 'past':
        return bookings.filter(booking => 
          new Date(booking.date) < new Date(today) || booking.status === 'completed'
        ).length;
      case 'cancelled':
        return bookings.filter(booking => booking.status === 'cancelled').length;
      default:
        return 0;
    }
  };

  return (
    <div className="my-bookings">
      <div className="background-pattern"></div>
      <div className="container">
        <div className="my-bookings__header">
          <div className="header-content">
            <h1>My Bookings</h1>
            <p>Manage your foosball table reservations</p>
          </div>
          <button className="btn btn--primary" onClick={handleNewBooking}>
            📅 New Booking
          </button>
        </div>

        {/* Tabs */}
        <div className="bookings-tabs">
          <button
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming ({getTabCount('upcoming')})
          </button>
          <button
            className={`tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past ({getTabCount('past')})
          </button>
          <button
            className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled ({getTabCount('cancelled')})
          </button>
        </div>

        {/* Filters */}
        <div className="bookings-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="bookings-content">
          {filteredBookings.length > 0 ? (
            <div className="bookings-grid">
              {filteredBookings.map(booking => (
                <BookingCard
                  key={booking.id}
                  // Provide all fields needed for display and safe date parsing
                  booking={{
                    ...booking,
                    participants: [booking.employee_name].length,
                    bookedBy: booking.employee_name,
                    // Add a displayDate field for BookingCard to use
                    displayDate: booking.date ? new Date(booking.date + 'T00:00:00') : null,
                  }}
                  onCancel={handleCancelBooking}
                  onModify={handleModifyBooking}
                  showActions={activeTab === 'upcoming'}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">📅</div>
              <h3>No {activeTab} bookings</h3>
              <p>
                {activeTab === 'upcoming' && "You don't have any upcoming bookings."}
                {activeTab === 'past' && "You don't have any past bookings."}
                {activeTab === 'cancelled' && "You don't have any cancelled bookings."}
              </p>
              {activeTab === 'upcoming' && (
                <button className="btn btn--primary" onClick={handleNewBooking}>
                  Book Your First Table
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {bookings.length > 0 && (
          <div className="booking-stats">
            <div className="stats-card">
              <h4>📊 Your Booking Stats</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{bookings.length}</span>
                  <span className="stat-label">Total Bookings</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{getTabCount('upcoming')}</span>
                  <span className="stat-label">Upcoming</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{getTabCount('cancelled')}</span>
                  <span className="stat-label">Cancelled</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {Math.round(((bookings.length - getTabCount('cancelled')) / bookings.length) * 100)}%
                  </span>
                  <span className="stat-label">Success Rate</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
