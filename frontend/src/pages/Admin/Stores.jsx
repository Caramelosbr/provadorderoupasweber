// Gerenciamento de Lojas (Admin)
export default function Stores() {
  return (
    <div>
      <h1>Lojas</h1>
      
      {/* Filtros */}
      <div>
        <input placeholder="Buscar loja..." />
        <select>
          <option value="">Todas</option>
          <option value="active">Ativas</option>
          <option value="inactive">Inativas</option>
          <option value="pending">Pendentes</option>
        </select>
      </div>

      {/* Tabela de lojas */}
      <table>
        <thead>
          <tr>
            <th>Logo</th>
            <th>Nome</th>
            <th>Dono</th>
            <th>Plano</th>
            <th>Produtos</th>
            <th>Vendas</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {/* Linhas de lojas */}
        </tbody>
      </table>
    </div>
  )
}