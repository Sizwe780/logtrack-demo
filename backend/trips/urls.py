from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')

# The API URLs are now determined automatically by the router.
# The `include(router.urls)` line handles all the routing for your API endpoints.
urlpatterns = [
    path('', include(router.urls)),
]