from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import datetime, time, timedelta
from .models import (Employee, Booking, NotificationSettings, Tournament, 
                    Match, PlayerRequest, PlayerRequestNotification)
from .serializers import (
    EmployeeSerializer, BookingSerializer, BookingCreateSerializer,
    NotificationSettingsSerializer, AvailabilitySerializer,
    TournamentSerializer, TournamentCreateSerializer,
    MatchSerializer, PlayerRequestSerializer, PlayerRequestCreateSerializer,
    PlayerRequestNotificationSerializer
)

# Create your views here.

class EmployeeDetailView(generics.RetrieveAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    lookup_field = 'id'


class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    
    def get_queryset(self):
        queryset = Booking.objects.all()
        date = self.request.query_params.get('date', None)
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                queryset = queryset.filter(date=date_obj)
            except ValueError:
                pass
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookingCreateSerializer
        return BookingSerializer


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    lookup_field = 'id'


class NotificationSettingsDetailView(generics.RetrieveUpdateAPIView):
    queryset = NotificationSettings.objects.all()
    serializer_class = NotificationSettingsSerializer
    lookup_field = 'employee_id'
    
    def get_object(self):
        employee_id = self.kwargs['employee_id']
        employee = get_object_or_404(Employee, id=employee_id)
        notification_settings, created = NotificationSettings.objects.get_or_create(
            employee=employee,
            defaults={'email_reminders': True, 'reminder_before': 15}
        )
        return notification_settings


class TournamentListCreateView(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TournamentCreateSerializer
        return TournamentSerializer


class TournamentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    lookup_field = 'id'


class MatchListCreateView(generics.ListCreateAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer


class MatchDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    lookup_field = 'id'


class PlayerRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = PlayerRequestSerializer
    
    def get_queryset(self):
        queryset = PlayerRequest.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date
        date = self.request.query_params.get('date', None)
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                queryset = queryset.filter(date=date_obj)
            except ValueError:
                pass
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PlayerRequestCreateSerializer
        return PlayerRequestSerializer


class PlayerRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PlayerRequest.objects.all()
    serializer_class = PlayerRequestSerializer
    lookup_field = 'id'


@api_view(['POST'])
def join_player_request(request, request_id):
    """Allow a player to join a player request"""
    try:
        player_request = PlayerRequest.objects.get(id=request_id)
    except PlayerRequest.DoesNotExist:
        return Response({'error': 'Player request not found'}, status=status.HTTP_404_NOT_FOUND)
    
    employee_id = request.data.get('employee_id')
    if not employee_id:
        return Response({'error': 'employee_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        employee = Employee.objects.get(id=employee_id)
    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if request is still open
    if player_request.status != 'open':
        return Response({'error': 'Player request is not open'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if player is already in the request
    if player_request.current_players.filter(id=employee_id).exists():
        return Response({'error': 'Player already joined this request'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if request is full
    if player_request.current_players.count() >= player_request.max_players:
        return Response({'error': 'Player request is full'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Add player to the request
    player_request.current_players.add(employee)
    
    # Mark notification as responded
    try:
        notification = PlayerRequestNotification.objects.get(
            player_request=player_request,
            recipient=employee
        )
        notification.responded = True
        notification.save()
    except PlayerRequestNotification.DoesNotExist:
        pass
    
    # Check if request is now full
    if player_request.current_players.count() >= player_request.max_players:
        player_request.status = 'closed'
        player_request.save()
    
    serializer = PlayerRequestSerializer(player_request)
    return Response(serializer.data)


@api_view(['POST'])
def leave_player_request(request, request_id):
    """Allow a player to leave a player request"""
    try:
        player_request = PlayerRequest.objects.get(id=request_id)
    except PlayerRequest.DoesNotExist:
        return Response({'error': 'Player request not found'}, status=status.HTTP_404_NOT_FOUND)
    
    employee_id = request.data.get('employee_id')
    if not employee_id:
        return Response({'error': 'employee_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        employee = Employee.objects.get(id=employee_id)
    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if player is in the request
    if not player_request.current_players.filter(id=employee_id).exists():
        return Response({'error': 'Player is not in this request'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Don't allow creator to leave unless they cancel the request
    if player_request.created_by.id == employee_id:
        return Response({'error': 'Creator cannot leave. Use cancel instead.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Remove player from the request
    player_request.current_players.remove(employee)
    
    # If request was closed and now has space, reopen it
    if player_request.status == 'closed' and player_request.current_players.count() < player_request.max_players:
        player_request.status = 'open'
        player_request.save()
    
    serializer = PlayerRequestSerializer(player_request)
    return Response(serializer.data)


@api_view(['GET'])
def player_request_notifications(request, employee_id):
    """Get notifications for a specific employee"""
    try:
        employee = Employee.objects.get(id=employee_id)
    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
    
    notifications = PlayerRequestNotification.objects.filter(
        recipient=employee
    ).order_by('-created_at')
    
    # Filter by unread if requested
    if request.query_params.get('unread_only') == 'true':
        notifications = notifications.filter(is_read=False)
    
    serializer = PlayerRequestNotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def mark_notification_read(request, notification_id):
    """Mark a notification as read"""
    try:
        notification = PlayerRequestNotification.objects.get(id=notification_id)
    except PlayerRequestNotification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    
    notification.is_read = True
    notification.save()
    
    return Response({'message': 'Notification marked as read'})


@api_view(['GET'])
def availability_view(request):
    """
    Get availability for a specific date.
    Returns 30-minute time slots from 9:00 AM to 6:00 PM.
    """
    date_str = request.query_params.get('date')
    if not date_str:
        return Response({'error': 'Date parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Generate 30-minute time slots from 9:00 AM to 6:00 PM
    start_time = time(9, 0)  # 9:00 AM
    end_time = time(18, 0)   # 6:00 PM
    slot_duration = timedelta(minutes=30)
    
    time_slots = []
    current_time = datetime.combine(date_obj, start_time)
    end_datetime = datetime.combine(date_obj, end_time)
    
    # Get all bookings for the date
    bookings = Booking.objects.filter(date=date_obj, status='confirmed')
    booking_dict = {}
    for booking in bookings:
        booking_dict[(booking.start_time, booking.end_time)] = booking.id
    
    while current_time < end_datetime:
        slot_start = current_time.time()
        slot_end = (current_time + slot_duration).time()
        
        # Check if this slot is booked
        slot_key = (slot_start, slot_end)
        if slot_key in booking_dict:
            slot_status = 'booked'
            booking_id = booking_dict[slot_key]
        else:
            slot_status = 'available'
            booking_id = None
        
        time_slot = {
            'start_time': slot_start,
            'end_time': slot_end,
            'status': slot_status
        }
        
        if booking_id:
            time_slot['booking_id'] = booking_id
        
        time_slots.append(time_slot)
        current_time += slot_duration
    
    data = {
        'date': date_obj,
        'time_slots': time_slots
    }
    
    serializer = AvailabilitySerializer(data)
    return Response(serializer.data)
