FROM node:latest AS build
ARG VITE_ENV
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY .env.${VITE_ENV} .env
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]