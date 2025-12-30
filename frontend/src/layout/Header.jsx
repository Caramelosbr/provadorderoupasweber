import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { items } = useCartStore()
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <header>
      <nav>
        {/* Logo */}
        <Link to="/">Provador Virtual IA</Link>

        {/* Menu */}
        <Link to="/produtos">Produtos</Link>
        <Link to="/lojas">Lojas</Link>
        <Link to="/categorias">Categorias</Link>

        {/* Carrinho */}
        <Link to="/carrinho">
          Carrinho ({totalItems})
        </Link>

        {/* User Menu */}
        {isAuthenticated ? (
          <>
            <span>Olá, {user?.name}</span>
            <Link to="/perfil">Meu Perfil</Link>
            <Link to="/pedidos">Meus Pedidos</Link>
            <Link to="/minhas-provas">Minhas Provas</Link>
            {user?.role === 'seller' && <Link to="/vendedor">Painel Vendedor</Link>}
            {user?.role === 'admin' && <Link to="/admin">Painel Admin</Link>}
            <button onClick={logout}>Sair</button>
          </>
        ) : (
          <>
            <Link to="/login">Entrar</Link>
            <Link to="/cadastro">Cadastrar</Link>
          </>
        )}
      </nav>
    </header>
  )
}
