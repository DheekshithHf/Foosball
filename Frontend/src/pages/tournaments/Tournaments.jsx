import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockUsers } from '../../utils/mockData';
import './Tournaments.scss';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const Tournaments = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [showCreateTournament, setShowCreateTournament] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [newTournament, setNewTournament] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    maxParticipants: 16,
    format: 'single-elimination',
    prizePool: '',
    registrationDeadline: ''
  });

  const currentUserId = 1; // Mock current user

  useEffect(() => {
    // Load mock tournaments
    const mockTournaments = [
      {
        id: 1,
        name: 'HappyFox Championship 2024',
        description: 'Annual company-wide foosball championship with amazing prizes!',
        host: 5,
        startDate: '2024-02-15',
        endDate: '2024-02-20',
        registrationDeadline: '2024-02-10',
        maxParticipants: 32,
        currentParticipants: 24,
        format: 'double-elimination',
        status: 'registration-open',
        prizePool: 'Rs.500 + Trophy',
        participants: [1, 2, 3, 4, 5, 6, 7, 8],
        matches: [],
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        name: 'Friday Fun Tournament',
        description: 'Weekly casual tournament for everyone!',
        host: 1,
        startDate: '2024-01-26',
        endDate: '2024-01-26',
        registrationDeadline: '2024-01-25',
        maxParticipants: 16,
        currentParticipants: 12,
        format: 'single-elimination',
        status: 'registration-open',
        prizePool: 'Bragging Rights',
        participants: [1, 2, 3, 4, 5, 6],
        matches: [],
        createdAt: '2024-01-20T14:00:00Z'
      },
      {
        id: 3,
        name: 'New Year Clash',
        description: 'Started the year with an epic tournament!',
        host: 3,
        startDate: '2024-01-05',
        endDate: '2024-01-05',
        registrationDeadline: '2024-01-03',
        maxParticipants: 8,
        currentParticipants: 8,
        format: 'round-robin',
        status: 'completed',
        prizePool: 'Rs.40',
        participants: [1, 2, 3, 4, 5, 6, 7, 8],
        winner: 1,
        matches: [],
        createdAt: '2023-12-28T09:00:00Z'
      }
    ];
    setTournaments(mockTournaments);
  }, []);

  const handleCreateTournament = () => {
    if (!newTournament.name || !newTournament.startDate || !newTournament.endDate) {
      toast.error('Please fill in all required fields', {
        icon: '⚠️',
      });
      return;
    }

    const tournament = {
      id: Date.now(),
      ...newTournament,
      host: currentUserId,
      currentParticipants: 1,
      participants: [currentUserId],
      status: 'registration-open',
      matches: [],
      createdAt: new Date().toISOString()
    };

    setTournaments([tournament, ...tournaments]);
    setShowCreateTournament(false);
    setNewTournament({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      maxParticipants: 16,
      format: 'single-elimination',
      prizePool: '',
      registrationDeadline: ''
    });

    toast.success('🏆 Tournament created successfully!', {
      duration: 5000,
    });

    // Confetti for tournament creation
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ec4001', '#ff6b35', '#ffd700']
    });
  };

  const handleJoinTournament = (tournamentId) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    
    if (!tournament) return;
    
    if (tournament.participants.includes(currentUserId)) {
      toast.error('You are already registered for this tournament', {
        icon: '⚠️',
      });
      return;
    }
    
    if (tournament.currentParticipants >= tournament.maxParticipants) {
      toast.error('Tournament is full', {
        icon: '🚫',
      });
      return;
    }

    setTournaments(prev => prev.map(t => {
      if (t.id === tournamentId) {
        return {
          ...t,
          participants: [...t.participants, currentUserId],
          currentParticipants: t.currentParticipants + 1
        };
      }
      return t;
    }));

    toast.success(`Successfully joined "${tournament.name}"!`, {
      icon: '🎉',
      duration: 4000,
    });

    // Mini confetti for tournament join
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleLeaveTournament = (tournamentId) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    
    setTournaments(prev => prev.map(t => {
      if (t.id === tournamentId) {
        return {
          ...t,
          participants: t.participants.filter(id => id !== currentUserId),
          currentParticipants: t.currentParticipants - 1
        };
      }
      return t;
    }));

    toast.success(`Left "${tournament.name}"`, {
      icon: '👋',
      duration: 3000,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'registration-open': return { class: 'success', text: 'Open for Registration' };
      case 'registration-closed': return { class: 'warning', text: 'Registration Closed' };
      case 'in-progress': return { class: 'info', text: 'In Progress' };
      case 'completed': return { class: 'secondary', text: 'Completed' };
      case 'cancelled': return { class: 'danger', text: 'Cancelled' };
      default: return { class: 'secondary', text: status };
    }
  };

  const getFormatDisplay = (format) => {
    switch (format) {
      case 'single-elimination': return 'Single Elimination';
      case 'double-elimination': return 'Double Elimination';
      case 'round-robin': return 'Round Robin';
      default: return format;
    }
  };

  const filteredTournaments = tournaments.filter(tournament => {
    switch (activeTab) {
      case 'active':
        return ['registration-open', 'registration-closed', 'in-progress'].includes(tournament.status);
      case 'my-tournaments':
        return tournament.participants.includes(currentUserId);
      case 'completed':
        return tournament.status === 'completed';
      default:
        return true;
    }
  });

  const isUserJoined = (tournament) => tournament.participants.includes(currentUserId);
  const canJoin = (tournament) => 
    tournament.status === 'registration-open' && 
    tournament.currentParticipants < tournament.maxParticipants &&
    !isUserJoined(tournament);

  return (
    <div className="tournaments">
      <div className="background-pattern"></div>
      <div className="container">
        <div className="tournaments__header">
          <div className="header-content">
            <h1>🏆 Tournaments</h1>
            <p>Compete in exciting foosball tournaments and win amazing prizes!</p>
          </div>
          <button 
            className="btn btn--primary"
            onClick={() => setShowCreateTournament(true)}
          >
            🎯 Host Tournament
          </button>
        </div>

        {/* Tournament Tabs */}
        <div className="tournaments-tabs">
          <button
            className={`tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Tournaments ({tournaments.filter(t => ['registration-open', 'registration-closed', 'in-progress'].includes(t.status)).length})
          </button>
          <button
            className={`tab ${activeTab === 'my-tournaments' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-tournaments')}
          >
            My Tournaments ({tournaments.filter(t => t.participants.includes(currentUserId)).length})
          </button>
          <button
            className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed ({tournaments.filter(t => t.status === 'completed').length})
          </button>
        </div>

        {/* Tournaments List */}
        <div className="tournaments-content">
          {filteredTournaments.length > 0 ? (
            <div className="tournaments-grid">
              {filteredTournaments.map(tournament => {
                const host = mockUsers.find(u => u.id === tournament.host);
                const winner = tournament.winner ? mockUsers.find(u => u.id === tournament.winner) : null;
                const statusBadge = getStatusBadge(tournament.status);
                const joined = isUserJoined(tournament);

                return (
                  <div key={tournament.id} className={`tournament-card ${joined ? 'joined' : ''}`}>
                    <div className="tournament-header">
                      <div className="tournament-title">
                        <h3>{tournament.name}</h3>
                        <span className={`status-badge status-badge--${statusBadge.class}`}>
                          {statusBadge.text}
                        </span>
                      </div>
                      <div className="tournament-format">
                        {getFormatDisplay(tournament.format)}
                      </div>
                    </div>

                    <div className="tournament-content">
                      <p className="tournament-description">{tournament.description}</p>

                      <div className="tournament-details">
                        <div className="detail-item">
                          <strong>Host:</strong> {host?.name}
                        </div>
                        <div className="detail-item">
                          <strong>Date:</strong> {new Date(tournament.startDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                          {tournament.startDate !== tournament.endDate && (
                            <> - {new Date(tournament.endDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}</>
                          )}
                        </div>
                        <div className="detail-item">
                          <strong>Participants:</strong> {tournament.currentParticipants}/{tournament.maxParticipants}
                        </div>
                        <div className="detail-item">
                          <strong>Prize Pool:</strong> {tournament.prizePool}
                        </div>
                        {tournament.registrationDeadline && tournament.status === 'registration-open' && (
                          <div className="detail-item">
                            <strong>Registration Deadline:</strong> {new Date(tournament.registrationDeadline).toLocaleDateString()}
                          </div>
                        )}
                        {winner && (
                          <div className="detail-item winner">
                            <strong>🏆 Winner:</strong> {winner.name}
                          </div>
                        )}
                      </div>

                      <div className="participants-preview">
                        <strong>Participants:</strong>
                        <div className="participants-list">
                          {tournament.participants.slice(0, 6).map(participantId => {
                            const participant = mockUsers.find(u => u.id === participantId);
                            return (
                              <div key={participantId} className="participant-avatar" title={participant?.name}>
                                {participant?.name?.charAt(0)}
                              </div>
                            );
                          })}
                          {tournament.participants.length > 6 && (
                            <div className="participant-avatar more">
                              +{tournament.participants.length - 6}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="tournament-actions">
                        {canJoin(tournament) && (
                          <button 
                            className="btn btn--success"
                            onClick={() => handleJoinTournament(tournament.id)}
                          >
                            🎮 Join Tournament
                          </button>
                        )}
                        {joined && tournament.status === 'registration-open' && tournament.host !== currentUserId && (
                          <button 
                            className="btn btn--secondary"
                            onClick={() => handleLeaveTournament(tournament.id)}
                          >
                            🚪 Leave
                          </button>
                        )}
                        {tournament.status === 'registration-closed' && joined && (
                          <span className="status-text ready">Ready to play!</span>
                        )}
                        {tournament.status === 'in-progress' && joined && (
                          <button className="btn btn--primary">
                            👁️ View Bracket
                          </button>
                        )}
                        {tournament.status === 'completed' && (
                          <button className="btn btn--info">
                            📊 View Results
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="tournament-footer">
                      <span className="created-date">
                        Created {new Date(tournament.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">🏆</div>
              <h3>No tournaments found</h3>
              <p>
                {activeTab === 'active' && "No active tournaments at the moment."}
                {activeTab === 'my-tournaments' && "You haven't joined any tournaments yet."}
                {activeTab === 'completed' && "No completed tournaments to show."}
              </p>
              <button 
                className="btn btn--primary"
                onClick={() => setShowCreateTournament(true)}
              >
                Host Your First Tournament
              </button>
            </div>
          )}
        </div>

        {/* Create Tournament Modal */}
        {showCreateTournament && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal__header">
                <h3>🏆 Host a Tournament</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowCreateTournament(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal__content">
                <div className="form-group">
                  <label>Tournament Name *</label>
                  <input
                    type="text"
                    value={newTournament.name}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Friday Fun Tournament"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newTournament.description}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your tournament..."
                    className="form-control"
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      value={newTournament.startDate}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, startDate: e.target.value }))}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date *</label>
                    <input
                      type="date"
                      value={newTournament.endDate}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, endDate: e.target.value }))}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Max Participants *</label>
                    <select
                      value={newTournament.maxParticipants}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                      className="form-control"
                    >
                      <option value={8}>8 Players</option>
                      <option value={16}>16 Players</option>
                      <option value={32}>32 Players</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Format *</label>
                    <select
                      value={newTournament.format}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, format: e.target.value }))}
                      className="form-control"
                    >
                      <option value="single-elimination">Single Elimination</option>
                      <option value="double-elimination">Double Elimination</option>
                      <option value="round-robin">Round Robin</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Prize Pool</label>
                    <input
                      type="text"
                      value={newTournament.prizePool}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, prizePool: e.target.value }))}
                      placeholder="e.g., $100 + Trophy"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Registration Deadline</label>
                  <input
                    type="date"
                    value={newTournament.registrationDeadline}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                    className="form-control"
                  />
                </div>

                <div className="modal__actions">
                  <button 
                    className="btn btn--secondary"
                    onClick={() => setShowCreateTournament(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn--primary"
                    onClick={handleCreateTournament}
                    disabled={!newTournament.name || !newTournament.startDate || !newTournament.endDate}
                  >
                    Create Tournament
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

export default Tournaments;
