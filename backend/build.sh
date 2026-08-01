#!/usr/bin/env bash
# Render.com build script for Django backend
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
python seed_data.py
