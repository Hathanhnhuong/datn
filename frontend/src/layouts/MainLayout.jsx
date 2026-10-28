import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AdminSidebar from "../components/AdminSidebar";
export default function MainLayout() {
  const { user } = useAuth();

  if (!user) {
    return <div>Bạn chưa đăng nhập</div>;
  }

  if (user.role !== "admin") {
    return <div>Bạn không có quyền truy cập</div>;
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 bg-gray-100 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
