from rest_framework import viewsets
from .models import Trip
from .serializers import TripSerializer

class TripViewSet(viewsets.ModelViewSet):
    """
    A viewset for handling CRUD operations on Trip objects.
    This will automatically handle GET (list/retrieve), POST, PUT, and DELETE.
    """
    queryset = Trip.objects.all().order_by('-departure_time')
    serializer_class = TripSerializer

    def create(self, request, *args, **kwargs):
        """
        Overrides the default create method to add a print statement
        for debugging, which will show in your Railway logs.
        """
        print("Incoming trip data:", request.data)
        return super().create(request, *args, **kwargs)
