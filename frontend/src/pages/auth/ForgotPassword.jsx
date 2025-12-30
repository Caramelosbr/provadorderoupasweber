// Página Esqueci Senha
import { useState } from 'react'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await authService.forgotPassword(email)
      setSent(true)
      toast.success('Email enviado!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao enviar email')
    }
  }

  if (sent) {
    return (
      <div>
        <h1>Email Enviado</h1>
        <p>Verifique sua caixa de entrada para redefinir sua senha.</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Esqueci minha senha</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit">Enviar</button>
      </form>
    </div>
  )
}