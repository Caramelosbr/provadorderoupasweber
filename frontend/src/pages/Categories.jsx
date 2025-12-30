// Página de Categorias
import { useCategoryTree } from '../hooks/useCategories'

export default function Categories() {
  const { data, isLoading } = useCategoryTree()

  if (isLoading) return <div>Carregando...</div>

  return (
    <div>
      <h1>Categorias</h1>
      {/* Grid de categorias */}
      {data?.data?.categories?.map(category => (
        <div key={category._id}>
          <p>{category.name}</p>
          {/* Subcategorias */}
        </div>
      ))}
    </div>
  )
}