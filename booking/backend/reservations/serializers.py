from rest_framework import serializers
from .models import Reservation

class ReservationSerializer(serializers.ModelSerializer):
    tables_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        write_only=True,
        source='tables',
        required=False,
        read_only=False,
        queryset=Reservation.tables.rel.model.objects.filter(is_active=True)
    )
    
    class Meta:
        model = Reservation
        fields = ['id', 'customer_name', 'customer_phone', 'start_datetime', 
                 'tables', 'tables_ids', 'guests', 'notes', 'status']
        read_only_fields = ['id', 'status']
        depth = 1  # Include all table details
