ARG MODE="development"

FROM node:18.18-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install --silent --ignore-scripts
RUN npm install -g --silent @quasar/cli@2.3.0

COPY src ./src
COPY jsconfig.json ./jsconfig.json
COPY index.html ./index.html
COPY quasar.config.js ./quasar.config.js
COPY .quasar ./.quasar
COPY .eslintrc.cjs ./.eslintrc.cjs

RUN npx quasar build

FROM nginx:1.25.3-alpine AS production-stage

WORKDIR /usr/share/nginx/html
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
