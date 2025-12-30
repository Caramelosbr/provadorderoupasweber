// Header do Vendedor
import { useAuthStore } from '../../stores/authStore'

export default function Header() {
  const { user, logout } = useAuthStore()

  return (
    <header>
      <div>
        {/* Busca */}
        <input placeholder="Buscar..." />
      </div>

      <div>
        {/* Notificações */}
        <button>Notificações</button>

        {/* User menu */}
        <span>{user?.name}</span>
        <button onClick={logout}>Sair</button>
      </div>
    </header>
  )
}
