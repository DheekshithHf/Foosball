from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, date, time, timedelta
from api.models import Employee, Booking, NotificationSettings, Tournament, Match, PlayerRequest

class Command(BaseCommand):
    help = 'Create sample data for testing'

    def handle(self, *args, **options):
        # Create sample employees
        employees_data = [
            {
                'id': 'emp_001',
                'name': 'John Doe',
                'email': 'john.doe@company.com',
                'department': 'Engineering',
                'role': 'employee',
                'is_active': True
            },
            {
                'id': 'emp_002',
                'name': 'Jane Smith',
                'email': 'jane.smith@company.com',
                'department': 'Design',
                'role': 'employee',
                'is_active': True
            },
            {
                'id': 'emp_003',
                'name': 'Mike Johnson',
                'email': 'mike.johnson@company.com',
                'department': 'Marketing',
                'role': 'admin',
                'is_active': True
            },
            {
                'id': 'emp_004',
                'name': 'Sarah Wilson',
                'email': 'sarah.wilson@company.com',
                'department': 'HR',
                'role': 'employee',
                'is_active': True
            }
        ]

        for emp_data in employees_data:
            employee, created = Employee.objects.get_or_create(
                id=emp_data['id'],
                defaults=emp_data
            )
            if created:
                self.stdout.write(f"Created employee: {employee.name}")
                
                # Create notification settings for each employee
                NotificationSettings.objects.get_or_create(
                    employee=employee,
                    defaults={'email_reminders': True, 'reminder_before': 15}
                )

        # Create sample bookings
        bookings_data = [
            {
                'id': 'bk_20250724_001',
                'employee_id': 'emp_001',
                'date': date(2025, 7, 24),
                'start_time': time(14, 0),
                'end_time': time(14, 30),
                'status': 'confirmed'
            },
            {
                'id': 'bk_20250724_002',
                'employee_id': 'emp_002',
                'date': date(2025, 7, 24),
                'start_time': time(9, 30),
                'end_time': time(10, 0),
                'status': 'confirmed'
            }
        ]

        for booking_data in bookings_data:
            employee_id = booking_data.pop('employee_id')
            employee = Employee.objects.get(id=employee_id)
            booking, created = Booking.objects.get_or_create(
                id=booking_data['id'],
                defaults={**booking_data, 'employee': employee}
            )
            if created:
                self.stdout.write(f"Created booking: {booking.id}")

        # Create sample tournament
        tournament_data = {
            'id': 'tourn_001',
            'name': 'July Foosball Cup',
            'description': 'Office summer tournament',
            'host_id': 'emp_003',
            'start_date': date(2025, 8, 1),
            'end_date': date(2025, 8, 3),
            'registration_deadline': date(2025, 7, 30),
            'max_participants': 16,
            'format': 'single-elimination',
            'status': 'registration-open'
        }

        host = Employee.objects.get(id=tournament_data.pop('host_id'))
        tournament, created = Tournament.objects.get_or_create(
            id=tournament_data['id'],
            defaults={**tournament_data, 'host': host}
        )
        if created:
            self.stdout.write(f"Created tournament: {tournament.name}")
            # Add some participants
            tournament.participants.add(Employee.objects.get(id='emp_001'))
            tournament.participants.add(Employee.objects.get(id='emp_002'))

        # Create sample player request
        player_request_data = {
            'id': 'req_001',
            'created_by_id': 'emp_001',
            'date': date(2025, 7, 25),
            'start_time': time(15, 0),
            'end_time': time(15, 30),
            'skill_level': 'intermediate',
            'max_players': 4,
            'message': 'Looking for two more players!',
            'expires_at': timezone.now() + timedelta(hours=3),
            'status': 'open'
        }

        created_by = Employee.objects.get(id=player_request_data.pop('created_by_id'))
        player_request, created = PlayerRequest.objects.get_or_create(
            id=player_request_data['id'],
            defaults={**player_request_data, 'created_by': created_by}
        )
        if created:
            self.stdout.write(f"Created player request: {player_request.id}")
            # Add creator to current players
            player_request.current_players.add(created_by)

        self.stdout.write(self.style.SUCCESS('Successfully created sample data'))
