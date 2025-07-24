import React, { useState, useEffect } from 'react';
import { mockBookings, mockUsers, mockTables } from '../../utils/mockData';
import './AllBookings.scss';

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [tableFilter, setTableFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    // Load all bookings (in real app, this would be an API call with admin permissions)
    setBookings(mockBookings);
  }, []);

  useEffect(() => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => {
        const bookedByUser = mockUsers.find(u => u.id === booking.bookedBy);
        const participants = mockUsers.filter(u => booking.participants.includes(u.id));
        
        return (
          bookedByUser?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bookedByUser?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          booking.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'today':
          filtered = filtered.filter(booking => booking.date === now.toISOString().split('T')[0]);
          break;
        case 'week':
          filterDate.setDate(filterDate.getDate() - 7);
          filtered = filtered.filter(booking => new Date(booking.date) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(filterDate.getMonth() - 1);
          filtered = filtered.filter(booking => new Date(booking.date) >= filterDate);
          break;
      }
    }

    // Table filter
    if (tableFilter !== 'all') {
      filtered = filtered.filter(booking => booking.tableId === parseInt(tableFilter));
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date + 'T' + a.startTime);
          bValue = new Date(b.date + 'T' + b.startTime);
          break;
        case 'table':
          aValue = a.tableId;
          bValue = b.tableId;
          break;
        case 'bookedBy':
          const aUser = mockUsers.find(u => u.id === a.bookedBy);
          const bUser = mockUsers.find(u => u.id === b.bookedBy);
          aValue = aUser?.name || '';
          bValue = bUser?.name || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, dateRange, tableFilter, statusFilter, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(date + 'T' + time);
    return dateObj.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'cancelled': return 'danger';
      case 'completed': return 'info';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const exportBookings = () => {
    // Create CSV data
    const csvData = [
      ['Date', 'Time', 'Table', 'Booked By', 'Participants', 'Status', 'Notes'],
      ...filteredBookings.map(booking => {
        const bookedByUser = mockUsers.find(u => u.id === booking.bookedBy);
        const table = mockTables.find(t => t.id === booking.tableId);
        const participants = mockUsers.filter(u => booking.participants.includes(u.id));
        
        return [
          booking.date,
          `${booking.startTime} - ${booking.endTime}`,
          table?.name || '',
          bookedByUser?.name || '',
          participants.map(p => p.name).join('; '),
          booking.status,
          booking.notes || ''
        ];
      })
    ];

    // Convert to CSV string
    const csvString = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    // Download CSV
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foosball_bookings_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="all-bookings">
      <div className="background-pattern"></div>
      <div className="container">
        <div className="all-bookings__header">
          <div className="header-content">
            <h1>📋 All Bookings</h1>
            <p>Administrative view of all foosball table bookings</p>
          </div>
          <button className="btn btn--success" onClick={exportBookings}>
            📊 Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bookings-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, email, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>

          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Tables</option>
            {mockTables.map(table => (
              <option key={table.id} value={table.id}>{table.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Stats Summary */}
        <div className="bookings-summary">
          <div className="summary-card">
            <span className="summary-number">{filteredBookings.length}</span>
            <span className="summary-label">Total Bookings</span>
          </div>
          <div className="summary-card">
            <span className="summary-number">
              {filteredBookings.filter(b => b.status === 'confirmed').length}
            </span>
            <span className="summary-label">Confirmed</span>
          </div>
          <div className="summary-card">
            <span className="summary-number">
              {filteredBookings.filter(b => b.status === 'cancelled').length}
            </span>
            <span className="summary-label">Cancelled</span>
          </div>
          <div className="summary-card">
            <span className="summary-number">
              {Math.round((filteredBookings.filter(b => b.status !== 'cancelled').length / Math.max(filteredBookings.length, 1)) * 100)}%
            </span>
            <span className="summary-label">Success Rate</span>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bookings-table-section">
          <div className="table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('date')} className="sortable">
                    Date & Time
                    {sortBy === 'date' && (
                      <span className="sort-indicator">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th onClick={() => handleSort('table')} className="sortable">
                    Table
                    {sortBy === 'table' && (
                      <span className="sort-indicator">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th onClick={() => handleSort('bookedBy')} className="sortable">
                    Booked By
                    {sortBy === 'bookedBy' && (
                      <span className="sort-indicator">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th>Participants</th>
                  <th onClick={() => handleSort('status')} className="sortable">
                    Status
                    {sortBy === 'status' && (
                      <span className="sort-indicator">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th>Duration</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const bookedByUser = mockUsers.find(u => u.id === booking.bookedBy);
                  const table = mockTables.find(t => t.id === booking.tableId);
                  const participants = mockUsers.filter(u => booking.participants.includes(u.id));
                  
                  return (
                    <tr key={booking.id} className="booking-row">
                      <td className="datetime-cell">
                        <div className="datetime-info">
                          <span className="date">{new Date(booking.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</span>
                          <span className="time">{booking.startTime} - {booking.endTime}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="table-info">
                          <span className="table-name">{table?.name}</span>
                          <span className="table-location">{table?.location}</span>
                        </div>
                      </td>
                      <td className="user-cell">
                        <div className="user-info">
                          <span className="user-name">{bookedByUser?.name}</span>
                          <span className="user-email">{bookedByUser?.email}</span>
                        </div>
                      </td>
                      <td className="participants-cell">
                        <div className="participants-list">
                          {participants.map((participant, idx) => (
                            <span key={participant.id} className="participant-tag">
                              {participant.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="status-cell">
                        <span className={`status-badge status-badge--${getStatusBadgeClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="duration-cell">
                        {(() => {
                          const start = new Date(`2000-01-01T${booking.startTime}`);
                          const end = new Date(`2000-01-01T${booking.endTime}`);
                          const duration = (end - start) / (1000 * 60); // minutes
                          return `${duration}min`;
                        })()}
                      </td>
                      <td className="notes-cell">
                        <span className="notes-text" title={booking.notes}>
                          {booking.notes || '-'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <button 
                            className="action-btn action-btn--view"
                            title="View Details"
                          >
                            👁️
                          </button>
                          {booking.status === 'confirmed' && (
                            <button 
                              className="action-btn action-btn--cancel"
                              title="Cancel Booking"
                              onClick={() => {
                                if (window.confirm('Cancel this booking?')) {
                                  // Handle cancellation
                                  console.log('Cancel booking', booking.id);
                                }
                              }}
                            >
                              ❌
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">📅</div>
              <h3>No bookings found</h3>
              <p>Try adjusting your filters or search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllBookings;
