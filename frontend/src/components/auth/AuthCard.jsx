import { useState } from "react"
import LoginForm from "./LoginForm"
import RegisterForm from "./RegisterForm"

export default function AuthCard() {
  const [tab, setTab] = useState("login")

  return (
    <div className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl">

      <div className="flex mb-8 bg-zinc-800 rounded-lg p-1">
        <button
          onClick={() => setTab("login")}
          className={`flex-1 py-2 rounded-md text-sm transition ${
            tab === "login"
              ? "bg-indigo-600 text-white"
              : "text-zinc-400"
          }`}
        >
          Đăng nhập
        </button>

        <button
          onClick={() => setTab("register")}
          className={`flex-1 py-2 rounded-md text-sm transition ${
            tab === "register"
              ? "bg-indigo-600 text-white"
              : "text-zinc-400"
          }`}
        >
          Đăng ký
        </button>
      </div>

      {tab === "login" ? (
        <LoginForm switchTab={() => setTab("register")} />
      ) : (
        <RegisterForm switchTab={() => setTab("login")} />
      )}
    </div>
  )
}