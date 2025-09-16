# Django Project: urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
import logging

logger = logging.getLogger(__name__)

def health_check(request):
    logger.info("Health check request received. Returning 200 OK.")
    return HttpResponse("OK", status=200)

def root_view(request):
    return HttpResponse("<h1>Welcome to Logtrack!</h1>", status=200)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    path('', root_view, name='root-view'),
    # This line includes the URL patterns from your trips app.
    path('api/', include('backend.core.trips.urls')),
]
