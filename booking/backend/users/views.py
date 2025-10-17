from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()


@api_view(["GET"]) 
@permission_classes([IsAdminUser])
def staff_ping(_request):
    """Staff-only demo endpoint to verify authentication"""
    return Response({"ok": True})


@api_view(["GET"]) 
@permission_classes([IsAuthenticated])
def auth_me(request):
    """Get current authenticated user information"""
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
    """List all users (admin only)"""
    users = User.objects.all().values("id", "username", "email", "is_superuser", "is_staff", "is_active")
    return Response({"results": list(users)})


@api_view(["POST"]) 
@permission_classes([IsAdminUser])
def create_user(request):
    """Create a new user (admin only)"""
    data = request.data or {}
    username = data.get("username")
    password = data.get("password")
    email = data.get("email", "")
    is_staff = bool(data.get("is_staff", True))
    is_superuser = bool(data.get("is_superuser", False))
    
    if not username or not password:
        return Response(
            {"detail": "username and password are required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(username=username).exists():
        return Response(
            {"detail": "username already exists"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = User.objects.create_user(username=username, password=password, email=email)
    user.is_staff = is_staff
    user.is_superuser = is_superuser
    user.save()
    
    return Response(
        {"id": user.id, "username": user.username}, 
        status=status.HTTP_201_CREATED
    )


@api_view(["DELETE"]) 
@permission_classes([IsAdminUser])
def delete_user(_request, user_id: int):
    """Delete a user (admin only)"""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {"detail": "not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
