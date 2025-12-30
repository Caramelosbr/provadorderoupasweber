// Página do Carrinho
import { useCartStore } from '../../stores/cartStore'
import { Link } from 'react-router-dom'

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, discount, total } = useCartStore()

  if (items.length === 0) {
    return (
      <div>
        <h1>Carrinho Vazio</h1>
        <Link to="/produtos">Continuar Comprando</Link>
      </div>
    )
  }

  return (
    <div>
      <h1>Meu Carrinho</h1>
      
      {/* Lista de itens */}
      {items.map(item => (
        <div key={item._id}>
          <p>{item.product?.name}</p>
          <p>Tamanho: {item.variant?.size}</p>
          <p>Cor: {item.variant?.color?.name}</p>
          <input 
            type="number" 
            value={item.quantity} 
            onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
          />
          <p>R$ {(item.price * item.quantity).toFixed(2)}</p>
          <button onClick={() => removeItem(item._id)}>Remover</button>
        </div>
      ))}

      {/* Resumo */}
      <div>
        <p>Subtotal: R$ {subtotal?.toFixed(2)}</p>
        {discount > 0 && <p>Desconto: -R$ {discount?.toFixed(2)}</p>}
        <p>Total: R$ {total?.toFixed(2)}</p>
      </div>

      {/* Cupom */}
      <div>
        {/* Input de cupom */}
      </div>

      <Link to="/checkout">Finalizar Compra</Link>
    </div>
  )
}
