#!/usr/bin/env bash
# Render.com build script for Django backend
set -o errexit

echo "===> Step 1: Installing Python dependencies..."
pip install -r requirements.txt

echo "===> Step 2: Collecting static files..."
python manage.py collectstatic --noinput

echo "===> Step 3: Running database migrations..."
python manage.py migrate

echo "===> Step 4: Seeding database..."
python seed_data.py || echo "[WARN] seed_data.py completed with warnings or already seeded — continuing deploy."

echo "===> Build script finished successfully!"
