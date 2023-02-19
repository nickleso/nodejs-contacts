FROM node:14.18.3

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["node", "server"]