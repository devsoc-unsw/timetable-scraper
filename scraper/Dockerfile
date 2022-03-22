FROM node:17.7.2-alpine as builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM node:17.7.2-alpine as runner
ENV NODE_ENV production
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --from=builder /app/dist ./dist

CMD yarn scrape