#!/bin/bash
# scripts/backup.sh

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="tca_db"
CONTAINER_NAME="tca_mongodb"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
echo "Starting backup for $DB_NAME..."
docker exec $CONTAINER_NAME mongodump --db $DB_NAME --archive > "$BACKUP_DIR/backup_$TIMESTAMP.archive"

if [ $? -eq 0 ]; then
  echo "✅ Backup successful: $BACKUP_DIR/backup_$TIMESTAMP.archive"
  
  # Cleanup old backups (keep last 7 days)
  find $BACKUP_DIR -name "backup_*.archive" -mtime +7 -delete
else
  echo "❌ Backup failed!"
  exit 1
fi
