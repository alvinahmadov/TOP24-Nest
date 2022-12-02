## ---- Base ---- ##
FROM node:lts-buster AS base

RUN apt-get update && apt-get install -y apt-utils postgresql-12 redis redis-server net-tools nano

RUN npm install sequelize-cli -g

ENV APP_USER=node
ENV APP_HOME=/srv/app

RUN mkdir $APP_HOME && chown $APP_USER:$APP_USER $APP_HOME

USER $APP_USER

WORKDIR $APP_HOME

COPY --chown=$APP_USER:$APP_USER package.json package-lock.json ./deploy/install-pgcrypto.sh ./

## ---- Build ---- ##
FROM base AS build

RUN npm set progress=false && npm config set depth 0
RUN npm ci --loglevel=error
COPY --chown=$APP_USER:$APP_USER . .

RUN rm -rf $APP_HOME/docs || echo "Directory '$APP_HOME/docs' doesn't exist"
RUN mkdir $APP_HOME/docs && chown $APP_USER:$APP_USER $APP_HOME/docs
RUN install-pgcrypto.sh

USER $APP_USER

ENV GENERATE_SOURCEMAP false
ENV NODE_OPTIONS="--max-old-space-size=8192"

RUN npm run build && npm run doc

## ---- Development ---- ##
FROM base AS development

## Set environment variables
ARG NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_OPTIONS $NODE_OPTIONS
ENV NODE_ENV development

USER $APP_USER

## Copy node_modules
COPY --from=build --chown=$APP_USER:$APP_USER $APP_HOME/dist ./dist
COPY --from=build --chown=$APP_USER:$APP_USER $APP_HOME/docs ./docs
COPY --from=build --chown=$APP_USER:$APP_USER $APP_HOME/node_modules ./node_modules

COPY --chown=$APP_USER:$APP_USER . .

EXPOSE 8080

CMD npm run start
