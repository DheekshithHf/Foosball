from django.contrib import admin
from .models import (Employee, Booking, NotificationSettings, Tournament, 
                    Match, PlayerRequest, PlayerRequestNotification)

# Register your models here.

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'department', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'department', 'is_active']
    search_fields = ['name', 'email', 'id']
    ordering = ['name']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'employee', 'date', 'start_time', 'end_time', 'status', 'created_at']
    list_filter = ['status', 'date']
    search_fields = ['employee__name', 'employee__id']
    ordering = ['-date', '-start_time']


@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    list_display = ['employee', 'email_reminders', 'reminder_before']
    list_filter = ['email_reminders']
    search_fields = ['employee__name', 'employee__id']


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'host', 'start_date', 'end_date', 'status', 'current_participants', 'max_participants']
    list_filter = ['status', 'format', 'start_date']
    search_fields = ['name', 'host__name']
    filter_horizontal = ['participants']
    ordering = ['-created_at']


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['id', 'tournament', 'date', 'start_time', 'status', 'team1_score', 'team2_score']
    list_filter = ['status', 'date']
    search_fields = ['id', 'tournament__name']
    filter_horizontal = ['team1_players', 'team2_players']
    ordering = ['-date', '-start_time']


@admin.register(PlayerRequest)
class PlayerRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'created_by', 'date', 'start_time', 'skill_level', 'status', 'current_players_count', 'max_players']
    list_filter = ['status', 'skill_level', 'date']
    search_fields = ['created_by__name', 'id']
    filter_horizontal = ['current_players']
    ordering = ['-created_at']
    
    def current_players_count(self, obj):
        return obj.current_players.count()
    current_players_count.short_description = 'Current Players'


@admin.register(PlayerRequestNotification)
class PlayerRequestNotificationAdmin(admin.ModelAdmin):
    list_display = ['player_request', 'recipient', 'is_read', 'responded', 'created_at']
    list_filter = ['is_read', 'responded', 'created_at']
    search_fields = ['recipient__name', 'player_request__id']
    ordering = ['-created_at']
