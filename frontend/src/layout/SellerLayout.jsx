import { Outlet } from 'react-router-dom'
import SellerSidebar from '../components/seller/Sidebar'
import SellerHeader from '../components/seller/Header'

export default function SellerLayout() {
  return (
    <div className="min-h-screen flex">
      <SellerSidebar />
      <div className="flex-1 flex flex-col">
        <SellerHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}