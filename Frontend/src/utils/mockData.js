export const mockUsers = [
  { id: 1, name: 'John Smith', email: 'john@happyfox.com', department: 'Engineering', role: 'user' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@happyfox.com', department: 'Product', role: 'user' },
  { id: 3, name: 'Mike Chen', email: 'mike@happyfox.com', department: 'Engineering', role: 'user' },
  { id: 4, name: 'Emily Davis', email: 'emily@happyfox.com', department: 'Design', role: 'user' },
  { id: 5, name: 'Alex Wilson', email: 'alex@happyfox.com', department: 'Marketing', role: 'admin' },
  { id: 6, name: 'Lisa Brown', email: 'lisa@happyfox.com', department: 'HR', role: 'user' },
  { id: 7, name: 'David Lee', email: 'david@happyfox.com', department: 'Engineering', role: 'user' },
  { id: 8, name: 'Jessica Taylor', email: 'jessica@happyfox.com', department: 'Sales', role: 'user' }
];

export const mockTables = [
  { id: 1, name: 'Table 1', status: 'available', location: 'Game Room A', maxPlayers: 4 },
  { id: 2, name: 'Table 2', status: 'available', location: 'Game Room A', maxPlayers: 4 },
  { id: 3, name: 'Table 3', status: 'maintenance', location: 'Game Room B', maxPlayers: 4 }
];

export const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

export const mockBookings = [
  {
    id: 1,
    date: '2024-01-15',
    startTime: '10:00',
    endTime: '11:00',
    tableId: 1,
    bookedBy: 1,
    participants: [1, 2, 3, 4],
    status: 'confirmed',
    notes: 'Engineering team match',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 2,
    date: '2024-01-15',
    startTime: '14:00',
    endTime: '15:30',
    tableId: 2,
    bookedBy: 5,
    participants: [5, 6, 7, 8],
    status: 'confirmed',
    notes: 'Weekly tournament',
    createdAt: '2024-01-10T14:00:00Z'
  }
];

export const mockPlayerStats = [
  { playerId: 1, gamesPlayed: 45, wins: 32, losses: 13, winRate: 71.1, points: 1250, rank: 1, achievements: ['Champion', 'Hat Trick'] },
  { playerId: 2, gamesPlayed: 38, wins: 25, losses: 13, winRate: 65.8, points: 1180, rank: 2, achievements: ['Consistent'] },
  { playerId: 3, gamesPlayed: 42, wins: 26, losses: 16, winRate: 61.9, points: 1150, rank: 3, achievements: ['Rookie Star'] },
  { playerId: 4, gamesPlayed: 35, wins: 20, losses: 15, winRate: 57.1, points: 1080, rank: 4, achievements: ['Team Player'] },
  { playerId: 5, gamesPlayed: 40, wins: 22, losses: 18, winRate: 55.0, points: 1050, rank: 5, achievements: ['Persistent'] }
];

export const mockMatches = [
  {
    id: 1,
    date: '2024-01-14',
    tableId: 1,
    team1: [1, 2],
    team2: [3, 4],
    score: [10, 8],
    duration: 60,
    status: 'completed'
  },
  {
    id: 2,
    date: '2024-01-14',
    tableId: 2,
    team1: [5, 6],
    team2: [7, 8],
    score: [10, 6],
    duration: 45,
    status: 'completed'
  }
];

export const mockPlayerRequests = [
  {
    id: 1,
    createdBy: 1,
    date: '2024-01-16',
    timeSlot: '15:00',
    skillLevel: 'intermediate',
    currentPlayers: [1, 2],
    maxPlayers: 4,
    status: 'open',
    message: 'Looking for 2 more players for a fun match!',
    createdAt: '2024-01-15T09:00:00Z',
    expiresAt: '2024-01-16T15:00:00Z'
  }
];
