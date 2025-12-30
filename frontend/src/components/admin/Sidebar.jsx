// Sidebar do Admin
import { Link, useLocation } from 'react-router-dom'

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: 'home' },
  { path: '/admin/usuarios', label: 'Usuários', icon: 'users' },
  { path: '/admin/lojas', label: 'Lojas', icon: 'store' },
  { path: '/admin/categorias', label: 'Categorias', icon: 'folder' },
  { path: '/admin/pedidos', label: 'Pedidos', icon: 'shopping-bag' },
  { path: '/admin/relatorios', label: 'Relatórios', icon: 'bar-chart' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside>
      <div>
        <h2>Admin</h2>
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