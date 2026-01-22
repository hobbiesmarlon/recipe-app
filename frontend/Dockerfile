FROM node:24-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev
RUN npm install -g vite

COPY . .

CMD ["npm", "run", "dev", "--", "--host"]
