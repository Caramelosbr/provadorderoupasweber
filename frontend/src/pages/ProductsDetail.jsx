// Página de Detalhes do Produto
import { useParams, Link } from 'react-router-dom'
import { useProduct, useRelatedProducts } from '../hooks/useProducts'
import { useCartStore } from '../stores/cartStore'
import { useState } from 'react'

export default function ProductDetail() {
  const { slug } = useParams()
  const { data, isLoading, error } = useProduct(slug)
  const product = data?.data?.product
  
  const { data: relatedData } = useRelatedProducts(product?._id)
  const { addItem } = useCartStore()

  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = async () => {
    await addItem(product._id, quantity, {
      size: selectedSize,
      color: selectedColor
    })
  }

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>Erro ao carregar produto</div>

  return (
    <div>
      {/* Galeria de imagens */}
      <div>
        {product?.images?.map((img, index) => (
          <img key={index} src={img.url} alt={product.name} />
        ))}
      </div>

      {/* Informações do produto */}
      <div>
        <h1>{product?.name}</h1>
        <p>{product?.price}</p>
        <p>{product?.description}</p>

        {/* Seleção de tamanho */}
        <div>
          <label>Tamanho:</label>
          {/* Botões de tamanho */}
        </div>

        {/* Seleção de cor */}
        <div>
          <label>Cor:</label>
          {/* Botões de cor */}
        </div>

        {/* Quantidade */}
        <div>
          <label>Quantidade:</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>

        {/* Botões de ação */}
        <button onClick={handleAddToCart}>Adicionar ao Carrinho</button>
        <Link to={`/provador/${product?._id}`}>Experimentar Virtualmente</Link>
      </div>

      {/* Avaliações */}
      <div>
        {/* Componente de avaliações */}
      </div>

      {/* Produtos relacionados */}
      <div>
        <h2>Produtos Relacionados</h2>
        {/* Lista de produtos relacionados */}
      </div>
    </div>
  )
}