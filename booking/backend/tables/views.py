from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Table
from .serializers import TableSerializer
from reservations.models import Reservation

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def table_list(request):
    if request.method == 'GET':
        # Check if we're looking for available tables at a specific time
        datetime_str = request.query_params.get('datetime')
        
        if datetime_str:
            try:
                # Parse the datetime from the query parameter
                target_datetime = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
                
                # Define a time window for the reservation (2 hours)
                reservation_window_end = target_datetime + timedelta(hours=2)
                
                # Get all tables that are active
                available_tables = Table.objects.filter(is_active=True)
                
                # Get all reservations that overlap with the requested time window
                # A reservation overlaps if it starts before the end of our window
                # and ends after the start of our window
                conflicting_reservations = Reservation.objects.filter(
                    start_datetime__lt=reservation_window_end,
                    start_datetime__gte=target_datetime - timedelta(hours=2),
                    status__in=[Reservation.STATUS_PENDING, Reservation.STATUS_CONFIRMED]
                )
                
                # Get the IDs of tables that are already reserved during the time window
                reserved_table_ids = set()
                for reservation in conflicting_reservations:
                    reserved_table_ids.update(reservation.tables.values_list('id', flat=True))
                
                # Filter out the reserved tables
                if reserved_table_ids:
                    available_tables = available_tables.exclude(id__in=reserved_table_ids)
                
                serializer = TableSerializer(available_tables, many=True)
                return Response(serializer.data)
            except ValueError:
                return Response({"detail": "Invalid datetime format"}, status=status.HTTP_400_BAD_REQUEST)
        
        # If no datetime provided or request from staff, return all tables
        if not request.user.is_authenticated:
            tables = Table.objects.filter(is_active=True)
        else:
            # Staff users can see all tables
            tables = Table.objects.all()
            
        serializer = TableSerializer(tables, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Only authenticated users can create tables
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            
        serializer = TableSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def table_detail(request, pk):
    try:
        table = Table.objects.get(pk=pk)
    except Table.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = TableSerializer(table)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = TableSerializer(table, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        table.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
