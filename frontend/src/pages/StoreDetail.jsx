// Página de Detalhes da Loja
import { useParams } from 'react-router-dom'

export default function StoreDetail() {
  const { slug } = useParams()

  return (
    <div>
      <h1>Loja</h1>
      {/* Banner da loja */}
      {/* Informações da loja */}
      {/* Produtos da loja */}
    </div>
  )
}