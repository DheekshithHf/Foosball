# Foosball Scheduling Backend

A Django REST API backend for office foosball table scheduling system.

## Features

- Employee management with role-based access (employee/admin)
- Booking system with time slot management
- Real-time availability checking
- Notification settings for reminders
- Tournament management system
- Player request system for finding game partners
- RESTful API endpoints

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create environment file:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Create sample data:
```bash
python manage.py create_sample_data
```

5. Create superuser:
```bash
python manage.py createsuperuser
```

6. Run development server:
```bash
python manage.py runserver
```

## API Endpoints

### Employee Management
- `GET /api/employees/` - List all active employees
- `GET /api/employees/{id}/` - Get employee details

### Booking System
- `GET /api/bookings/` - List bookings (optional: `?date=YYYY-MM-DD`)
- `POST /api/bookings/` - Create new booking
- `GET /api/bookings/{id}/` - Get booking details
- `PUT /api/bookings/{id}/` - Update booking
- `DELETE /api/bookings/{id}/` - Delete booking

### Availability
- `GET /api/availability/?date=YYYY-MM-DD` - Get availability for a date

### Dashboard
- `GET /api/dashboard/stats/` - Get dashboard statistics
- `GET /api/users/{employee_id}/bookings/` - Get user's bookings

### Tournament System
- `GET /api/tournaments/` - List tournaments
- `POST /api/tournaments/` - Create tournament
- `GET /api/tournaments/{id}/` - Get tournament details
- `PUT /api/tournaments/{id}/` - Update tournament
- `DELETE /api/tournaments/{id}/` - Delete tournament

### Match System
- `GET /api/matches/` - List matches
- `POST /api/matches/` - Create match
- `GET /api/matches/{id}/` - Get match details
- `PUT /api/matches/{id}/` - Update match
- `DELETE /api/matches/{id}/` - Delete match

### Player Requests
- `GET /api/player-requests/` - List player requests (optional: `?status=open&date=YYYY-MM-DD`)
- `POST /api/player-requests/` - Create player request
- `GET /api/player-requests/{id}/` - Get player request details
- `PUT /api/player-requests/{id}/` - Update player request
- `DELETE /api/player-requests/{id}/` - Delete player request
- `POST /api/player-requests/{id}/join/` - Join a player request
- `POST /api/player-requests/{id}/leave/` - Leave a player request

### Notifications
- `GET /api/notifications/{employee_id}/` - Get notification settings
- `PUT /api/notifications/{employee_id}/` - Update notification settings
- `GET /api/player-notifications/{employee_id}/` - Get player request notifications
- `POST /api/notifications/{notification_id}/read/` - Mark notification as read

## Frontend Integration

The API uses 30-minute time slots from 9:00 AM to 6:00 PM by default.

### Environment Variables
Create a `.env` file in your frontend project with:
```
VITE_API_URL=http://localhost:8000/api
```

### CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:3000` (React default)
- `http://localhost:5173` (Vite default)

## Data Models

### Booking Request Format
```json
{
  "employee_id": "emp_001",
  "date": "2025-07-24",
  "start_time": "14:00",
  "end_time": "14:30",
  "status": "confirmed"
}
```

### Availability Response Format
```json
{
  "date": "2025-07-24",
  "time_slots": [
    {
      "start_time": "09:00",
      "end_time": "09:30",
      "status": "available"
    },
    {
      "start_time": "09:30",
      "end_time": "10:00",
      "status": "booked",
      "booking_id": "bk_20250724_001"
    }
  ]
}
```
