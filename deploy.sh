#!/bin/bash

IMAGE_NAME=web-profile-cms-strapi-amd64
SSH_USER=ianfebi01
SSH_HOST=103.150.196.117
DOCKERFILE=./strapi4/Dockerfile

SERVER_DOCKER_COMPOSE_LOCATION=app/web-profile-cms

if [ ! -x "$(command -v docker)" ]; then
    echo "Please install Orbstack https://orbstack.dev/"
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
  echo "This script uses docker, and it isn't running - please start docker and try again!"
  exit 1
fi

docker buildx inspect default && echo "Lets build! 🚀" || docker buildx create --use --name buildx_instance

docker buildx build -f $DOCKERFILE --platform linux/amd64 -t $IMAGE_NAME ./strapi4

echo "Docker save: " && docker save $IMAGE_NAME | gzip > /tmp/$IMAGE_NAME.tar.gz

echo "SCP: "  && scp /tmp/$IMAGE_NAME.tar.gz $SSH_USER@$SSH_HOST:/tmp

# echo "Load: " && ssh ianfebi01@103.150.196.117 "docker load -i /tmp/web-profile-cms-strapi-amd64.tar.gz && \
#   rm /tmp/web-profile-cms-strapi-amd64.tar.gz"

echo "Load: " && ssh -C $SSH_USER@$SSH_HOST "docker load -i /tmp/$IMAGE_NAME.tar.gz && \
  rm /tmp/$IMAGE_NAME.tar.gz && \
  cd $SERVER_DOCKER_COMPOSE_LOCATION && \
  docker compose down && \
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d && \
  exit"

rm /tmp/$IMAGE_NAME.tar.gz
