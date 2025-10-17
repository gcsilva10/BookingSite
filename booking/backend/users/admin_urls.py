from django.urls import path
from . import views

urlpatterns = [
    # User management (admin only)
    path("users/", views.list_users, name="admin_list_users"),
    path("users/create/", views.create_user, name="admin_create_user"),
    path("users/<int:user_id>/", views.delete_user, name="admin_delete_user"),
]
