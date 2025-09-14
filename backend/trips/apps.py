from django.apps import AppConfig

class TripsConfig(AppConfig):
    # The full Python path to the application module.
    # This is crucial for Django to correctly locate the app in a nested project structure.
    name = 'backend.trips' 
    default_auto_field = 'django.db.models.BigAutoField'
