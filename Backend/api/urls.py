from django.urls import path
from .views import (
    EmployeeDetailView,
    EmployeeListView,
    BookingListCreateView,
    BookingDetailView,
    NotificationSettingsDetailView,
    TournamentListCreateView,
    TournamentDetailView,
    MatchListCreateView,
    MatchDetailView,
    PlayerRequestListCreateView,
    PlayerRequestDetailView,
    availability_view,
    join_player_request,
    leave_player_request,
    player_request_notifications,
    mark_notification_read,
    dashboard_stats,
    user_bookings
)

urlpatterns = [
    # Employee endpoints
    path('employees/', EmployeeListView.as_view(), name='employee-list'),
    path('employees/<str:id>/', EmployeeDetailView.as_view(), name='employee-detail'),
    
    # Dashboard endpoints
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('users/<str:employee_id>/bookings/', user_bookings, name='user-bookings'),
    
    # Existing endpoints
    path('bookings/', BookingListCreateView.as_view(), name='booking-list-create'),
    path('bookings/<str:id>/', BookingDetailView.as_view(), name='booking-detail'),
    path('notifications/<str:employee_id>/', NotificationSettingsDetailView.as_view(), name='notification-settings'),
    path('availability/', availability_view, name='availability'),
    
    # New tournament endpoints
    path('tournaments/', TournamentListCreateView.as_view(), name='tournament-list-create'),
    path('tournaments/<str:id>/', TournamentDetailView.as_view(), name='tournament-detail'),
    
    # New match endpoints
    path('matches/', MatchListCreateView.as_view(), name='match-list-create'),
    path('matches/<str:id>/', MatchDetailView.as_view(), name='match-detail'),
    
    # New player request endpoints
    path('player-requests/', PlayerRequestListCreateView.as_view(), name='player-request-list-create'),
    path('player-requests/<str:id>/', PlayerRequestDetailView.as_view(), name='player-request-detail'),
    path('player-requests/<str:request_id>/join/', join_player_request, name='join-player-request'),
    path('player-requests/<str:request_id>/leave/', leave_player_request, name='leave-player-request'),
    
    # Player request notification endpoints
    path('player-notifications/<str:employee_id>/', player_request_notifications, name='player-request-notifications'),
    path('notifications/<int:notification_id>/read/', mark_notification_read, name='mark-notification-read'),
]
