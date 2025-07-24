# Foosball Scheduling Backend

A Django REST API backend for office foosball table scheduling system.

## Features

- Employee management with role-based access (employee/admin)
- Booking system with time slot management
- Real-time availability checking
- Notification settings for reminders
- RESTful API endpoints

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run migrations:
```bash
python manage.py migrate
```

3. Create superuser:
```bash
python manage.py createsuperuser
```

4. Run development server:
```bash
python manage.py runserver
```

## API Endpoints

- `GET /api/employees/{id}` - Get employee details
- `GET /api/bookings?date={YYYY-MM-DD}` - Get bookings for a date
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Delete booking
- `GET /api/availability?date={YYYY-MM-DD}` - Get availability for a date
- `GET /api/notifications/{employeeId}` - Get notification settings
- `PUT /api/notifications/{employeeId}` - Update notification settings

The API uses 30-minute time slots from 9:00 AM to 6:00 PM by default.
