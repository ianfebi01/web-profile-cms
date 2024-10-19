FROM node:18-bullseye

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN useradd app -d /opt/

WORKDIR /opt/

COPY app/* ./

RUN npm install

CMD ["node", "main.mjs"]
