from django.urls import path
from django.http import HttpResponse
import logging

# Set up a logger for your application
logger = logging.getLogger(__name__)

# A simple view for a health check.
def health_check(request):
    logger.info("Health check request received. Returning 200 OK.")
    return HttpResponse("OK", status=200)

urlpatterns = [
    # Add a new URL pattern for the health check.
    path('health/', health_check, name='health_check'),
    # You can add other URL patterns for your API here.
    # For example: path('api/', include('your_app_name.urls')),
]
