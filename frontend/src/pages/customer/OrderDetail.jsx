// Página de Detalhes do Pedido
import { useParams } from 'react-router-dom'
import { useOrder } from '../../hooks/useOrders'

export default function OrderDetail() {
  const { id } = useParams()
  const { data, isLoading } = useOrder(id)
  const order = data?.data?.order

  if (isLoading) return <div>Carregando...</div>

  return (
    <div>
      <h1>Pedido #{order?.orderNumber}</h1>
      {/* Status do pedido */}
      {/* Timeline de status */}
      {/* Itens do pedido */}
      {/* Endereço de entrega */}
      {/* Dados de pagamento */}
      {/* Botão cancelar (se aplicável) */}
    </div>
  )
}