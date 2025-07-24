from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Employee

from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    """Create a new user account and corresponding employee record"""
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        name = request.data.get('name')
        department = request.data.get('department', '')
        
        if not all([username, email, password, name]):
            return Response({
                'error': 'Username, email, password, and name are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return Response({
                'error': 'Username already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({
                'error': 'Email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create Django user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name
        )
        
        # Create corresponding employee record
        employee_id = f"emp_{user.id:03d}"
        employee = Employee.objects.create(
            id=employee_id,
            name=name,
            email=email,
            department=department,
            role='employee',
            is_active=True
        )
        
        # Log the user in
        login(request, user)
        
        return Response({
            'message': 'Account created successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'employee_id': employee.id,
                'name': employee.name
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Authenticate user and create session"""
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Username and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            if user.is_active:
                login(request, user)
                
                # Get employee record
                try:
                    employee = Employee.objects.get(email=user.email)
                except Employee.DoesNotExist:
                    # Create employee record if it doesn't exist
                    employee_id = f"emp_{user.id:03d}"
                    employee = Employee.objects.create(
                        id=employee_id,
                        name=user.first_name or user.username,
                        email=user.email,
                        department='',
                        role='employee',
                        is_active=True
                    )
                
                return Response({
                    'message': 'Login successful',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'employee_id': employee.id,
                        'name': employee.name,
                        'is_authenticated': True
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Account is disabled'
                }, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({
                'error': 'Invalid username or password'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def logout_view(request):
    """Logout user and destroy session"""
    try:
        logout(request)
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def check_auth_status(request):
    """Check if user is authenticated and return user info"""
    if request.user.is_authenticated:
        try:
            employee = Employee.objects.get(email=request.user.email)
        except Employee.DoesNotExist:
            employee = None
        
        return Response({
            'is_authenticated': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'employee_id': employee.id if employee else None,
                'name': employee.name if employee else request.user.first_name,
            }
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'is_authenticated': False,
            'user': None
        }, status=status.HTTP_200_OK)