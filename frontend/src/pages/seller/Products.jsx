// Lista de Produtos do Vendedor
import { Link } from 'react-router-dom'
import { useMyProducts } from '../../hooks/useProducts'

export default function Products() {
  const { data, isLoading } = useMyProducts({})

  if (isLoading) return <div>Carregando...</div>

  return (
    <div>
      <h1>Meus Produtos</h1>
      <Link to="/vendedor/produto/novo">Adicionar Produto</Link>
      
      {/* Tabela de produtos */}
      <table>
        <thead>
          <tr>
            <th>Imagem</th>
            <th>Nome</th>
            <th>Preço</th>
            <th>Estoque</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.products?.map(product => (
            <tr key={product._id}>
              <td><img src={product.images?.[0]?.url} alt="" /></td>
              <td>{product.name}</td>
              <td>R$ {product.price}</td>
              <td>{/* calcular estoque total */}</td>
              <td>{product.status}</td>
              <td>
                <Link to={`/vendedor/produto/${product._id}`}>Editar</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
