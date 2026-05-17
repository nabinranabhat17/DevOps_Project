FROM node:20-alpine
WORKDIR /app
ARG VERSION=1.0.0
ENV VERSION=${VERSION}
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
