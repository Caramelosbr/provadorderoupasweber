// Página de Histórico de Provas Virtuais
import { useMyTryOns } from '../../hooks/useTryOn'

export default function TryOnHistory() {
  const { data, isLoading } = useMyTryOns({})

  if (isLoading) return <div>Carregando...</div>

  return (
    <div>
      <h1>Minhas Provas Virtuais</h1>
      {/* Grid de resultados */}
      {data?.data?.tryOns?.map(tryOn => (
        <div key={tryOn._id}>
          <img src={tryOn.resultImage?.url} alt="Prova" />
          <p>{tryOn.product?.name}</p>
          <p>Status: {tryOn.status}</p>
        </div>
      ))}
    </div>
  )
}
