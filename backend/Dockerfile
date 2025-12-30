# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código
COPY . .

# Criar pasta de uploads
RUN mkdir -p uploads/products uploads/users uploads/tryons

# Expor porta
EXPOSE 5000

# Comando para iniciar
CMD ["npm", "start"]
