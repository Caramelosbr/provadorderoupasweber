// Todos os Pedidos (Admin)
export default function Orders() {
  return (
    <div>
      <h1>Todos os Pedidos</h1>
      
      {/* Filtros */}
      <div>
        <input placeholder="Buscar por número..." />
        <select>
          <option value="">Todos status</option>
          <option value="pending">Pendente</option>
          <option value="paid">Pago</option>
          <option value="processing">Preparando</option>
          <option value="shipped">Enviado</option>
          <option value="delivered">Entregue</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <input type="date" placeholder="Data início" />
        <input type="date" placeholder="Data fim" />
      </div>

      {/* Tabela de pedidos */}
      <table>
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Loja</th>
            <th>Data</th>
            <th>Total</th>
            <th>Pagamento</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {/* Linhas de pedidos */}
        </tbody>
      </table>
    </div>
  )
}
