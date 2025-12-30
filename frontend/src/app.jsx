import { Routes, Route } from 'react-router-dom'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'
import SellerLayout from './layouts/SellerLayout'

// Componentes
import PrivateRoute from './components/PrivateRoute'
import RoleRoute from './components/RoleRoute'

// Páginas Públicas
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Stores from './pages/Stores'
import StoreDetail from './pages/StoreDetail'
import Categories from './pages/Categories'

// Auth
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Cliente
import Profile from './pages/customer/Profile'
import Addresses from './pages/customer/Addresses'
import Orders from './pages/customer/Orders'
import OrderDetail from './pages/customer/OrderDetail'
import Favorites from './pages/customer/Favorites'
import Cart from './pages/customer/Cart'
import Checkout from './pages/customer/Checkout'
import TryOn from './pages/customer/TryOn'
import TryOnHistory from './pages/customer/TryOnHistory'

// Vendedor
import SellerDashboard from './pages/seller/Dashboard'
import SellerProducts from './pages/seller/Products'
import SellerProductForm from './pages/seller/ProductForm'
import SellerOrders from './pages/seller/Orders'
import SellerOrderDetail from './pages/seller/OrderDetail'
import SellerStore from './pages/seller/Store'
import SellerReviews from './pages/seller/Reviews'
import SellerStats from './pages/seller/Stats'

// Admin
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminStores from './pages/admin/Stores'
import AdminCategories from './pages/admin/Categories'
import AdminOrders from './pages/admin/Orders'
import AdminReports from './pages/admin/Reports'

function App() {
  return (
    <>
      {/* Teste Tailwind (AGORA CORRETO) */}
      <h1 className="text-4xl font-bold text-purple-500">
        Tailwind está funcionando! 💜✨
      </h1>

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<Products />} />
          <Route path="/produto/:slug" element={<ProductDetail />} />
          <Route path="/lojas" element={<Stores />} />
          <Route path="/loja/:slug" element={<StoreDetail />} />
          <Route path="/categorias" element={<Categories />} />
          <Route path="/categoria/:slug" element={<Products />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/esqueci-senha" element={<ForgotPassword />} />
          <Route path="/resetar-senha" element={<ResetPassword />} />
        </Route>

        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/perfil" element={<Profile />} />
          <Route path="/enderecos" element={<Addresses />} />
          <Route path="/pedidos" element={<Orders />} />
          <Route path="/pedido/:id" element={<OrderDetail />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/carrinho" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/provador/:productId" element={<TryOn />} />
          <Route path="/minhas-provas" element={<TryOnHistory />} />
        </Route>

        <Route element={<RoleRoute roles={['seller', 'admin']}><SellerLayout /></RoleRoute>}>
          <Route path="/vendedor" element={<SellerDashboard />} />
          <Route path="/vendedor/produtos" element={<SellerProducts />} />
          <Route path="/vendedor/produto/novo" element={<SellerProductForm />} />
          <Route path="/vendedor/produto/:id" element={<SellerProductForm />} />
          <Route path="/vendedor/pedidos" element={<SellerOrders />} />
          <Route path="/vendedor/pedido/:id" element={<SellerOrderDetail />} />
          <Route path="/vendedor/loja" element={<SellerStore />} />
          <Route path="/vendedor/avaliacoes" element={<SellerReviews />} />
          <Route path="/vendedor/estatisticas" element={<SellerStats />} />
        </Route>

        <Route element={<RoleRoute roles={['admin']}><AdminLayout /></RoleRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/usuarios" element={<AdminUsers />} />
          <Route path="/admin/lojas" element={<AdminStores />} />
          <Route path="/admin/categorias" element={<AdminCategories />} />
          <Route path="/admin/pedidos" element={<AdminOrders />} />
          <Route path="/admin/relatorios" element={<AdminReports />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
