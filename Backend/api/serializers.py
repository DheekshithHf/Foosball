from rest_framework import serializers
from .models import (Employee, Booking, NotificationSettings, Tournament, 
                    Match, PlayerRequest, PlayerRequestNotification)
from datetime import datetime, time


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'


class BookingSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    cancelled_by_name = serializers.CharField(source='cancelled_by.name', read_only=True)
    
    class Meta:
        model = Booking
        fields = ['id', 'employee', 'employee_name', 'date', 'start_time', 'end_time', 'status', 
                 'created_at', 'updated_at', 'cancelled_at', 'cancelled_by', 'cancelled_by_name',
                 'checked_in_at', 'checked_out_at']


class BookingCreateSerializer(serializers.ModelSerializer):
    employee_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = Booking
        fields = ['id', 'employee_id', 'date', 'start_time', 'end_time', 'status']
    
    def create(self, validated_data):
        employee_id = validated_data.pop('employee_id')
        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            raise serializers.ValidationError({'employee_id': 'Employee not found'})
        
        validated_data['employee'] = employee
        return super().create(validated_data)


class NotificationSettingsSerializer(serializers.ModelSerializer):
    employee_id = serializers.CharField(source='employee.id', read_only=True)
    
    class Meta:
        model = NotificationSettings
        fields = ['employee_id', 'email_reminders', 'reminder_before']


class TournamentSerializer(serializers.ModelSerializer):
    host_name = serializers.CharField(source='host.name', read_only=True)
    current_participants = serializers.ReadOnlyField()
    participants_details = EmployeeSerializer(source='participants', many=True, read_only=True)
    
    class Meta:
        model = Tournament
        fields = '__all__'


class TournamentCreateSerializer(serializers.ModelSerializer):
    host_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = Tournament
        fields = ['id', 'name', 'description', 'host_id', 'start_date', 'end_date', 
                 'registration_deadline', 'max_participants', 'format', 'status']
    
    def create(self, validated_data):
        host_id = validated_data.pop('host_id')
        try:
            host = Employee.objects.get(id=host_id)
        except Employee.DoesNotExist:
            raise serializers.ValidationError({'host_id': 'Host employee not found'})
        
        validated_data['host'] = host
        return super().create(validated_data)


class MatchSerializer(serializers.ModelSerializer):
    tournament_name = serializers.CharField(source='tournament.name', read_only=True)
    team1_players_details = EmployeeSerializer(source='team1_players', many=True, read_only=True)
    team2_players_details = EmployeeSerializer(source='team2_players', many=True, read_only=True)
    
    class Meta:
        model = Match
        fields = '__all__'


class PlayerRequestSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    current_players_details = EmployeeSerializer(source='current_players', many=True, read_only=True)
    current_players_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PlayerRequest
        fields = '__all__'
    
    def get_current_players_count(self, obj):
        return obj.current_players.count()


class PlayerRequestCreateSerializer(serializers.ModelSerializer):
    created_by_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = PlayerRequest
        fields = ['id', 'created_by_id', 'date', 'start_time', 'end_time', 'skill_level', 
                 'max_players', 'message', 'expires_at']
    
    def create(self, validated_data):
        created_by_id = validated_data.pop('created_by_id')
        try:
            created_by = Employee.objects.get(id=created_by_id)
        except Employee.DoesNotExist:
            raise serializers.ValidationError({'created_by_id': 'Employee not found'})
        
        validated_data['created_by'] = created_by
        player_request = super().create(validated_data)
        
        # Add creator to current_players
        player_request.current_players.add(created_by)
        
        # Send notifications to all other active employees
        self._send_notifications(player_request)
        
        return player_request
    
    def _send_notifications(self, player_request):
        """Send notifications to all active employees except the creator"""
        from .models import PlayerRequestNotification
        
        employees = Employee.objects.filter(is_active=True).exclude(id=player_request.created_by.id)
        notifications = []
        
        for employee in employees:
            notifications.append(
                PlayerRequestNotification(
                    player_request=player_request,
                    recipient=employee
                )
            )
        
        PlayerRequestNotification.objects.bulk_create(notifications)


class PlayerRequestNotificationSerializer(serializers.ModelSerializer):
    player_request_details = PlayerRequestSerializer(source='player_request', read_only=True)
    recipient_name = serializers.CharField(source='recipient.name', read_only=True)
    
    class Meta:
        model = PlayerRequestNotification
        fields = '__all__'


class TimeSlotSerializer(serializers.Serializer):
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    status = serializers.CharField()
    booking_id = serializers.CharField(required=False, allow_null=True)


class AvailabilitySerializer(serializers.Serializer):
    date = serializers.DateField()
    time_slots = TimeSlotSerializer(many=True)


class TimeSlotSerializer(serializers.Serializer):
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    status = serializers.CharField()
    booking_id = serializers.CharField(required=False, allow_null=True)


class AvailabilitySerializer(serializers.Serializer):
    date = serializers.DateField()
    time_slots = TimeSlotSerializer(many=True)
