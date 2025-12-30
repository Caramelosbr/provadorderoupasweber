// Detalhes do Pedido (Vendedor)
import { useParams } from 'react-router-dom'
import { useOrder, useUpdateOrderStatus } from '../../hooks/useOrders'
import toast from 'react-hot-toast'

export default function OrderDetail() {
  const { id } = useParams()
  const { data, isLoading } = useOrder(id)
  const updateStatus = useUpdateOrderStatus()
  const order = data?.data?.order

  const handleUpdateStatus = async (status, trackingCode) => {
    try {
      await updateStatus.mutateAsync({ id, data: { status, trackingCode } })
      toast.success('Status atualizado!')
    } catch (error) {
      toast.error('Erro ao atualizar status')
    }
  }

  if (isLoading) return <div>Carregando...</div>

  return (
    <div>
      <h1>Pedido #{order?.orderNumber}</h1>
      
      {/* Status atual */}
      <p>Status: {order?.status}</p>

      {/* Dados do cliente */}
      <div>
        <h2>Cliente</h2>
        <p>{order?.user?.name}</p>
        <p>{order?.user?.email}</p>
      </div>

      {/* Endereço de entrega */}
      <div>
        <h2>Endereço</h2>
        {/* Dados do endereço */}
      </div>

      {/* Itens */}
      <div>
        <h2>Itens</h2>
        {/* Lista de itens */}
      </div>

      {/* Ações */}
      <div>
        <h2>Atualizar Status</h2>
        <button onClick={() => handleUpdateStatus('processing')}>Preparando</button>
        <button onClick={() => handleUpdateStatus('shipped')}>Enviado</button>
        <button onClick={() => handleUpdateStatus('delivered')}>Entregue</button>
      </div>
    </div>
  )
}
