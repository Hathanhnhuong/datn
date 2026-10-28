import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";

export default function LoginForm({ switchTab }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post("/auth/login", {
      email,
      password,
    });

    login(res.data.access_token, {
  email: res.data.email,
  role: res.data.role
});

    if (res.data.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/", { replace: true });
    }

  } catch (err) {
    setError("Sai email hoặc mật khẩu");
  }
};
  return (
    <form onSubmit={handleLogin}>
      <h2 className="text-2xl font-bold text-white mb-6">
        Chào mừng trở lại 👋
      </h2>

      <input
        type="email"
        placeholder="Email"
        className="w-full mb-4 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Mật khẩu"
        className="w-full mb-4 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-lg py-2 text-white font-medium transition hover:scale-[1.02]">
        Đăng nhập
      </button>

      <p className="text-sm text-zinc-400 mt-4 text-center">
        Chưa có tài khoản?{" "}
        <span onClick={switchTab} className="text-indigo-500 cursor-pointer">
          Đăng ký
        </span>
      </p>
    </form>
  );
}
