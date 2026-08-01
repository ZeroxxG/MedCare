#!/usr/bin/env bash
# Render.com build script for Django backend
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate

# Seed database — run with || true so a seed error never blocks the deploy
python seed_data.py || echo "[WARN] seed_data.py failed or already seeded — continuing deploy"
