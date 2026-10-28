import AuthCard from "../components/auth/AuthCard"

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center relative overflow-hidden">
      
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-violet-900/20 blur-3xl opacity-40" />

      <AuthCard />
    </div>
  )
}