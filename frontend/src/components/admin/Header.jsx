// Header do Admin
import { useAuthStore } from '../../stores/authStore'

export default function Header() {
  const { user, logout } = useAuthStore()

  return (
    <header>
      <div>
        {/* Título ou Breadcrumb */}
      </div>

      <div>
        {/* User menu */}
        <span>{user?.name}</span>
        <button onClick={logout}>Sair</button>
      </div>
    </header>
  )
}
