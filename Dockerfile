# FROM node:12.4.0-alpine as base
# WORKDIR /src
# COPY package*.json ./

# FROM base as production

# ENV NODE_ENV=production
# RUN npm install
# COPY . .
# EXPOSE 3000
# CMD ["npm", "start"]

# FROM base as dev
# RUN apk add --no-cache bash
# RUN wget -O /bin/wait-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
# RUN chmod +x /bin/wait-it.sh

# ENV NODE_ENV=development
# RUN npm install
# COPY . .
# EXPOSE 3000
# CMD ["npm", "start"]

FROM node:12.4.0-alpine as base

WORKDIR /src

COPY package*.json ./

FROM base as production

ENV NODE_ENV=production

RUN npm install

COPY . .

EXPOSE 3000


CMD ["npm", "dev", "con"]