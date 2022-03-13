FROM node:16

ARG PORT
ARG NODE_ENV
ARG HOSTNAME

ENV PORT=${PORT?5001}
ENV NODE_ENV=${NODE_ENV?development}
ENV HOSTNAME=${HOSTNAME?app}

WORKDIR /usr/local/$HOSTNAME

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE $PORT

VOLUME /usr/local/$HOSTNAME

CMD [ "npm", "run", NODE_ENV ]