# Imagem base estável
FROM node:20-alpine

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos de dependência
COPY package*.json ./

# Instala dependências
RUN npm install --production

# Copia o resto do projeto
COPY . .

# Porta usada pelo app
EXPOSE 3000

# Comando de start
CMD ["node", "server.js"]
