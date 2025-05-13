#!/usr/bin/env bash
set -euo pipefail

# Load environment variables from .env if present
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

DATABASE_NAME=${DATABASE_NAME:?Set DATABASE_NAME or export it first}
POSTGRES_USER=${POSTGRES_ROOT_USER:-postgres}

DOCKER_CONTAINER_NAME="web-profile-cms-strapi_db-1"
LOCAL_DIR="/Users/ianfebi01/Documents/Kuliah/Web/web-profile-cms"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="database_${TIMESTAMP}.sql"

echo "Backing up '${DATABASE_NAME}' as user '${POSTGRES_USER}'…"

docker exec -t "$DOCKER_CONTAINER_NAME" \
  bash -c "pg_dump -U \"$POSTGRES_USER\" -F p \"$DATABASE_NAME\" -f /tmp/$BACKUP_FILENAME"

docker cp "$DOCKER_CONTAINER_NAME:/tmp/$BACKUP_FILENAME" "$LOCAL_DIR/$BACKUP_FILENAME"
docker exec -t "$DOCKER_CONTAINER_NAME" rm "/tmp/$BACKUP_FILENAME"

echo "✅ Backup saved to $LOCAL_DIR/$BACKUP_FILENAME"

