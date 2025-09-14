"""
WSGI config for backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

# Use the full Python path to the settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.core.settings')

application = get_wsgi_application()
