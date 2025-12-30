// Página de Pedidos do Cliente
import { useOrders } from '../../hooks/useOrders'

export default function Orders() {
  const { data, isLoading } = useOrders({})

  if (isLoading) return <div>Carregando...</div>

  return (
    <div>
      <h1>Meus Pedidos</h1>
      {/* Filtros por status */}
      {/* Lista de pedidos */}
      {data?.data?.orders?.map(order => (
        <div key={order._id}>
          <p>Pedido #{order.orderNumber}</p>
          <p>Status: {order.status}</p>
          <p>Total: R$ {order.pricing?.total}</p>
        </div>
      ))}
    </div>
  )
}