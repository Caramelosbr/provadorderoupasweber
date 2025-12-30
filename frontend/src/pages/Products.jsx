// Página de Listagem de Produtos
import { useProducts } from '../hooks/useProducts'
import { useSearchParams } from 'react-router-dom'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  const params = {
    page: searchParams.get('page') || 1,
    search: searchParams.get('q'),
    category: searchParams.get('categoria'),
    minPrice: searchParams.get('min'),
    maxPrice: searchParams.get('max'),
    size: searchParams.get('tamanho'),
    gender: searchParams.get('genero')
  }

  const { data, isLoading, error } = useProducts(params)

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>Erro ao carregar produtos</div>

  return (
    <div>
      <h1>Produtos</h1>
      
      {/* Filtros */}
      <div>
        {/* Filtro de categoria */}
        {/* Filtro de preço */}
        {/* Filtro de tamanho */}
        {/* Filtro de gênero */}
      </div>

      {/* Lista de produtos */}
      <div>
        {data?.data?.products?.map(product => (
          <div key={product._id}>
            {/* Card do produto */}
            <p>{product.name}</p>
            <p>{product.price}</p>
          </div>
        ))}
      </div>

      {/* Paginação */}
      <div>
        {/* Botões de paginação */}
      </div>
    </div>
  )
}
