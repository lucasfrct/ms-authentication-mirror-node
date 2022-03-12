FROM node:16 AS ms-authentication-mirror

ARG PORT
ARG NODE_ENV

ENV PORT=${PORT?5001}
ENV NODE_ENV=${NODE_ENV?development}

WORKDIR /usr/local/ms-authentication-mirror

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE $PORT

VOLUME /usr/local/ms-authentication-mirror

CMD [ "npm", "run", "production" ]