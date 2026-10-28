import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      
      {/* Sidebar cố định chiều cao 100vh */}
      <AdminSidebar />

      {/* Nội dung bên phải scroll độc lập */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-6">
          <Outlet />
        </div>
      </main>

    </div>
  );
}