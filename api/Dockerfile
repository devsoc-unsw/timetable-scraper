FROM node:16.17-alpine as builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM node:16.17-alpine as runner
ENV NODE_ENV production
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD yarn start