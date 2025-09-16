from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def health_check(request):
    return HttpResponse("OK", status=200)

def root_view(request):
    return HttpResponse("<h1>Welcome to Logtrack!</h1>", status=200)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    path('', root_view, name='root-view'),
    path('api/', include('backend.trips.urls')),
]
