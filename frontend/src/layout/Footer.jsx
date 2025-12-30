import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer>
      <div>
        <h3>Provador Virtual IA</h3>
        <p>Experimente roupas virtualmente antes de comprar</p>
      </div>

      <div>
        <h4>Links</h4>
        <Link to="/">Home</Link>
        <Link to="/produtos">Produtos</Link>
        <Link to="/lojas">Lojas</Link>
      </div>

      <div>
        <h4>Conta</h4>
        <Link to="/perfil">Meu Perfil</Link>
        <Link to="/pedidos">Meus Pedidos</Link>
        <Link to="/favoritos">Favoritos</Link>
      </div>

      <div>
        <h4>Suporte</h4>
        <a href="mailto:suporte@provadoria.com">suporte@provadoria.com</a>
      </div>

      <div>
        <p>&copy; {new Date().getFullYear()} Provador Virtual IA</p>
      </div>
    </footer>
  )
}