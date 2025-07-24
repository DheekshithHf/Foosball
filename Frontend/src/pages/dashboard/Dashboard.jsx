import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../../components/common/StatsCard';
import BookingCard from '../../components/common/BookingCard';
import FoosballTableStatus from '../../components/common/FoosballTableStatus';
import { mockBookings, mockTables, mockUsers, mockPlayerStats, mockMatches, timeSlots } from '../../utils/mockData';
import './Dashboard.scss';

const Dashboard = () => {
  const navigate = useNavigate();
  const [todayBookings, setTodayBookings] = useState([]);
  const [myUpcomingBookings, setMyUpcomingBookings] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);

  const currentUserId = 1; // Mock current user
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Filter today's bookings
    const todayBookingsData = mockBookings.filter(booking => booking.date === today);
    setTodayBookings(todayBookingsData);

    // Filter user's upcoming bookings (including today and future)
    const now = new Date();
    const userBookings = mockBookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      const isParticipant = booking.participants.includes(currentUserId);
      const isFuture = bookingDate >= new Date(today); // Include today and future
      
      return isParticipant && isFuture;
    }).sort((a, b) => {
      // Sort by date, then by time
      if (a.date !== b.date) {
        return new Date(a.date) - new Date(b.date);
      }
      return a.startTime.localeCompare(b.startTime);
    });
    
    setMyUpcomingBookings(userBookings.slice(0, 3));

    // Get recent matches
    setRecentMatches(mockMatches.slice(0, 3));
  }, [mockBookings]); // Add dependency to update when bookings change

  const availableTables = mockTables.filter(table => table.status === 'available').length;
  const totalBookingsToday = todayBookings.length;
  const upcomingBookingsCount = myUpcomingBookings.length;

  // Calculate popular time slots
  const popularSlots = timeSlots.slice(10, 14); // Mock popular afternoon slots

  const topPlayers = mockPlayerStats.slice(0, 5);

  const quickBook = (timeSlot) => {
    navigate('/book', { state: { selectedTime: timeSlot } });
  };

  return (
    <div className="dashboard">
      <div className="background-pattern"></div>
      <div className="container">
        <div className="dashboard__header">
          <h1>Foosball Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard__stats">
          <StatsCard
            title="Bookings Today"
            value={totalBookingsToday}
            icon="📅"
            color="primary"
            trend={{ type: 'up', value: '+2' }}
          />
          <StatsCard
            title="Available Tables"
            value={`${availableTables}/${mockTables.length}`}
            icon="🏓"
            color="success"
          />
          <StatsCard
            title="My Upcoming"
            value={upcomingBookingsCount}
            icon="👤"
            color="info"
          />
          <StatsCard
            title="Players Online"
            value="12"
            icon="👥"
            color="warning"
            subtitle="Ready to play"
          />
        </div>

        {/* Foosball Table Status */}
        <FoosballTableStatus />

        <div className="dashboard__content">
          {/* Quick Booking Section */}
          <div className="dashboard__section">
            <div className="section-card">
              <div className="section-header">
                <h3>🚀 Quick Book</h3>
                <p>Popular time slots for today</p>
              </div>
              <div className="quick-book-slots">
                {popularSlots.map(slot => (
                  <button
                    key={slot}
                    className="quick-book-slot"
                    onClick={() => quickBook(slot)}
                  >
                    {new Date(`2000-01-01T${slot}`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </button>
                ))}
              </div>
              <button 
                className="btn btn--primary btn--full"
                onClick={() => navigate('/book')}
              >
                Full Booking Calendar
              </button>
            </div>
          </div>

          {/* My Upcoming Bookings */}
          <div className="dashboard__section">
            <div className="section-card">
              <div className="section-header">
                <h3>📋 My Upcoming Bookings</h3>
                <button 
                  className="btn btn--link"
                  onClick={() => navigate('/my-bookings')}
                >
                  View All
                </button>
              </div>
              {myUpcomingBookings.length > 0 ? (
                <div className="bookings-list">
                  {myUpcomingBookings.map(booking => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking} 
                      showActions={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No upcoming bookings</p>
                  <button 
                    className="btn btn--primary"
                    onClick={() => navigate('/book')}
                  >
                    Book a Table
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard Widget */}
          <div className="dashboard__section">
            <div className="section-card">
              <div className="section-header">
                <h3>🏆 Leaderboard</h3>
                <button 
                  className="btn btn--link"
                  onClick={() => navigate('/leaderboard')}
                >
                  View Full
                </button>
              </div>
              <div className="leaderboard-widget">
                {topPlayers.map((player, index) => {
                  const user = mockUsers.find(u => u.id === player.playerId);
                  return (
                    <div key={player.playerId} className="leaderboard-item">
                      <div className="rank">#{index + 1}</div>
                      <div className="player-info">
                        <span className="name">{user?.name}</span>
                        <span className="stats">{player.wins}W • {player.winRate}%</span>
                      </div>
                      <div className="points">{player.points}pts</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard__section">
            <div className="section-card">
              <div className="section-header">
                <h3>⚡ Recent Activity</h3>
              </div>
              <div className="activity-feed">
                <div className="activity-item">
                  <div className="activity-icon">🏓</div>
                  <div className="activity-content">
                    <p><strong>John Smith</strong> won against <strong>Mike Chen</strong></p>
                    <span className="activity-time">2 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">📅</div>
                  <div className="activity-content">
                    <p><strong>Sarah Johnson</strong> booked Table 2 for 3:00 PM</p>
                    <span className="activity-time">4 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">🏆</div>
                  <div className="activity-content">
                    <p><strong>Weekly Tournament</strong> starts tomorrow</p>
                    <span className="activity-time">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="dashboard__section">
            <div className="section-card">
              <div className="section-header">
                <h3>📊 Today's Schedule</h3>
              </div>
              {todayBookings.length > 0 ? (
                <div className="schedule-overview">
                  {todayBookings.map(booking => {
                    const table = mockTables.find(t => t.id === booking.tableId);
                    return (
                      <div key={booking.id} className="schedule-item">
                        <div className="schedule-time">
                          {new Date(`2000-01-01T${booking.startTime}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                        <div className="schedule-details">
                          <strong>{table?.name}</strong>
                          <span>{booking.participants.length} players</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No bookings scheduled for today</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
