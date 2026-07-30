# MediConnect — Deployment Guide

## Environments

| Environment | Frontend | Backend | Database |
|---|---|---|---|
| **Local Dev** | `npm run dev` (Vite HMR) | `python manage.py runserver` | SQLite |
| **Staging** | Nginx static | Gunicorn + Nginx | PostgreSQL |
| **Production** | Nginx static | Gunicorn + Nginx | PostgreSQL (managed) |

---

## Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. Clone & Configure

```bash
git clone https://github.com/your-username/mediconnect.git
cd mediconnect
```

**Backend `.env`:**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your real values
```

**Frontend `.env`:**
```bash
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your real values
```

### 2. Backend

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# (Optional) Seed demo data
python seed_data.py

# Start API server
python manage.py runserver
# → Running at http://127.0.0.1:8000/
```

### 3. Frontend

```bash
cd frontend

npm install
npm run dev
# → Running at http://localhost:5173/
```

### API & Docs URLs

| URL | Description |
|---|---|
| `http://localhost:8000/api/` | REST API root |
| `http://localhost:8000/api/docs/` | Swagger UI (OpenAPI 3) |
| `http://localhost:8000/api/redoc/` | ReDoc documentation |
| `http://localhost:8000/admin/` | Django Admin |
| `http://localhost:5173/` | React frontend |

---

## Production Deployment (Ubuntu / VPS)

### Prerequisites
- Ubuntu 22.04 LTS server
- Domain name pointed at the server IP
- Python 3.11, Node.js 18, Nginx, Certbot installed

### Step 1 — Clone & Configure

```bash
git clone https://github.com/your-username/mediconnect.git /var/www/mediconnect
cd /var/www/mediconnect

cp backend/.env.example backend/.env
nano backend/.env  # Fill in production values
```

**Critical production `.env` values:**
```env
SECRET_KEY=<generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
DEBUG=False
ALLOWED_HOSTS=mediconnect.yourdomain.com,www.mediconnect.yourdomain.com
```

### Step 2 — Backend (Django + Gunicorn)

```bash
cd /var/www/mediconnect/backend

python -m venv venv
source venv/bin/activate

pip install -r requirements.txt
pip install gunicorn psycopg2-binary  # Add PostgreSQL driver

python manage.py migrate
python manage.py collectstatic --noinput
```

**Create systemd service `/etc/systemd/system/mediconnect.service`:**
```ini
[Unit]
Description=MediConnect Gunicorn Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/mediconnect/backend
EnvironmentFile=/var/www/mediconnect/backend/.env
ExecStart=/var/www/mediconnect/backend/venv/bin/gunicorn \
    --workers 4 \
    --bind unix:/run/mediconnect.sock \
    mediconnect_backend.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable mediconnect
sudo systemctl start mediconnect
```

### Step 3 — Frontend (React Build)

```bash
cd /var/www/mediconnect/frontend

cp .env.example .env
nano .env  # Set VITE_API_URL=https://mediconnect.yourdomain.com/api

npm install
npm run build
# Output: frontend/dist/
```

### Step 4 — Nginx Configuration

Create `/etc/nginx/sites-available/mediconnect`:

```nginx
server {
    listen 80;
    server_name mediconnect.yourdomain.com www.mediconnect.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mediconnect.yourdomain.com www.mediconnect.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/mediconnect.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mediconnect.yourdomain.com/privkey.pem;

    # Serve React frontend
    root /var/www/mediconnect/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # SPA fallback
    }

    # Proxy Django API
    location /api/ {
        proxy_pass http://unix:/run/mediconnect.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy Django Admin & static
    location /admin/ {
        proxy_pass http://unix:/run/mediconnect.sock;
        proxy_set_header Host $host;
    }

    location /static/ {
        alias /var/www/mediconnect/backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/mediconnect/backend/media/;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mediconnect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5 — SSL with Let's Encrypt

```bash
sudo certbot --nginx -d mediconnect.yourdomain.com -d www.mediconnect.yourdomain.com
```

---

## Docker Deployment (Optional)

### `backend/Dockerfile`
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn psycopg2-binary

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:8000", "mediconnect_backend.wsgi:application"]
```

### `frontend/Dockerfile`
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### `docker-compose.yml` (root)
```yaml
version: '3.9'

services:
  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: mediconnect_db
      POSTGRES_USER: mediconnect
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  backend:
    build: ./backend
    env_file: ./backend/.env
    depends_on: [db]
    volumes:
      - media_files:/app/media
    ports:
      - "8000:8000"

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on: [backend]

volumes:
  postgres_data:
  media_files:
```

```bash
docker-compose up -d --build
docker-compose exec backend python manage.py migrate
```

---

## Environment Variables Reference

See [backend/.env.example](../backend/.env.example) and [frontend/.env.example](../frontend/.env.example) for complete reference.

### Critical Production Variables

| Variable | Where | Description |
|---|---|---|
| `SECRET_KEY` | backend | Strong random key — **required**, no default |
| `DEBUG` | backend | Must be `False` in production |
| `ALLOWED_HOSTS` | backend | Comma-separated list of domains |
| `DATABASE_URL` | backend | PostgreSQL connection string |
| `EMAIL_HOST_USER` | backend | SMTP email address |
| `EMAIL_HOST_PASSWORD` | backend | Gmail App Password |
| `RAZORPAY_KEY_ID` | backend + frontend | Payment gateway public key |
| `RAZORPAY_KEY_SECRET` | backend only | Payment gateway secret — **never expose to frontend** |
| `GOOGLE_CLIENT_ID` | backend + frontend | OAuth client ID |
| `VITE_API_URL` | frontend | Backend API base URL |

---

## Post-Deployment Checklist

- [ ] `DEBUG=False` in backend `.env`
- [ ] Strong `SECRET_KEY` generated and set
- [ ] `ALLOWED_HOSTS` limited to your domain(s)
- [ ] PostgreSQL database provisioned and migrated
- [ ] Static files collected (`collectstatic`)
- [ ] SMTP credentials configured and tested
- [ ] HTTPS/SSL certificate installed and valid
- [ ] Razorpay live keys configured (switch from `rzp_test_` to `rzp_live_`)
- [ ] Google OAuth origins updated to include production domain
- [ ] Django Admin accessible and superuser created
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Regular database backups scheduled
