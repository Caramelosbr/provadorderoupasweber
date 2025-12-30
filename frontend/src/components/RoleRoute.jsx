import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function RoleRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!roles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
