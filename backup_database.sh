#!/bin/bash

# Configuration
VPS_USER="ianfebi01"
VPS_IP="103.150.196.117"
VPS_PATH="/home/ianfebi01/database.sql"
LOCAL_PATH="/Users/ianfebi01/Work/Web/web-profile-cms/database.sql"
CONTAINER_NAME="web-profile-cms-strapi_db-1"
DB_NAME="webprofilecms"
DB_USER="postgres"

# Timestamp for backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="database_${TIMESTAMP}.sql"

echo "Starting database backup from VPS..."

# SSH into VPS and create the backup
ssh -Tq ${VPS_USER}@${VPS_IP} << EOF
    echo "Creating database backup on VPS..."
    docker exec -t ${CONTAINER_NAME} pg_dump -U ${DB_USER} -F p -f /tmp/${BACKUP_FILENAME} ${DB_NAME} && \
    docker cp ${CONTAINER_NAME}:/tmp/${BACKUP_FILENAME} ${VPS_PATH} && \
    docker exec -t ${CONTAINER_NAME} rm /tmp/${BACKUP_FILENAME}
    echo "Backup created on VPS at ${VPS_PATH}"
EOF

# Copy the backup from VPS to local machine
echo "Copying backup to local machine..."
scp ${VPS_USER}@${VPS_IP}:${VPS_PATH} ${LOCAL_PATH}

echo "Backup completed successfully!"
echo "Local backup file: ${LOCAL_PATH}"