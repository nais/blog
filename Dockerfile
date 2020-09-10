FROM nginx:alpine

LABEL MAINTAINER=navikt

COPY public/ /usr/share/nginx/html
COPY nginx/headers.conf /etc/nginx/conf.d/
COPY nginx/nais.conf /etc/nginx/conf.d/
