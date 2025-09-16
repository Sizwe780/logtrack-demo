INSTALLED_APPS = [
    ...
    'corsheaders',
    'rest_framework',
    'backend.trips',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first
    ...
]

CORS_ALLOW_ALL_ORIGINS = False  # ✅ Turn off wildcard if using regex
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = list(default_headers) + [
    'content-type',
    'authorization',
]
