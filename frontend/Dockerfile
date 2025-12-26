FROM nginx:alpine

# Remove config padrão
RUN rm -rf /usr/share/nginx/html/*

# Copia seus arquivos HTML/CSS/JS
COPY . /usr/share/nginx/html

EXPOSE 80
