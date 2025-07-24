import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockPlayerRequests, mockUsers, timeSlots } from '../../utils/mockData';
import './FindPlayers.scss';

const FindPlayers = () => {
  const navigate = useNavigate();
  const [playerRequests, setPlayerRequests] = useState([]);
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({
    date: new Date().toISOString().split('T')[0],
    timeSlot: '15:00',
    skillLevel: 'intermediate',
    message: '',
    existingPlayers: [1] // Current user is always included
  });

  const currentUserId = 1; // Mock current user

  useEffect(() => {
    // Load player requests
    setPlayerRequests(mockPlayerRequests);
  }, []);

  const handleCreateRequest = () => {
    const request = {
      id: Date.now(),
      createdBy: currentUserId,
      date: newRequest.date,
      timeSlot: newRequest.timeSlot,
      skillLevel: newRequest.skillLevel,
      currentPlayers: [...newRequest.existingPlayers],
      maxPlayers: 4,
      status: 'open',
      message: newRequest.message,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(newRequest.date + 'T' + newRequest.timeSlot).toISOString()
    };

    setPlayerRequests([request, ...playerRequests]);
    setShowCreateRequest(false);
    setNewRequest({
      date: new Date().toISOString().split('T')[0],
      timeSlot: '15:00',
      skillLevel: 'intermediate',
      message: '',
      existingPlayers: [1]
    });
  };

  const handleExistingPlayerToggle = (userId) => {
    if (userId === 1) return; // Can't remove current user
    
    const currentExisting = newRequest.existingPlayers;
    const newExisting = currentExisting.includes(userId) 
      ? currentExisting.filter(id => id !== userId)
      : currentExisting.length < 4 ? [...currentExisting, userId] : currentExisting;

    setNewRequest(prev => ({ ...prev, existingPlayers: newExisting }));
  };

  const handleJoinRequest = (requestId) => {
    setPlayerRequests(prev => prev.map(request => {
      if (request.id === requestId && !request.currentPlayers.includes(currentUserId)) {
        const updatedPlayers = [...request.currentPlayers, currentUserId];
        return {
          ...request,
          currentPlayers: updatedPlayers,
          status: updatedPlayers.length === 4 ? 'filled' : 'open'
        };
      }
      return request;
    }));
  };

  const handleLeaveRequest = (requestId) => {
    setPlayerRequests(prev => prev.map(request => {
      if (request.id === requestId) {
        const updatedPlayers = request.currentPlayers.filter(id => id !== currentUserId);
        return {
          ...request,
          currentPlayers: updatedPlayers,
          status: updatedPlayers.length < 4 ? 'open' : request.status
        };
      }
      return request;
    }));
  };

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

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open': return { class: 'success', text: 'Open' };
      case 'filled': return { class: 'primary', text: 'Full' };
      case 'expired': return { class: 'secondary', text: 'Expired' };
      default: return { class: 'secondary', text: status };
    }
  };

  const getSkillBadge = (skill) => {
    switch (skill) {
      case 'beginner': return { class: 'success', emoji: '🌱' };
      case 'intermediate': return { class: 'warning', emoji: '⚡' };
      case 'advanced': return { class: 'danger', emoji: '🔥' };
      default: return { class: 'secondary', emoji: '❓' };
    }
  };

  return (
    <div className="find-players">
      <div className="background-pattern"></div>
      <div className="container">
        <div className="find-players__header">
          <div className="header-content">
            <h1>👥 Find Players</h1>
            <p>Join existing games or create your own player request</p>
          </div>
          <button 
            className="btn btn--primary"
            onClick={() => setShowCreateRequest(true)}
          >
            ➕ Create Request
          </button>
        </div>

        {/* Active Requests */}
        <div className="requests-section">
          <h2>🎮 Active Player Requests</h2>
          
          {playerRequests.length > 0 ? (
            <div className="requests-grid">
              {playerRequests.map(request => {
                const creator = mockUsers.find(u => u.id === request.createdBy);
                const players = mockUsers.filter(u => request.currentPlayers.includes(u.id));
                const isCreator = request.createdBy === currentUserId;
                const isJoined = request.currentPlayers.includes(currentUserId);
                const canJoin = !isJoined && request.status === 'open' && request.currentPlayers.length < 4;
                const statusBadge = getStatusBadge(request.status);
                const skillBadge = getSkillBadge(request.skillLevel);
                const playersNeeded = 4 - request.currentPlayers.length;

                return (
                  <div key={request.id} className={`request-card ${isJoined ? 'joined' : ''}`}>
                    <div className="request-header">
                      <div className="request-date-time">
                        <h3>{new Date(request.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</h3>
                        <p>{formatTime(request.timeSlot)}</p>
                      </div>
                      <div className="request-badges">
                        <span className={`status-badge status-badge--${statusBadge.class}`}>
                          {statusBadge.text}
                        </span>
                        <span className={`skill-badge skill-badge--${skillBadge.class}`}>
                          {skillBadge.emoji} {request.skillLevel}
                        </span>
                      </div>
                    </div>

                    <div className="request-content">
                      <div className="request-creator">
                        <strong>Created by:</strong> {creator?.name}
                        {isCreator && <span className="creator-badge">You</span>}
                      </div>

                      <div className="request-info">
                        <div className="players-needed">
                          <strong>Looking for {playersNeeded} more player{playersNeeded !== 1 ? 's' : ''}</strong>
                        </div>
                      </div>

                      <div className="request-players">
                        <strong>Current Team ({request.currentPlayers.length}/4):</strong>
                        <div className="players-list">
                          {players.map(player => (
                            <div key={player.id} className="player-item confirmed">
                              <div className="player-avatar">
                                {player.name?.charAt(0)}
                              </div>
                              <span className="player-name">{player.name}</span>
                              {player.id === currentUserId && <span className="you-badge">You</span>}
                              {player.id === request.createdBy && <span className="creator-badge">Creator</span>}
                            </div>
                          ))}
                          {/* Empty slots */}
                          {Array.from({ length: playersNeeded }).map((_, idx) => (
                            <div key={`empty-${idx}`} className="player-item empty">
                              <div className="player-avatar empty">?</div>
                              <span className="player-name">Looking for player...</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {request.message && (
                        <div className="request-message">
                          <strong>Message:</strong> {request.message}
                        </div>
                      )}

                      <div className="request-actions">
                        {canJoin && (
                          <button 
                            className="btn btn--success"
                            onClick={() => handleJoinRequest(request.id)}
                          >
                            🎮 Join Game
                          </button>
                        )}
                        {isJoined && !isCreator && (
                          <button 
                            className="btn btn--secondary"
                            onClick={() => handleLeaveRequest(request.id)}
                          >
                            🚪 Leave
                          </button>
                        )}
                        {request.status === 'filled' && (
                          <button 
                            className="btn btn--primary"
                            onClick={() => navigate('/book', { 
                              state: { 
                                selectedDate: request.date,
                                selectedTime: request.timeSlot,
                                preSelectedPlayers: request.currentPlayers
                              }
                            })}
                          >
                            📅 Book Table
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="request-footer">
                      <span className="request-created">
                        Created {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">🎮</div>
              <h3>No active requests</h3>
              <p>Be the first to create a player request!</p>
              <button 
                className="btn btn--primary"
                onClick={() => setShowCreateRequest(true)}
              >
                Create First Request
              </button>
            </div>
          )}
        </div>

        {/* Create Request Modal */}
        {showCreateRequest && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal__header">
                <h3>Create Player Request</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowCreateRequest(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal__content">
                <div className="form-group">
                  <label>📅 Date</label>
                  <select
                    value={newRequest.date}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, date: e.target.value }))}
                    className="form-control"
                  >
                    {getNext7Days().map(day => (
                      <option key={day.date} value={day.date}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>⏰ Time Slot</label>
                  <select
                    value={newRequest.timeSlot}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, timeSlot: e.target.value }))}
                    className="form-control"
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>
                        {formatTime(slot)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>🎯 Skill Level Preference</label>
                  <select
                    value={newRequest.skillLevel}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, skillLevel: e.target.value }))}
                    className="form-control"
                  >
                    <option value="beginner">🌱 Beginner</option>
                    <option value="intermediate">⚡ Intermediate</option>
                    <option value="advanced">🔥 Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>👥 Existing Team Members ({newRequest.existingPlayers.length}/4)</label>
                  <p className="form-help">Select players who are already confirmed to play with you</p>
                  <div className="existing-players-grid">
                    {mockUsers.map(user => (
                      <button
                        key={user.id}
                        className={`player-card ${newRequest.existingPlayers.includes(user.id) ? 'selected' : ''} ${user.id === 1 ? 'current-user' : ''}`}
                        onClick={() => handleExistingPlayerToggle(user.id)}
                        disabled={user.id === 1}
                        type="button"
                      >
                        <div className="player-name">{user.name}</div>
                        <div className="player-dept">{user.department}</div>
                        {user.id === 1 && <div className="current-user-badge">You</div>}
                      </button>
                    ))}
                  </div>
                  <div className="players-info">
                    Looking for <strong>{4 - newRequest.existingPlayers.length}</strong> more player{4 - newRequest.existingPlayers.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="form-group">
                  <label>💬 Message (Optional)</label>
                  <textarea
                    value={newRequest.message}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Add a message for potential players..."
                    className="form-control"
                    rows={3}
                  />
                </div>

                <div className="modal__actions">
                  <button 
                    className="btn btn--secondary"
                    onClick={() => setShowCreateRequest(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn--primary"
                    onClick={handleCreateRequest}
                    disabled={newRequest.existingPlayers.length >= 4}
                  >
                    Create Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindPlayers;
