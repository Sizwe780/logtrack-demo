from django.contrib import admin
from django.urls import path
# Import HttpResponse to return a simple response
from django.http import HttpResponse

# A simple view for a health check. This function will be called when
# a request is made to the '/health/' endpoint.
def health_check(request):
    return HttpResponse("OK", status=200)

urlpatterns = [
    path('admin/', admin.site.urls),
    # Add a new URL pattern for the health check.
    # This is a common practice for load balancers and
    # container orchestration systems to verify the service is running.
    path('health/', health_check, name='health_check'),
]
