from django.db import models


class Table(models.Model):
    number = models.PositiveIntegerField(unique=True)
    seats = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return f"Table {self.number} ({self.seats} seats)"
