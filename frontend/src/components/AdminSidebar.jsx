import { Home, FileText, Image, Settings, Users, ChevronLeft } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";
export default function AdminSidebar() {
  return (
    <div className="sticky top-0 h-screen w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 font-['Inter',_sans-serif]">
      {/* Header Sidebar */}
      <div className="p-6 border-b border-slate-800" onClick={() => window.location.href = "/"}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <span className="font-black text-white text-xl">AI</span>
          </div>
          <div>
            <h1 className="text-sm font-[900] tracking-tighter leading-tight uppercase">Dermo Admin</h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
        <MenuItem to="/admin/dashboard" icon={<Home size={20} />} label="Trang chủ" />
        <MenuItem to="/admin/articles" icon={<FileText size={20} />} label="Bài viết" />
        <MenuItem to="/admin/history" icon={<Image size={20} />} label="Lịch sử chẩn đoán" />
        <MenuItem to="/admin/models" icon={<Settings size={20} />} label="Mô hình AI" />
        <MenuItem to="/admin/users" icon={<Users size={20} />} label="Người dùng" />
      </nav>

      {/* Footer Sidebar */}
      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-2xl">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-black text-xs">AD</div>
          <div className="overflow-hidden">
            <p className="text-xs font-black truncate">Administrator</p>
            <p className="text-[10px] text-slate-500 font-bold">V 1.2.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group
        ${isActive 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
          : "text-slate-400 hover:bg-slate-800 hover:text-white"}`
      }
    >
      <span className="transition-transform group-hover:scale-110">{icon}</span>
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </NavLink>
  );
}