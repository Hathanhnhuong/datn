import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
import { 
  Users, Target, Award, ShieldCheck, Heart, 
  Linkedin, Mail, Globe, Sparkles
} from "lucide-react";

export default function About() {
  const { user, logout } = useAuth();

  const stats = [
    { label: "Độ chính xác AI", value: "95%+" },
    { label: "Người dùng tin tưởng", value: "50,000+" },
    { label: "Bác sĩ đối tác", value: "200+" },
    { label: "Giải thưởng công nghệ", value: "12" },
  ];

  const team = [
    {
      name: "TS. Nguyễn Văn A",
      role: "Founder & Lead AI Engineer",
      image: "https://i.pravatar.cc/150?u=1"
    },
    {
      name: "BS. Trần Thị B",
      role: "Chuyên gia Da liễu cố vấn",
      image: "https://i.pravatar.cc/150?u=2"
    },
    
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Inter',_sans-serif] text-slate-900 flex flex-col">
      {/* 1. HEADER (Đồng bộ) */}
      <header className="flex justify-between items-center px-12 py-6 bg-white border-b border-slate-100 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
            <span className="font-black text-xl">AI</span>
          </div>
          <h1 className="font-[900] text-xl tracking-tighter text-slate-800 uppercase">DermoScan</h1>
        </Link>
        <nav className="flex gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400 items-center">
          <Link to="/news" className="hover:text-indigo-600 transition-colors">Tin Tức</Link>
          <Link to="/about" className="text-indigo-600">Về chúng tôi</Link>
          {user ? (
            <button onClick={logout} className="bg-rose-50 text-rose-600 px-5 py-2 rounded-xl font-black">Logout</button>
          ) : (
            <Link to="/auth" className="bg-slate-900 text-white px-6 py-2 rounded-xl transition-all">Login</Link>
          )}
        </nav>
      </header>

      {/* 2. HERO SECTION - GIỚI THIỆU TẦM NHÌN */}
      <section className="relative py-24 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.span 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
          >
            Since 2026 • Made in Vietnam
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-[900] mt-8 tracking-tighter leading-[0.9] max-w-4xl mx-auto"
          >
            Sứ mệnh bảo vệ làn da Việt bằng <span className="text-indigo-600 italic">Trí tuệ nhân tạo.</span>
          </motion.h2>
          <p className="text-slate-400 mt-8 max-w-2xl mx-auto font-bold text-lg leading-relaxed italic">
            "Chúng tôi không thay thế bác sĩ, chúng tôi trao cho bạn công cụ mạnh mẽ nhất để hiểu và bảo vệ sức khỏe của chính mình."
          </p>
        </div>
        {/* Background trang trí */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[120px] opacity-50" />
      </section>

      {/* 3. CORE VALUES - GIÁ TRỊ CỐT LÕI (Bento Grid) */}
      <section className="max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-slate-900 rounded-[40px] p-12 text-white relative overflow-hidden group">
            <Target className="absolute -right-10 -bottom-10 text-white/5 group-hover:scale-110 transition-transform duration-700" size={300} />
            <h3 className="text-3xl font-[900] mb-6 relative z-10 italic">Tầm nhìn của chúng tôi</h3>
            <p className="text-slate-400 font-bold leading-relaxed max-w-xl relative z-10">
              DermoScan hướng tới việc trở thành ứng dụng AI da liễu hàng đầu khu vực, giúp giảm thiểu rủi ro ung thư da và các bệnh lý nguy hiểm thông qua việc sàng lọc sớm tại nhà.
            </p>
          </div>
          <div className="bg-indigo-600 rounded-[40px] p-12 text-white flex flex-col justify-between">
            <Award size={48} className="text-indigo-300" />
            <div>
              <h3 className="text-2xl font-[900] mb-2 italic">Cam kết</h3>
              <p className="text-indigo-100 text-sm font-bold">100% dữ liệu được bảo mật và phê duyệt bởi chuyên gia.</p>
            </div>
          </div>
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white border border-slate-100 p-10 rounded-[32px] text-center shadow-sm hover:shadow-xl transition-all">
              <h4 className="text-4xl font-[900] text-indigo-600 tracking-tighter mb-2">{stat.value}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TEAM SECTION - ĐỘI NGŨ */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-[900] tracking-tighter italic mb-4">Đội ngũ chuyên gia</h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Những người đứng sau công nghệ DermoScan</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {team.map((member, i) => (
              <motion.div whileHover={{ y: -10 }} key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm text-center group">
                <div className="w-32 h-32 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-indigo-600 rounded-[40px] rotate-6 scale-105 group-hover:rotate-12 transition-transform" />
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover rounded-[40px] relative z-10" />
                </div>
                <h4 className="text-xl font-[900] tracking-tight">{member.name}</h4>
                <p className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mt-2 mb-6">{member.role}</p>
                <div className="flex justify-center gap-4">
                  <Linkedin size={18} className="text-slate-300 hover:text-indigo-600 cursor-pointer" />
                  <Mail size={18} className="text-slate-300 hover:text-indigo-600 cursor-pointer" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LIÊN HỆ TÓM TẮT */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[48px] p-16">
          <Sparkles size={40} className="text-indigo-500 mx-auto mb-6" />
          <h3 className="text-3xl font-[900] tracking-tighter italic mb-4">Sẵn sàng hợp tác?</h3>
          <p className="text-slate-400 font-bold mb-10 max-w-lg mx-auto leading-relaxed uppercase text-xs tracking-widest">
            Chúng tôi luôn tìm kiếm sự hợp tác với các bệnh viện, phòng khám và các nhà nghiên cứu AI.
          </p>
          <button className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-[900] text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100">
            Liên hệ hợp tác ngay
          </button>
        </div>
      </section>

      {/* 6. FOOTER (Tối giản) */}
      <footer className="bg-white border-t border-slate-100 py-10 mt-auto">
         <div className="max-w-7xl mx-auto px-12 text-center">
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              © 2026 DermoScan AI. All Rights Reserved. Built with <Heart size={12} className="inline text-rose-500 fill-rose-500" />
            </div>
         </div>
      </footer>
    </div>
  );
}