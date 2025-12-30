# Imagem base estável
FROM node:20-alpine

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos de dependência
COPY package*.json ./

# Instala dependências (SEM --production para ter todas)
RUN npm install

# Copia o resto do projeto
COPY . .

# Porta usada pelo app
EXPOSE 5000

# Comando de start
CMD ["node", "server.js"]