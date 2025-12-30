import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/admin/Sidebar'
import AdminHeader from '../components/admin/Header'

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}