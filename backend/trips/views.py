from rest_framework import viewsets
from rest_framework.response import Response
from .models import Trip
from .serializers import TripSerializer
import logging

# Set up a logger for this module
logger = logging.getLogger(__name__)

class TripViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for handling API requests for Trip objects.
    This provides `create`, `retrieve`, `update`, `partial_update`, and `destroy` actions.
    """
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

    def create(self, request, *args, **kwargs):
        """
        Custom create method to handle incoming POST requests and save new trips.
        """
        logger.info(f"Incoming trip data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        logger.info("Successfully created new trip.")
        return Response(serializer.data, status=201)
