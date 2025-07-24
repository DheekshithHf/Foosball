import React, { useState, useEffect } from 'react';
import { mockUsers, mockPlayerStats, mockMatches } from '../../utils/mockData';
import './Leaderboard.scss';

const Leaderboard = () => {
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [personalStats, setPersonalStats] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);

  const currentUserId = 1; // Mock current user

  useEffect(() => {
    // Combine player stats with user data
    const combinedData = mockPlayerStats.map(stats => {
      const user = mockUsers.find(u => u.id === stats.playerId);
      return {
        ...stats,
        ...user,
        rank: stats.rank
      };
    }).sort((a, b) => a.rank - b.rank);

    setLeaderboardData(combinedData);

    // Set personal stats for current user
    const userStats = combinedData.find(player => player.id === currentUserId);
    setPersonalStats(userStats);

    // Set recent matches
    setRecentMatches(mockMatches.slice(0, 5));
  }, [filterPeriod]);

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return 'regular';
  };

  const getMatchResult = (match, playerId) => {
    const isInTeam1 = match.team1.includes(playerId);
    const isInTeam2 = match.team2.includes(playerId);
    
    if (!isInTeam1 && !isInTeam2) return 'not-played';
    
    const team1Score = match.score[0];
    const team2Score = match.score[1];
    
    if (team1Score > team2Score) {
      return isInTeam1 ? 'won' : 'lost';
    } else {
      return isInTeam2 ? 'won' : 'lost';
    }
  };

  return (
    <div className="leaderboard">
      <div className="background-pattern"></div>
      <div className="container">
        <div className="leaderboard__header">
          <h1>🏆 Leaderboard</h1>
          <p>See how you stack up against your colleagues</p>
        </div>

        {/* Filter Controls */}
        <div className="leaderboard__filters">
          <div className="filter-group">
            <label>Time Period:</label>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
            </select>
          </div>
        </div>

        <div className="leaderboard__content">
          {/* Top 3 Podium */}
          <div className="podium-section">
            <h2>🥇 Top Performers</h2>
            <div className="podium">
              {leaderboardData.slice(0, 3).map((player, index) => (
                <div key={player.id} className={`podium-player podium-player--${getRankClass(player.rank)}`}>
                  <div className="podium-rank">{getRankBadge(player.rank)}</div>
                  <div className="podium-avatar">
                    <div className="avatar-circle">
                      {player.name?.charAt(0)}
                    </div>
                  </div>
                  <div className="podium-info">
                    <h3>{player.name}</h3>
                    <p>{player.department}</p>
                    <div className="podium-stats">
                      <span className="stat">{player.wins}W</span>
                      <span className="stat">{player.winRate}%</span>
                      <span className="stat">{player.points}pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full Rankings Table */}
          <div className="rankings-section">
            <h2>📊 Full Rankings</h2>
            <div className="rankings-table-container">
              <table className="rankings-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Department</th>
                    <th>Games</th>
                    <th>Wins</th>
                    <th>Losses</th>
                    <th>Win Rate</th>
                    <th>Points</th>
                    <th>Achievements</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((player) => (
                    <tr 
                      key={player.id} 
                      className={`rankings-row ${player.id === currentUserId ? 'current-user' : ''} rank-${getRankClass(player.rank)}`}
                    >
                      <td className="rank-cell">
                        <span className="rank-badge">{getRankBadge(player.rank)}</span>
                      </td>
                      <td className="player-cell">
                        <div className="player-info">
                          <div className="player-avatar">
                            {player.name?.charAt(0)}
                          </div>
                          <div className="player-details">
                            <span className="player-name">{player.name}</span>
                            {player.id === currentUserId && <span className="you-badge">You</span>}
                          </div>
                        </div>
                      </td>
                      <td>{player.department}</td>
                      <td>{player.gamesPlayed}</td>
                      <td className="wins-cell">{player.wins}</td>
                      <td className="losses-cell">{player.losses}</td>
                      <td className="winrate-cell">
                        <div className="winrate-bar">
                          <div 
                            className="winrate-fill" 
                            style={{ width: `${player.winRate}%` }}
                          ></div>
                          <span className="winrate-text">{player.winRate}%</span>
                        </div>
                      </td>
                      <td className="points-cell">{player.points}</td>
                      <td className="achievements-cell">
                        <div className="achievements-list">
                          {player.achievements?.slice(0, 2).map((achievement, idx) => (
                            <span key={idx} className="achievement-badge">
                              {achievement}
                            </span>
                          ))}
                          {player.achievements?.length > 2 && (
                            <span className="more-achievements">+{player.achievements.length - 2}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Personal Stats */}
          {personalStats && (
            <div className="personal-stats-section">
              <h2>📈 Your Performance</h2>
              <div className="personal-stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-content">
                    <h3>Your Rank</h3>
                    <p className="stat-value">#{personalStats.rank}</p>
                    <span className="stat-subtitle">out of {leaderboardData.length} players</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-content">
                    <h3>Win Rate</h3>
                    <p className="stat-value">{personalStats.winRate}%</p>
                    <span className="stat-subtitle">{personalStats.wins} wins, {personalStats.losses} losses</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-content">
                    <h3>Total Points</h3>
                    <p className="stat-value">{personalStats.points}</p>
                    <span className="stat-subtitle">Keep playing to earn more!</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🎮</div>
                  <div className="stat-content">
                    <h3>Games Played</h3>
                    <p className="stat-value">{personalStats.gamesPlayed}</p>
                    <span className="stat-subtitle">Total matches completed</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Matches */}
          <div className="recent-matches-section">
            <h2>⚡ Recent Matches</h2>
            <div className="matches-list">
              {recentMatches.map((match) => {
                const team1Players = match.team1.map(id => mockUsers.find(u => u.id === id));
                const team2Players = match.team2.map(id => mockUsers.find(u => u.id === id));
                const result = getMatchResult(match, currentUserId);

                return (
                  <div key={match.id} className={`match-card ${result}`}>
                    <div className="match-date">
                      {new Date(match.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="match-teams">
                      <div className="team team1">
                        <div className="team-players">
                          {team1Players.map(player => (
                            <span key={player?.id} className="player-name">
                              {player?.name}
                            </span>
                          ))}
                        </div>
                        <div className="team-score">{match.score[0]}</div>
                      </div>
                      <div className="match-vs">VS</div>
                      <div className="team team2">
                        <div className="team-score">{match.score[1]}</div>
                        <div className="team-players">
                          {team2Players.map(player => (
                            <span key={player?.id} className="player-name">
                              {player?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="match-duration">{match.duration}min</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
