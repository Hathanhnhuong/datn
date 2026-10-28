import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-zinc-900 text-white border-b border-zinc-800">
      <Link to="/" className="text-lg font-bold">
        AI SkinCare
      </Link>

      <nav className="flex items-center gap-6">
        <Link to="/diagnose" className="hover:text-indigo-400 transition">
          Chẩn đoán
        </Link>

        <Link to="/news" className="hover:text-indigo-400 transition">
          Tin tức
        </Link>

        {user ? (
          <>
            {user.role === "admin" && (
              <Link
                to="/admin/dashboard"
                className="hover:text-indigo-400 transition"
              >
                Admin
              </Link>
            )}

            <button
              onClick={logout}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Đăng nhập
          </Link>
        )}
      </nav>
    </header>
  );
}