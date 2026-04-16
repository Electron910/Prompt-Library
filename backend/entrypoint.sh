#!/bin/sh
set -e

echo "Starting AI Prompt Library Backend..."

if [ -n "$DATABASE_URL" ]; then
    echo "DATABASE_URL found, waiting 5s for DB to be ready..."
    sleep 5
else
    echo "Waiting for local PostgreSQL..."
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
        echo "PostgreSQL not ready, retrying..."
        sleep 2
    done
    echo "PostgreSQL is ready."
fi

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear 2>/dev/null || true

echo "Creating superuser if not exists..."
python manage.py shell -c "
from django.contrib.auth.models import User
import os

username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123')

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f'Superuser created: {username}')
else:
    print(f'Superuser already exists: {username}')
"

echo "Loading sample data if empty..."
python manage.py shell -c "
from prompts.models import Prompt, Tag

if Prompt.objects.count() == 0:
    tags_data = ['cyberpunk', 'fantasy', 'anime', 'sci-fi', 'nature']
    tags = {}
    for name in tags_data:
        tag, _ = Tag.objects.get_or_create(name=name)
        tags[name] = tag

    prompts_data = [
        {
            'title': 'Cyberpunk City at Dusk',
            'content': 'A sprawling neon-lit cyberpunk cityscape at dusk, rain-slicked streets reflecting neon signs in pink and blue, flying cars in the distance, ultra-detailed, cinematic lighting, 8k resolution, blade runner aesthetic',
            'complexity': 8,
            'tags': ['cyberpunk', 'sci-fi'],
        },
        {
            'title': 'Enchanted Forest Portal',
            'content': 'A magical glowing portal in an ancient enchanted forest, giant mushrooms surrounding it, fireflies dancing in the air, soft golden light emanating from the portal, mystical atmosphere, digital art style',
            'complexity': 5,
            'tags': ['fantasy', 'nature'],
        },
        {
            'title': 'Anime Warrior Princess',
            'content': 'A fierce anime warrior princess standing on a mountaintop, long silver hair flowing in the wind, ornate golden armor, katana raised toward stormy sky, dramatic lighting, Studio Ghibli inspired art style',
            'complexity': 6,
            'tags': ['anime', 'fantasy'],
        },
        {
            'title': 'Deep Space Nebula Station',
            'content': 'A futuristic space station orbiting inside a colorful nebula, massive solar panels extending outward, astronauts performing spacewalk, Earth visible in background, photorealistic render, NASA concept art style',
            'complexity': 9,
            'tags': ['sci-fi'],
        },
        {
            'title': 'Serene Mountain Lake',
            'content': 'A perfectly still mountain lake at golden hour, snow-capped peaks reflected in the crystal clear water, lone wooden boat docked at the shore, pine trees lining the banks, mist rising from water surface',
            'complexity': 3,
            'tags': ['nature'],
        },
        {
            'title': 'Steampunk Inventor Portrait',
            'content': 'A detailed portrait of an elderly steampunk inventor in his workshop, brass goggles on forehead, gear-covered coat, surrounded by ticking clocks and strange machines, warm candlelight, oil painting texture',
            'complexity': 7,
            'tags': ['fantasy'],
        },
    ]

    for data in prompts_data:
        p = Prompt.objects.create(
            title=data['title'],
            content=data['content'],
            complexity=data['complexity'],
        )
        for t in data['tags']:
            p.tags.add(tags[t])
        print('Created:', data['title'])

    print('Sample data loaded successfully')
else:
    print('Data already exists, skipping seed')
"

echo "Starting Gunicorn on port ${PORT:-8000}..."
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -