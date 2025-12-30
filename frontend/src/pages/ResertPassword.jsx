// Página Reset de Senha
import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Senhas não conferem')
      return
    }
    try {
      await authService.resetPassword({ token, password })
      toast.success('Senha alterada com sucesso!')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao resetar senha')
    }
  }

  return (
    <div>
      <h1>Redefinir Senha</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nova Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>Confirmar Senha</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        <button type="submit">Redefinir</button>
      </form>
    </div>
  )
}