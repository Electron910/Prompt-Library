# AI Prompt Library

A full-stack web application for storing and managing AI image generation prompts. Built with Angular, Django, PostgreSQL, and Redis — fully containerized with Docker.

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | https://prompt-library-nu-two.vercel.app |
| Backend API | https://ai-prompt-library-backend.onrender.com |
| Django Admin | https://ai-prompt-library-backend.onrender.com/admin |

> **Note:** Backend is hosted on Render free tier. First request may take 30-60 seconds to wake up after inactivity.


## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 16 |
| Backend | Python 3.11 + Django 4.2 |
| Database | PostgreSQL 15 |
| Cache / Counter | Redis 7 (Upstash on production) |
| Web Server | Nginx |
| Containerization | Docker + Docker Compose |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

## Features

### Core Features
- Browse all AI image generation prompts
- View full prompt detail with live Redis-backed view counter
- Create new prompts with reactive form validation
- Tag system with many-to-many relationships
- Filter prompts by tag
- Session-based authentication
- Protected create endpoint — login required to add prompts
- Complexity rating system (1-10) with color-coded badges

### Technical Features
- Redis `INCR` for atomic view count tracking
- Redis pipeline for batch view count fetching on list page
- Plain Django views returning `JsonResponse` — no DRF
- Custom CORS middleware
- WhiteNoise for static file serving
- Auto superuser creation on first deploy
- Auto sample data seeding on first deploy
- Full Docker Compose setup for local development

---

## Project Structure

```
ai-prompt-library/
│
├── backend/
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── prompts/
│   │   ├── management/
│   │   │   └── commands/
│   │   │       └── seed_data.py
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── auth_urls.py
│   │   ├── auth_views.py
│   │   ├── middleware.py
│   │   ├── models.py
│   │   ├── redis_client.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── add-prompt/
│   │   │   │   ├── login/
│   │   │   │   ├── navbar/
│   │   │   │   ├── not-found/
│   │   │   │   ├── prompt-detail/
│   │   │   │   ├── prompt-list/
│   │   │   │   └── shared/
│   │   │   │       ├── complexity-badge/
│   │   │   │       └── loading-spinner/
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── credentials.interceptor.ts
│   │   │   ├── models/
│   │   │   │   └── prompt.model.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── prompt.service.ts
│   │   │   ├── app-routing.module.ts
│   │   │   ├── app.component.ts
│   │   │   └── app.module.ts
│   │   ├── environments/
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.scss
│   ├── Dockerfile
│   ├── angular.json
│   ├── nginx.conf
│   ├── package.json
│   ├── tsconfig.json
│   └── vercel.json
│
├── docker-compose.yml
├── .env
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/prompts/` | No | List all prompts |
| GET | `/api/prompts/?tag=anime` | No | Filter prompts by tag |
| POST | `/api/prompts/` | Yes | Create a new prompt |
| GET | `/api/prompts/:id/` | No | Get prompt detail + increment view count |
| GET | `/api/tags/` | No | List all tags |
| POST | `/api/tags/` | Yes | Create a new tag |
| POST | `/api/auth/login/` | No | Login with username or email |
| POST | `/api/auth/logout/` | No | Logout |
| GET | `/api/auth/me/` | No | Get current auth state |

### Example Requests

**List all prompts:**
```bash
curl https://prompt-library-9682.onrender.com/api/prompts/
```

**Filter by tag:**
```bash
curl https://prompt-library-9682.onrender.com/api/prompts/?tag=cyberpunk
```

**Get single prompt (increments view count):**
```bash
curl https://prompt-library-9682.onrender.com/api/prompts/1/
```

**Login:**
```bash
curl -X POST https://prompt-library-9682.onrender.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin@12345"}'
```

**Create prompt (requires session cookie):**
```bash
curl -b cookies.txt -X POST https://prompt-library-9682.onrender.com/api/prompts/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Neon Tokyo Street",
    "content": "A bustling neon-lit street in Tokyo at midnight, crowds of people with umbrellas, glowing signs in Japanese, rain reflections on pavement, cinematic composition",
    "complexity": 7,
    "tags": ["cyberpunk", "anime"]
  }'
```

---

## Data Model

### Prompt
| Field | Type | Description |
|-------|------|-------------|
| id | Integer (PK) | Auto-increment primary key |
| title | CharField(255) | Prompt title, min 3 chars |
| content | TextField | Full prompt content, min 20 chars |
| complexity | Integer | Rating from 1 to 10 |
| tags | ManyToManyField | Related tags |
| created_at | DateTimeField | Auto set on creation |

### Tag
| Field | Type | Description |
|-------|------|-------------|
| id | Integer (PK) | Auto-increment primary key |
| name | CharField(50) | Unique tag name |
| created_at | DateTimeField | Auto set on creation |

