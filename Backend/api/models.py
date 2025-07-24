from django.db import models
from django.core.validators import EmailValidator
import uuid

# Create your models here.

class Employee(models.Model):
    ROLE_CHOICES = [
        ('employee', 'Employee'),
        ('admin', 'Admin'),
    ]
    
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    department = models.CharField(max_length=100)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='employee')
    avatar = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.id})"
    
    class Meta:
        ordering = ['name']


class Booking(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    id = models.CharField(max_length=50, primary_key=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='bookings')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='confirmed')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)
    cancelled_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='cancelled_bookings')
    checked_in_at = models.DateTimeField(blank=True, null=True)
    checked_out_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.employee.name} - {self.date} {self.start_time}-{self.end_time}"
    
    class Meta:
        ordering = ['date', 'start_time']
        unique_together = ['date', 'start_time', 'end_time']


class NotificationSettings(models.Model):
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='notification_settings')
    email_reminders = models.BooleanField(default=True)
    reminder_before = models.PositiveIntegerField(default=15)  # minutes before booking
    
    def __str__(self):
        return f"Notification settings for {self.employee.name}"
    
    class Meta:
        verbose_name_plural = "Notification Settings"


class Tournament(models.Model):
    FORMAT_CHOICES = [
        ('single-elimination', 'Single Elimination'),
        ('double-elimination', 'Double Elimination'),
        ('round-robin', 'Round Robin'),
    ]
    
    STATUS_CHOICES = [
        ('registration-open', 'Registration Open'),
        ('registration-closed', 'Registration Closed'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    host = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='hosted_tournaments')
    start_date = models.DateField()
    end_date = models.DateField()
    registration_deadline = models.DateField()
    max_participants = models.PositiveIntegerField()
    format = models.CharField(max_length=20, choices=FORMAT_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='registration-open')
    participants = models.ManyToManyField(Employee, related_name='tournaments', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def current_participants(self):
        return self.participants.count()
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-created_at']


class Match(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.CharField(max_length=50, primary_key=True)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches', null=True, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    table_id = models.CharField(max_length=50, default='table_001')  # Since you have one table
    team1_players = models.ManyToManyField(Employee, related_name='team1_matches')
    team2_players = models.ManyToManyField(Employee, related_name='team2_matches')
    team1_score = models.PositiveIntegerField(default=0)
    team2_score = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='scheduled')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Match {self.id} - {self.date} {self.start_time}"
    
    class Meta:
        ordering = ['date', 'start_time']


class PlayerRequest(models.Model):
    SKILL_LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.CharField(max_length=50, primary_key=True)
    created_by = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='created_requests')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    skill_level = models.CharField(max_length=15, choices=SKILL_LEVEL_CHOICES)
    current_players = models.ManyToManyField(Employee, related_name='joined_requests')
    max_players = models.PositiveIntegerField(default=4)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Player Request {self.id} by {self.created_by.name}"
    
    class Meta:
        ordering = ['-created_at']


class PlayerRequestNotification(models.Model):
    """Track notifications sent for player requests"""
    player_request = models.ForeignKey(PlayerRequest, on_delete=models.CASCADE, related_name='notifications')
    recipient = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='received_notifications')
    is_read = models.BooleanField(default=False)
    responded = models.BooleanField(default=False)  # Whether they joined or declined
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Notification for {self.recipient.name} - {self.player_request.id}"
    
    class Meta:
        unique_together = ['player_request', 'recipient']
        ordering = ['-created_at']
