FROM node:18.17.1-bookworm-slim
WORKDIR /usr/src/app
RUN adduser chainviz
COPY ./package.json ./
COPY ./tsconfig.json ./
COPY ./src ./src
COPY ./dist ./dist
RUN chown -R chainviz:chainviz /usr/src/app
USER chainviz
RUN npm install --ignore-scripts
RUN npm run build
EXPOSE 8080
CMD [ "node", "dist/server/server.js" ]