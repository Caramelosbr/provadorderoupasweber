// Estatísticas da Loja
import { useStoreTryOnStats } from '../../hooks/useTryOn'

export default function Stats() {
  const { data } = useStoreTryOnStats()

  return (
    <div>
      <h1>Estatísticas</h1>
      
      {/* Estatísticas do Provador Virtual */}
      <div>
        <h2>Provador Virtual</h2>
        <p>Total de provas: {data?.data?.stats?.total}</p>
        <p>Completadas: {data?.data?.stats?.completed}</p>
        <p>Converteram em venda: {data?.data?.stats?.converted}</p>
        <p>Avaliação média: {data?.data?.stats?.avgRating}</p>
      </div>

      {/* Gráficos de vendas */}
      {/* Produtos mais vendidos */}
      {/* Taxa de conversão */}
    </div>
  )
}
