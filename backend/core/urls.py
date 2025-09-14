from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
import logging

# Set up a logger for this module
logger = logging.getLogger(__name__)

# A simple view for a health check. This function will be called when
# a request is made to the '/health/' endpoint.
def health_check(request):
    """
    Handles health check requests from Railway.
    """
    logger.info("Health check request received. Returning 200 OK.")
    return HttpResponse("OK", status=200)

# A simple welcome view for the root URL.
def root_view(request):
    """
    Handles requests to the root URL (/).
    """
    return HttpResponse("<h1>Welcome to Logtrack!</h1>", status=200)

urlpatterns = [
    # The URL pattern for your Django admin site
    path('admin/', admin.site.urls),
    
    # This is the URL pattern for your Railway health check
    path('health/', health_check, name='health_check'),

    # This is the URL pattern for your root domain
    path('', root_view, name='root-view'),
    
    # This line includes the URL patterns from your trips app under the 'api/' prefix.
    # The path has been corrected to use the full Python path.
    path('api/', include('backend.trips.urls')),
]
