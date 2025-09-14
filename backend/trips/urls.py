from rest_framework import routers
from .views import TripViewSet

# Create a router for the TripViewSet
router = routers.DefaultRouter()
router.register(r'trips', TripViewSet)

# The API URLs are now determined automatically by the router.
# This single line handles:
# /trips/ (GET for list, POST for create)
# /trips/<id>/ (GET for detail, PUT/PATCH for update, DELETE for delete)
urlpatterns = router.urls