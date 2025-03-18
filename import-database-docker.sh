#!/bin/bash

# Check if pg_restore is installed
# if ! command -v pg_restore &> /dev/null; then
#   echo "pg_restore could not be found"
#   exit
# fi

source ./.env

# Access the variables from the .env file
DOCKER_CONTAINER_NAME="web-profile-cms-strapi_db-1" # Replace with your PostgreSQL container name
DATABASE_HOST=$DATABASE_HOST
DATABASE_NAME=$DATABASE_NAME
POSTGRES_USER=$POSTGRES_ROOT_USER
POSTGRES_PASSWORD=$POSTGRES_ROOT_PASSWORD

export PGPASSWORD=$POSTGRES_PASSWORD

echo "Restoring database to PostgreSQL in Docker container ($DOCKER_CONTAINER_NAME)..."

# Drop and recreate the public schema inside the container
docker exec -i $DOCKER_CONTAINER_NAME psql -U $POSTGRES_USER -d $DATABASE_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Restore the database using a .sql file
docker exec -i $DOCKER_CONTAINER_NAME psql -U $POSTGRES_USER -d $DATABASE_NAME < ./database.sql

# Unset all environment variables
unset PGPASSWORD

echo "Database restore complete."

# Build and start the strapi service
# docker compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache strapi
# docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d strapi
