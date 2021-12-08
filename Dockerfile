FROM node:12.18.3 as builder

WORKDIR /usr/src/app

COPY dist/ .

RUN npm i --production

FROM node:12.18.3-slim
ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .

EXPOSE 3000

CMD ["node", "server.js"]