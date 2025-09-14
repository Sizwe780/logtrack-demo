from django.urls import path
from .views import create_trip

urlpatterns = [
    # The URL for creating a new trip.
    # The path has been corrected to "trips/" to match the frontend request.
    path('trips/', create_trip, name='create_trip'),
]
