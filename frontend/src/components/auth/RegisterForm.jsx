import { useState } from "react"
import axios from "../../api/axios"

export default function RegisterForm({ switchTab }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [success, setSuccess] = useState("")

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      await axios.post("/auth/register", {
        username: email,
        email: email,
        password: password,
      })

      setSuccess("Đăng ký thành công! Hãy đăng nhập.")
    } catch {
      alert("Lỗi đăng ký")
    }
  }

  return (
    <form onSubmit={handleRegister}>
      <h2 className="text-2xl font-bold text-white mb-6">
        Tạo tài khoản ✨
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

      {success && (
        <p className="text-green-500 text-sm mb-4">{success}</p>
      )}

      <button className="w-full bg-violet-600 hover:bg-violet-500 rounded-lg py-2 text-white font-medium transition hover:scale-[1.02]">
        Đăng ký
      </button>

      <p className="text-sm text-zinc-400 mt-4 text-center">
        Đã có tài khoản?{" "}
        <span onClick={switchTab} className="text-indigo-500 cursor-pointer">
          Đăng nhập
        </span>
      </p>
    </form>
  )
}