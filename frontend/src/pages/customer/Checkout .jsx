// Página de Checkout
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../stores/cartStore'
import { useCreateOrder } from '../../hooks/useOrders'
import { paymentService } from '../../services/paymentService'
import toast from 'react-hot-toast'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCartStore()
  const createOrder = useCreateOrder()

  const [step, setStep] = useState(1) // 1: Endereço, 2: Pagamento, 3: Confirmação
  const [shippingAddress, setShippingAddress] = useState({})
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [paymentData, setPaymentData] = useState(null)

  const handleCreateOrder = async () => {
    try {
      const { data } = await createOrder.mutateAsync({
        shippingAddress,
        paymentMethod
      })

      // Criar pagamento
      if (paymentMethod === 'pix') {
        const payment = await paymentService.createPix(data.order._id)
        setPaymentData(payment.data.payment)
      } else if (paymentMethod === 'boleto') {
        const payment = await paymentService.createBoleto(data.order._id)
        setPaymentData(payment.data.payment)
      }

      setStep(3)
      clearCart()
      toast.success('Pedido criado com sucesso!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar pedido')
    }
  }

  return (
    <div>
      <h1>Checkout</h1>

      {/* Steps indicator */}
      <div>
        <span className={step >= 1 ? 'active' : ''}>1. Endereço</span>
        <span className={step >= 2 ? 'active' : ''}>2. Pagamento</span>
        <span className={step >= 3 ? 'active' : ''}>3. Confirmação</span>
      </div>

      {/* Step 1: Endereço */}
      {step === 1 && (
        <div>
          <h2>Endereço de Entrega</h2>
          {/* Formulário de endereço ou seleção de endereço salvo */}
          <button onClick={() => setStep(2)}>Continuar</button>
        </div>
      )}

      {/* Step 2: Pagamento */}
      {step === 2 && (
        <div>
          <h2>Forma de Pagamento</h2>
          <div>
            <label>
              <input 
                type="radio" 
                value="pix" 
                checked={paymentMethod === 'pix'} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
              />
              PIX
            </label>
            <label>
              <input 
                type="radio" 
                value="credit_card" 
                checked={paymentMethod === 'credit_card'} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
              />
              Cartão de Crédito
            </label>
            <label>
              <input 
                type="radio" 
                value="boleto" 
                checked={paymentMethod === 'boleto'} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
              />
              Boleto
            </label>
          </div>

          {/* Se cartão, mostrar formulário do cartão */}
          {paymentMethod === 'credit_card' && (
            <div>
              {/* Formulário do cartão */}
            </div>
          )}

          <button onClick={handleCreateOrder}>Finalizar Pedido</button>
        </div>
      )}

      {/* Step 3: Confirmação */}
      {step === 3 && (
        <div>
          <h2>Pedido Confirmado!</h2>
          
          {paymentMethod === 'pix' && paymentData && (
            <div>
              <h3>Pague com PIX</h3>
              <img src={`data:image/png;base64,${paymentData.pixQrCode}`} alt="QR Code PIX" />
              <p>Código PIX: {paymentData.pixCode}</p>
              <button onClick={() => navigator.clipboard.writeText(paymentData.pixCode)}>
                Copiar código
              </button>
            </div>
          )}

          {paymentMethod === 'boleto' && paymentData && (
            <div>
              <h3>Boleto Gerado</h3>
              <a href={paymentData.bankSlipUrl} target="_blank">Visualizar Boleto</a>
              <p>Código de barras: {paymentData.barCode}</p>
            </div>
          )}

          <button onClick={() => navigate('/pedidos')}>Ver Meus Pedidos</button>
        </div>
      )}

      {/* Resumo do pedido */}
      <div>
        <h3>Resumo</h3>
        <p>Total: R$ {total?.toFixed(2)}</p>
      </div>
    </div>
  )
}