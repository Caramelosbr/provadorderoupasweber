
// Gerenciamento de Usuários
import { useState } from 'react'

export default function Users() {
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({ role: '', search: '' })

  return (
    <div>
      <h1>Usuários</h1>
      
      {/* Filtros */}
      <div>
        <input placeholder="Buscar..." />
        <select>
          <option value="">Todos</option>
          <option value="customer">Clientes</option>
          <option value="seller">Vendedores</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Tabela de usuários */}
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Role</th>
            <th>Data Cadastro</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {/* Linhas de usuários */}
        </tbody>
      </table>

      {/* Paginação */}
    </div>
  )
}