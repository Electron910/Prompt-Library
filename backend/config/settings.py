import os
import urllib.parse
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("SECRET_KEY", "django-insecure-dev-key-change-in-production")

DEBUG = os.environ.get("DEBUG", "False") == "True"

ALLOWED_HOSTS_STRING = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1")
ALLOWED_HOSTS = [h.strip() for h in ALLOWED_HOSTS_STRING.split(",") if h.strip()]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "prompts",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "prompts.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL:
    parsed = urllib.parse.urlparse(DATABASE_URL)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": parsed.path[1:],
            "USER": parsed.username,
            "PASSWORD": parsed.password,
            "HOST": parsed.hostname,
            "PORT": parsed.port or 5432,
            "OPTIONS": {
                "sslmode": "require",
            },
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ.get("DB_NAME", "promptlib"),
            "USER": os.environ.get("DB_USER", "postgres"),
            "PASSWORD": os.environ.get("DB_PASSWORD", "postgres"),
            "HOST": os.environ.get("DB_HOST", "db"),
            "PORT": os.environ.get("DB_PORT", "5432"),
        }
    }

REDIS_URL = os.environ.get("REDIS_URL", None)
REDIS_HOST = os.environ.get("REDIS_HOST", "redis")
REDIS_PORT = int(os.environ.get("REDIS_PORT", 6379))
REDIS_DB = int(os.environ.get("REDIS_DB", 0))

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

SESSION_ENGINE = "django.contrib.sessions.backends.db"
SESSION_COOKIE_AGE = 86400
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "None"
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_NAME = "promptlib_sessionid"

CSRF_COOKIE_SAMESITE = "None"
CSRF_COOKIE_SECURE = True

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:4200")

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:4200",
    "https://localhost:4200",
    FRONTEND_URL,
]