FROM node:16 AS ms-authentication-mirror

ENV NODE_ENV=development

WORKDIR /usr/local/ms-authentication-mirror

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5001

VOLUME /usr/local/ms-authentication-mirror

CMD [ "npm", "run", "development" ]


FROM node:16 AS ms-authentication-mirror-production

ENV NODE_ENV=development

WORKDIR /usr/local/ms-authentication-mirror

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5001

VOLUME /usr/local/ms-authentication-mirror

CMD [ "npm", "run", "development" ]