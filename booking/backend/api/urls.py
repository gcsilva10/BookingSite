"""
URL configuration for api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework import status

@api_view(["GET"]) 
@permission_classes([IsAdminUser])
def staff_ping(_request):
    return Response({"ok": True})

User = get_user_model()

@api_view(["GET"]) 
@permission_classes([IsAuthenticated])
def auth_me(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": getattr(user, "email", ""),
        "is_superuser": bool(getattr(user, "is_superuser", False)),
        "is_staff": bool(getattr(user, "is_staff", False)),
        "is_active": bool(getattr(user, "is_active", False)),
    })

@api_view(["GET"]) 
@permission_classes([IsAdminUser])
def list_users(_request):
    users = User.objects.all().values("id", "username", "email", "is_superuser", "is_staff", "is_active")
    return Response({"results": list(users)})

@api_view(["POST"]) 
@permission_classes([IsAdminUser])
def create_user(request):
    data = request.data or {}
    username = data.get("username")
    password = data.get("password")
    email = data.get("email", "")
    is_staff = bool(data.get("is_staff", True))
    is_superuser = bool(data.get("is_superuser", False))
    if not username or not password:
        return Response({"detail": "username and password are required"}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({"detail": "username already exists"}, status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.create_user(username=username, password=password, email=email)
    user.is_staff = is_staff
    user.is_superuser = is_superuser
    user.save()
    return Response({"id": user.id, "username": user.username}, status=status.HTTP_201_CREATED)

@api_view(["DELETE"]) 
@permission_classes([IsAdminUser])
def delete_user(_request, user_id: int):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "not found"}, status=status.HTTP_404_NOT_FOUND)
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

from tables.views import table_list, table_detail
from reservations.views import reservation_list, reservation_detail, reservation_stats

urlpatterns = [
    path("admin/", admin.site.urls),
    # JWT auth endpoints (staff should use these to login)
    path("api/v1/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Staff-only demo endpoint
    path("api/v1/staff/ping/", staff_ping, name="staff_ping"),
    # Auth user info
    path("api/v1/auth/me/", auth_me, name="auth_me"),
    # Superuser-only user admin endpoints
    path("api/v1/admin/users/", list_users, name="list_users"),
    path("api/v1/admin/users/create/", create_user, name="create_user"),
    path("api/v1/admin/users/<int:user_id>/", delete_user, name="delete_user"),
    # Tables endpoints
    path("api/v1/tables/", table_list, name="table_list"),
    path("api/v1/tables/<int:pk>/", table_detail, name="table_detail"),
    # Reservations endpoints
    path("api/v1/reservations/stats/", reservation_stats, name="reservation_stats"),
    path("api/v1/reservations/", reservation_list, name="reservation_list"),
    path("api/v1/reservations/<int:pk>/", reservation_detail, name="reservation_detail"),
]
