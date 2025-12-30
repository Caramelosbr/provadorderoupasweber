// Sidebar do Vendedor
import { Link, useLocation } from 'react-router-dom'

const menuItems = [
  { path: '/vendedor', label: 'Dashboard', icon: 'home' },
  { path: '/vendedor/produtos', label: 'Produtos', icon: 'package' },
  { path: '/vendedor/pedidos', label: 'Pedidos', icon: 'shopping-bag' },
  { path: '/vendedor/avaliacoes', label: 'Avaliações', icon: 'star' },
  { path: '/vendedor/estatisticas', label: 'Estatísticas', icon: 'bar-chart' },
  { path: '/vendedor/loja', label: 'Minha Loja', icon: 'settings' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside>
      <div>
        <h2>Painel Vendedor</h2>
      </div>
      
      <nav>
        {menuItems.map(item => (
          <Link 
            key={item.path} 
            to={item.path}
            className={location.pathname === item.path ? 'active' : ''}
          >
            {/* Ícone */}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div>
        <Link to="/">Voltar ao Site</Link>
      </div>
    </aside>
  )
}