#!/bin/sh
set -e

echo "Starting AI Prompt Library Backend..."

if [ -n "$DATABASE_URL" ]; then
    echo "Using DATABASE_URL for connection"
    echo "Waiting for database..."
    sleep 5
else
    echo "Waiting for PostgreSQL..."
    until python -c "
import psycopg2, os, sys
try:
    psycopg2.connect(
        dbname=os.environ.get('DB_NAME','promptlib'),
        user=os.environ.get('DB_USER','postgres'),
        password=os.environ.get('DB_PASSWORD','postgres'),
        host=os.environ.get('DB_HOST','db'),
        port=os.environ.get('DB_PORT','5432')
    )
    sys.exit(0)
except Exception:
    sys.exit(1)
" 2>/dev/null; do
        echo "PostgreSQL not ready, retrying in 2s..."
        sleep 2
    done
    echo "PostgreSQL is ready."
fi

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear 2>/dev/null || true

echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 2 \
    --timeout 60 \
    --access-logfile - \
    --error-logfile -