### Redis Keys
| Key Pattern | Type | Description |
|-------------|------|-------------|
| `prompt:{id}:views` | String | View count per prompt |

---

## Local Development Setup

### Prerequisites

- Docker Desktop installed
- Git installed

### Run with Docker Compose

```bash
# Clone the repository
git clone https://github.com/Electron910/Prompt-Library.git
cd Prompt-Library

# Start all services
docker compose up --build
```

Open http://localhost:4200

### Create Admin User

```bash
docker compose exec backend python manage.py createsuperuser
```

### Seed Sample Data

```bash
docker compose exec backend python manage.py seed_data
```

### Stop the App

```bash
# Stop and keep data
docker compose down

# Stop and delete all data
docker compose down -v
```

---

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | insecure dev key |
| `DEBUG` | Debug mode | `False` |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `localhost,127.0.0.1` |
| `DATABASE_URL` | PostgreSQL connection URL | uses individual DB vars |
| `DB_NAME` | Database name | `promptlib` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_HOST` | Database host | `db` |
| `DB_PORT` | Database port | `5432` |
| `REDIS_URL` | Redis connection URL | uses individual Redis vars |
| `REDIS_HOST` | Redis host | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:4200` |
| `DJANGO_SUPERUSER_USERNAME` | Auto-created admin username | `admin` |
| `DJANGO_SUPERUSER_EMAIL` | Auto-created admin email | `admin@example.com` |
| `DJANGO_SUPERUSER_PASSWORD` | Auto-created admin password | `admin123` |

---

## Deployment

### Services Used

| Service | Provider |
|---------|----------|
| Frontend | Vercel (free) |
| Backend | Render (free) |
| PostgreSQL | Render PostgreSQL (free) |
| Redis | Upstash (free) |

### Deploy Steps

**1. Push to GitHub:**
```bash
git add .
git commit -m "deploy"
git push origin main
```

**2. Backend on Render:**
- New Web Service → connect GitHub repo
- Root Directory: `backend`
- Runtime: Docker
- Add all environment variables

**3. Redis on Upstash:**
- Create free database at https://upstash.com
- Copy `rediss://` URL to Render `REDIS_URL` env var

**4. Frontend on Vercel:**
- Import GitHub repo at https://vercel.com
- Root Directory: `frontend`
- Build Command: `npm run build:prod`
- Output Directory: `dist/ai-prompt-library`
- Install Command: `npm install --legacy-peer-deps`

**5. Update CORS:**
- Set `FRONTEND_URL` on Render to your Vercel URL

---

## Architectural Decisions

### Django Without DRF
Plain Django views with `JsonResponse` were used instead of Django REST Framework. This keeps the backend lightweight with no extra abstraction and satisfies the assignment requirement of using Django directly.

### Redis for View Counts
Redis `INCR` is atomic — meaning even with multiple simultaneous requests, the counter never gets corrupted. Redis is the sole source of truth for view counts. PostgreSQL stores prompt content permanently while Redis stores ephemeral counters. A pipeline is used on the list endpoint to fetch all view counts in a single Redis round trip.

### Session Authentication
Django session-based auth was chosen over JWT for simplicity. Sessions are stored in PostgreSQL. The Angular `CredentialsInterceptor` ensures cookies are sent with every HTTP request. `SESSION_COOKIE_SAMESITE = "None"` with `SESSION_COOKIE_SECURE = True` allows cross-origin cookies between Vercel and Render.

### Nginx Reverse Proxy
The Angular app is compiled to static files and served via Nginx. Nginx also proxies `/api/` requests to the Django backend, completely eliminating CORS issues in production. In local development, Angular dev server proxy handles this.

### Custom CORS Middleware
A custom Django middleware handles CORS headers instead of using `django-cors-headers`. This keeps dependencies minimal and gives full control over allowed origins.

### Tag System
Tags use a ManyToMany relationship between `Prompt` and `Tag` models. Tags are created automatically when a prompt is submitted with new tag names. Filtering is done via Django ORM query `filter(tags__name__iexact=tag)`.

### Auto Seeding on Deploy
The `entrypoint.sh` script automatically creates the superuser and seeds sample data on first deploy using environment variables. This removes the need for shell access on the hosting platform.

---

## Bonus Features Completed

- ✅ **Authentication** — Session-based login/logout, POST endpoint protected
- ✅ **Tagging System** — ManyToMany Tag model, filter by tag API, full UI support
- ✅ **Live Hosting** — Deployed on Vercel + Render

---

## Test Credentials

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `Admin@12345` |
| Admin Panel | `/admin` |

---
