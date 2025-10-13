from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Count
from datetime import datetime, timedelta

from .models import Reservation
from .serializers import ReservationSerializer
from tables.models import Table

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def reservation_list(request):
    if request.method == 'GET':
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            
        reservations = Reservation.objects.all()
        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ReservationSerializer(data=request.data)
        if serializer.is_valid():
            reservation = serializer.save()
            
            # Add tables to reservation if tables_ids were provided
            tables_ids = request.data.get('tables_ids', [])
            if tables_ids:
                tables = Table.objects.filter(id__in=tables_ids, is_active=True)
                reservation.tables.set(tables)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def reservation_detail(request, pk):
    try:
        reservation = Reservation.objects.get(pk=pk)
    except Reservation.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ReservationSerializer(reservation)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ReservationSerializer(reservation, data=request.data)
        if serializer.is_valid():
            serializer.save()
            
            # Update tables if tables_ids were provided
            tables_ids = request.data.get('tables_ids')
            if tables_ids is not None:
                tables = Table.objects.filter(id__in=tables_ids, is_active=True)
                reservation.tables.set(tables)
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'PATCH':
        # For status updates only
        status_value = request.data.get('status')
        if status_value and status_value in [Reservation.STATUS_PENDING, Reservation.STATUS_CONFIRMED, Reservation.STATUS_CANCELLED]:
            reservation.status = status_value
            reservation.save()
            serializer = ReservationSerializer(reservation)
            return Response(serializer.data)
        return Response({"detail": "Invalid status value"}, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        reservation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reservation_stats(request):
    # Get the current date in the server's timezone
    today = timezone.now().date()
    
    # Start and end of today
    start_of_day = timezone.make_aware(datetime.combine(today, datetime.min.time()))
    end_of_day = timezone.make_aware(datetime.combine(today, datetime.max.time()))
    
    # Filter reservations for today that are not cancelled
    today_reservations = Reservation.objects.filter(
        start_datetime__range=(start_of_day, end_of_day),
        status__in=[Reservation.STATUS_PENDING, Reservation.STATUS_CONFIRMED]
    )
    
    # Calculate stats
    total_reservations = today_reservations.count()
    total_guests = today_reservations.aggregate(total=Sum('guests'))['total'] or 0
    
    # Calculate reservations by status
    pending_count = today_reservations.filter(status=Reservation.STATUS_PENDING).count()
    confirmed_count = today_reservations.filter(status=Reservation.STATUS_CONFIRMED).count()
    
    # Get reservations for each hour of the day
    hourly_data = []
    for hour in range(10, 24):  # Restaurant hours from 10AM to 11PM
        hour_start = timezone.make_aware(datetime.combine(today, datetime.min.time().replace(hour=hour)))
        hour_end = hour_start + timedelta(hours=1)
        
        hour_reservations = today_reservations.filter(
            start_datetime__range=(hour_start, hour_end)
        )
        
        hourly_count = hour_reservations.count()
        hourly_guests = hour_reservations.aggregate(total=Sum('guests'))['total'] or 0
        
        hourly_data.append({
            'hour': f"{hour}:00",
            'reservations': hourly_count,
            'guests': hourly_guests
        })
    
    return Response({
        'date': today.strftime('%Y-%m-%d'),
        'total_reservations': total_reservations,
        'total_guests': total_guests,
        'pending_reservations': pending_count,
        'confirmed_reservations': confirmed_count,
        'hourly_data': hourly_data
    })
