// Pedidos da Loja
import { useStoreOrders } from '../../hooks/useOrders'

export default function Orders() {
  const { data, isLoading } = useStoreOrders({})

  if (isLoading) return <div>Carregando...</div>

  return (
    <div>
      <h1>Pedidos da Loja</h1>
      {/* Filtros por status */}
      {/* Tabela de pedidos */}
      <table>
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Data</th>
            <th>Total</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.orders?.map(order => (
            <tr key={order._id}>
              <td>#{order.orderNumber}</td>
              <td>{order.user?.name}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>R$ {order.pricing?.total}</td>
              <td>{order.status}</td>
              <td>
                {/* Botões de ação */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}