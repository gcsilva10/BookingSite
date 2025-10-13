from django.db import models
from tables.models import Table


class Reservation(models.Model):
    STATUS_PENDING = "PENDING"
    STATUS_CONFIRMED = "CONFIRMED"
    STATUS_CANCELLED = "CANCELLED"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_CONFIRMED, "Confirmed"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    customer_name = models.CharField(max_length=120)
    customer_phone = models.CharField(max_length=32)
    start_datetime = models.DateTimeField()
    table = models.ForeignKey(Table, on_delete=models.PROTECT, related_name="reservations")
    guests = models.PositiveIntegerField()
    notes = models.TextField(blank=True, default="")
    status = models.CharField(
        max_length=16,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )

    def __str__(self) -> str:
        return f"{self.customer_name} ({self.guests}) @ {self.start_datetime}"
