FROM node:18.17.1-bookworm-slim
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 8080
CMD [ "node", "dist/server/server.js" ]