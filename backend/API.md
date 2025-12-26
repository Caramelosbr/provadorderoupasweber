# 📚 Documentação da API - Provador Virtual IA

## 🔐 Autenticação

### POST `/api/auth/register`

Registrar novo usuário

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "123456",
  "role": "customer" // ou "seller"
}
```

### POST `/api/auth/login`

Login do usuário

```json
{
  "email": "joao@email.com",
  "password": "123456"
}
```

**Resposta:** `{ token, user }`

### GET `/api/auth/google`

Login com Google (redireciona)

### GET `/api/auth/me`

🔒 Obter usuário autenticado

### POST `/api/auth/forgot-password`

```json

{ "email": "joao@email.com" }
```

### POST `/api/auth/reset-password`

```json

{ "token": "xxx", "password": "nova_senha" }
```

---

## 👤 Usuários

### PUT `/api/users/profile` 🔒

Atualizar perfil

```json
{ "name": "João", "phone": "11999999999", "cpf": "12345678901" }
```

### PUT `/api/users/avatar` 🔒

Upload de avatar (form-data: `avatar`)

### PUT `/api/users/measurements` 🔒

Salvar medidas do corpo

```json
{
  "height": 175,
  "weight": 70,
  "chest": 95,
  "waist": 80,
  "hip": 95,
  "shoulder": 45,
  "preferredSize": "M"
}
```

### PUT `/api/users/body-photo` 🔒

Upload de foto do corpo para provador (form-data: `photo`)

### Endereços

- `POST /api/users/addresses` 🔒
- `PUT /api/users/addresses/:addressId` 🔒
- `DELETE /api/users/addresses/:addressId` 🔒

### Favoritos

- `GET /api/users/favorites` 🔒
- `POST /api/users/favorites/:productId` 🔒

---

## 🏪 Lojas

### GET `/api/stores`

Listar lojas (público)

```?page=1&limit=12&search=moda&city=São Paulo&category=xxx
```

### GET `/api/stores/:slug`

Obter loja por slug (público)

### POST `/api/stores` 🔒

Criar loja

```json
{
  "name": "Minha Loja",
  "description": "Descrição da loja",
  "email": "loja@email.com",
  "phone": "11999999999"
}
```

### GET `/api/stores/my-store` 🔒 (seller)

Obter minha loja

### PUT `/api/stores/my-store` 🔒 (seller)

Atualizar minha loja

### PUT `/api/stores/my-store/logo` 🔒 (seller)

Upload de logo (form-data: `logo`)

### PUT `/api/stores/my-store/banner` 🔒 (seller)

Upload de banner (form-data: `banner`)

### GET `/api/stores/my-store/stats` 🔒 (seller)

Estatísticas da loja

---

## 👗 Produtos

### GET `/api/products`

Listar produtos (público)

```?page=1&limit=20&search=camiseta&category=xxx&minPrice=50&maxPrice=200&size=M&color=azul&gender=feminino&sort=-createdAt
```

### GET `/api/products/:slug`

Obter produto por slug

### GET `/api/products/id/:id`

Obter produto por ID

### GET `/api/products/id/:id/related`

Produtos relacionados

### GET `/api/products/my-products` 🔒 (seller)

Meus produtos

### POST `/api/products` 🔒 (seller)

Criar produto

```json
{
  "name": "Camiseta Básica",
  "description": "Camiseta 100% algodão",
  "price": 79.90,
  "category": "category_id",
  "variants": [
    { "size": "M", "color": { "name": "Azul", "hex": "#0000FF" }, "stock": 10 },
    { "size": "G", "color": { "name": "Azul", "hex": "#0000FF" }, "stock": 5 }
  ],
  "attributes": {
    "material": "Algodão",
    "gender": "unissex"
  }
}
```

### PUT `/api/products/:id` 🔒 (seller)

Atualizar produto

### DELETE `/api/products/:id` 🔒 (seller)

Deletar produto

### POST `/api/products/:id/images` 🔒 (seller)

Upload de imagens (form-data: `images[]`, max 10)

### POST `/api/products/:id/tryon-image` 🔒 (seller)

Upload de imagem para provador (form-data: `image`)

### DELETE `/api/products/:id/images/:imageId` 🔒 (seller)

Deletar imagem

---

## 📁 Categorias

### GET `/api/categories`

Listar categorias

```?parent=null&featured=true&active=true
```

### GET `/api/categories/tree`

Árvore de categorias

### GET `/api/categories/:slug`

Obter categoria

### POST `/api/categories` 🔒 (admin)

### PUT `/api/categories/:id` 🔒 (admin)

### DELETE `/api/categories/:id` 🔒 (admin)

---

## 🛒 Carrinho

### GET `/api/cart` 🔒

Obter carrinho

### POST `/api/cart/items` 🔒

Adicionar item

```json
{
  "productId": "xxx",
  "quantity": 1,
  "variant": { "size": "M", "color": { "name": "Azul" } }
}
```

### PUT `/api/cart/items/:itemId` 🔒

Atualizar quantidade

```json
{ "quantity": 2 }
```

### DELETE `/api/cart/items/:itemId` 🔒

Remover item

### DELETE `/api/cart` 🔒

Limpar carrinho

### POST `/api/cart/coupon` 🔒

Aplicar cupom

```json
{ "code": "DESCONTO10" }
```

### DELETE `/api/cart/coupon` 🔒

Remover cupom

---

## 📦 Pedidos

### POST `/api/orders` 🔒

Criar pedido

```json
{
  "shippingAddress": {
    "name": "João Silva",
    "phone": "11999999999",
    "street": "Rua Exemplo",
    "number": "123",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01000-000"
  },
  "paymentMethod": "pix"
}
```

### GET `/api/orders` 🔒

Meus pedidos

```?page=1&limit=10&status=delivered
```

### GET `/api/orders/:id` 🔒

Obter pedido

### GET `/api/orders/number/:orderNumber` 🔒

Obter por número

### PUT `/api/orders/:id/cancel` 🔒

Cancelar pedido

```json
{ "reason": "Motivo do cancelamento" }
```

### GET `/api/orders/store` 🔒 (seller)

Pedidos da loja

### PUT `/api/orders/:id/status` 🔒 (seller)

Atualizar status

```json
{ "status": "shipped", "trackingCode": "BR123456789", "note": "Enviado via Correios" }
```

---

## 👔 Provador Virtual (Try-On)

### POST `/api/tryon` 🔒

Criar prova virtual (usa foto salva do usuário)

```json
{
  "productId": "xxx",
  "variant": { "size": "M", "color": { "name": "Azul" } }
}
```

### POST `/api/tryon/with-photo` 🔒

Criar prova com upload de foto (form-data: `photo`, `productId`, `variant`)

### GET `/api/tryon` 🔒

Minhas provas virtuais

```?page=1&limit=20&saved=true
```

### GET `/api/tryon/:id` 🔒

Obter resultado da prova

### PUT `/api/tryon/:id/save` 🔒

Salvar prova

### PUT `/api/tryon/:id/feedback` 🔒

Enviar feedback

```json
{ "rating": 5, "liked": true, "comment": "Ficou perfeito!" }
```

### DELETE `/api/tryon/:id` 🔒

Deletar prova

### GET `/api/tryon/store/stats` 🔒 (seller)

Estatísticas de try-on da loja

---

## ⭐ Avaliações

### GET `/api/reviews/product/:productId`

Avaliações do produto (público)

```?page=1&limit=10&sort=-createdAt&rating=5
```

### GET `/api/reviews/my-reviews` 🔒

Minhas avaliações

### POST `/api/reviews` 🔒

Criar avaliação

```json
{
  "productId": "xxx",
  "orderId": "xxx",
  "rating": 5,
  "title": "Ótimo produto!",
  "comment": "Qualidade excelente",
  "ratings": {
    "quality": 5,
    "fit": 5,
    "valueForMoney": 4,
    "delivery": 5
  },
  "buyerInfo": {
    "size": "M",
    "height": "1.75m",
    "fitFeedback": "perfect"
  },
  "usedTryOn": true,
  "tryOnAccuracy": 5
}
```

### POST `/api/reviews/:id/images` 🔒

Upload de fotos (form-data: `images[]`, max 5)

### POST `/api/reviews/:id/helpful` 🔒

Marcar como útil

### PUT `/api/reviews/:id` 🔒

Atualizar avaliação

### DELETE `/api/reviews/:id` 🔒

Deletar avaliação

### GET `/api/reviews/store` 🔒 (seller)

Avaliações da loja

### POST `/api/reviews/:id/respond` 🔒 (seller)

Responder avaliação

```json
{ "comment": "Obrigado pela avaliação!" }
```

---

## 🔑 Autenticação

Todas as rotas marcadas com 🔒 requerem o header:

```Authorization: Bearer <token>
```

---

## 📝 Códigos de Resposta

- `200` - Sucesso
- `201` - Criado
- `400` - Erro de validação
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Não encontrado
- `500` - Erro interno

---

## 🚀 Como Rodar

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📧 Suporte

Em caso de dúvidas, entre em contato.
