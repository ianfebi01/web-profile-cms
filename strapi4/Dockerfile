FROM node:20-bullseye

RUN apt update && apt install -y libvips-dev

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN useradd strapi4 -d /opt/app

RUN mkdir -p /home/node/backups
RUN chown -R strapi4:strapi4 /home/node/backups

WORKDIR /opt/

ENV PATH /opt/node_modules/.bin:$PATH

COPY --chown=strapi4 strapi4-app /opt/app
WORKDIR /opt/app

USER strapi4

RUN yarn config set network-timeout 600000 -g
RUN yarn --force install

RUN yarn --cache-folder /opt/app build


EXPOSE 1337

CMD ["yarn", "--cache-folder", "/opt/app", "start"]
