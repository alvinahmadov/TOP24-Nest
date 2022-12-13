## ---- Base ---- ##
FROM node:lts-buster AS base

RUN apt-get update && apt-get install -y apt-utils locales net-tools nano 

# Locale
RUN sed -i -e \
  's/# ru_RU.UTF-8 UTF-8/ru_RU.UTF-8 UTF-8/' /etc/locale.gen \
   && locale-gen

ENV APP_USER=node
ENV APP_HOME=/srv/app

ENV LANG ru_RU.UTF-8
ENV LANGUAGE ru_RU:ru
ENV LC_LANG ru_RU.UTF-8
ENV LC_ALL ru_RU.UTF-8

RUN mkdir $APP_HOME && chown $APP_USER:$APP_USER $APP_HOME

USER $APP_USER

WORKDIR $APP_HOME

COPY --chown=$APP_USER:$APP_USER package.json ./

## ---- Build ---- ##
FROM base AS build

RUN npm set progress=false && npm config set depth 0
RUN npm i --loglevel=error --omit=dev
RUN cp -R node_modules prod_node_modules
RUN npm i --loglevel=error

COPY --chown=$APP_USER:$APP_USER . .

RUN mkdir $APP_HOME/docs && chown $APP_USER:$APP_USER $APP_HOME/docs

USER $APP_USER
ENV TZ Europe/Moscow

RUN npm run build && npm run doc

## ---- Production ---- ##
FROM base AS production

# Set environment variables
ARG NODE_OPTIONS="--max-old-space-size=4096"
ENV NODE_OPTIONS $NODE_OPTIONS
ENV NODE_ENV production

# Copy production node_modules
COPY --from=build --chown=$APP_USER:$APP_USER $APP_HOME/dist ./dist
COPY --from=build --chown=$APP_USER:$APP_USER $APP_HOME/docs ./docs
COPY --from=build --chown=$APP_USER:$APP_USER $APP_HOME/prod_node_modules ./node_modules

COPY --chown=$APP_USER:$APP_USER . .

EXPOSE 8080

CMD npm run start:prod
