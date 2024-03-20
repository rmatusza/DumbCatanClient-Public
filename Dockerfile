FROM node:20-alpine as build
WORKDIR /dumbcatan
COPY public/ /dumbcatan/public
COPY src/ /dumbcatan/src 
COPY package.json /dumbcatan
RUN npm install 
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /dumbcatan/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]