#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

echo "Backing up Postgres..."
docker compose exec -T postgres pg_dump -U n8nify n8nify > "$BACKUP_DIR/postgres_$TIMESTAMP.sql"

echo "Backing up MinIO workflows bucket..."
docker compose exec -T minio mc mirror local/n8nify-workflows "$BACKUP_DIR/minio_$TIMESTAMP" 2>/dev/null || \
  echo "MinIO backup skipped (mc not configured in container)"

echo "Backup complete: $BACKUP_DIR"
