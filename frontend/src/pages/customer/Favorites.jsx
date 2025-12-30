// Página de Favoritos
import { userService } from '../../services/userService'
import { useQuery } from 'react-query'

export default function Favorites() {
  const { data, isLoading } = useQuery('favorites', userService.getFavorites)

  if (isLoading) return <div>Carregando...</div>

  return (
    <div>
      <h1>Meus Favoritos</h1>
      {/* Grid de produtos favoritos */}
      {data?.data?.favorites?.map(product => (
        <div key={product._id}>
          <p>{product.name}</p>
        </div>
      ))}
    </div>
  )
}
