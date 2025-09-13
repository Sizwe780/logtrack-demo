from django.db import models
from datetime import date

class Trip(models.Model):
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    departure_time = models.DateTimeField()
    date = models.DateField(default=date.today)  # ✅ Add default
    driver_name = models.CharField(max_length=100)
    current_location = models.CharField(max_length=100, blank=True, null=True)
    cycle_used = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.driver_name}: {self.origin} → {self.destination}"