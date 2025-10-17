from django.urls import path
from . import views

urlpatterns = [
    path("stats/", views.reservation_stats, name="reservation_stats"),
    path("", views.reservation_list, name="reservation_list"),
    path("<int:pk>/", views.reservation_detail, name="reservation_detail"),
]
