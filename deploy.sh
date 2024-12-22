#!/bin/bash

IMAGE_NAME=fe-kelompok-4
SSH_USER=akselerasi
SSH_HOST=128.199.87.32
DOCKERFILE=deploy/Dockerfile

SERVER_DOCKER_COMPOSE_LOCATION=docker-compose/fe-kelompok-4

if [ ! -x "$(command -v docker)" ]; then
    echo "Please install Orbstack https://orbstack.dev/"
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
  echo "This script uses docker, and it isn't running - please start docker and try again!"
  exit 1
fi

docker buildx inspect default && echo "Lets build! 🚀" || docker buildx create --use --name buildx_instance

docker buildx build -f $DOCKERFILE --platform linux/amd64 -t $IMAGE_NAME . --load

docker save $IMAGE_NAME | gzip > /tmp/$IMAGE_NAME.tar.gz

scp /tmp/$IMAGE_NAME.tar.gz $SSH_USER@$SSH_HOST:/tmp

ssh -C $SSH_USER@$SSH_HOST "docker load -i /tmp/$IMAGE_NAME.tar.gz && \
  rm /tmp/$IMAGE_NAME.tar.gz && \
  cd $SERVER_DOCKER_COMPOSE_LOCATION && \
  docker-compose down && \
  docker-compose up -d && \
  exit"

rm /tmp/$IMAGE_NAME.tar.gz
