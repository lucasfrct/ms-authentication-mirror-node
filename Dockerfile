
## Node alpine
FROM node:alpine AS environment-node

## agumentos de entrada
ARG PORT
ARG DIRECTORY
ARG ENVIRONMENT

## diretorios de trabalho
WORKDIR ${DIRECTORY}

## Arquivos de iniciacao par ao node
COPY package*.json ./

## install dependences
RUN npm install

## Copia projeto
COPY . .

## porta de acesso
EXPOSE ${PORT}  

## diretorio padrao
VOLUME ${DIRECTORY}

## start do ambiente
CMD ["npm", "run", ${ENVIRONMENT}]