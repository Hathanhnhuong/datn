import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import { useAuth } from "../hooks/useAuth"; 
import axios from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, ShieldCheck, Zap, BarChart3, Camera, RefreshCcw, 
  AlertTriangle, CheckCircle2, Mail, Phone, MapPin, 
  Facebook, Twitter, Instagram, Heart, XCircle 
} from "lucide-react";

export default function Home() {
  const { user, logout } = useAuth(); 
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  // Logic Camera bổ sung
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ================= XỬ LÝ CHUNG CHO CẢ FILE & CAMERA =================
  const processDiagnosis = async (file) => {
    if (!file) return;
    
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/diagnosis/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Không thể kết nối với AI. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleClickUpload = () => {
    if (cameraActive) stopCamera();
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processDiagnosis(file);
  };

  // ================= LOGIC CAMERA BỔ SUNG =================
  const startCamera = async () => {
    try {
      setPreview(null);
      setResult(null);
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (e) {
      setError("Không thể truy cập camera. Vui lòng kiểm tra quyền.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      stopCamera();
      processDiagnosis(file);
    }, "image/jpeg", 0.9);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Inter',_sans-serif] text-slate-900 flex flex-col">
      
      {/* 1. HEADER */}
      <header className="flex justify-between items-center px-12 py-6 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
            <span className="font-black text-xl">AI</span>
          </div>
          <div>
            <h1 className="font-[900] text-xl tracking-tighter text-slate-800">DermoScan</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none">AI Dermatology</p>
          </div>
        </Link>

        <nav className="hidden md:flex gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400 items-center">
          <Link to="/news" className="hover:text-indigo-600 transition-colors">Tin Tức</Link>
          <Link to="/about" className="hover:text-indigo-600 transition-colors">Về chúng tôi</Link>
          
          {user && user.role === "admin" && (
            <Link to="/admin/dashboard" className="text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Admin Panel
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-6 pl-6 border-l border-slate-100">
              <div className="text-right">
                <p className="text-[10px] text-slate-500 lowercase font-medium italic leading-none">{user.email}</p>
              </div>
              <button 
                onClick={logout}
                className="bg-rose-50 text-rose-600 px-5 py-2 rounded-xl hover:bg-rose-600 hover:text-white transition-all font-black shadow-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
            >
              Login
            </Link>
          )}
        </nav>
      </header>

      {/* 2. HERO SECTION */}
      <section className="text-center mt-12 px-6">
        <motion.span 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100"
        >
          ⚡ Chẩn đoán AI tức thì
        </motion.span>

        <h2 className="text-6xl font-[900] mt-8 tracking-tighter leading-[0.95]">
          Kiểm tra da <br />
          <span className="text-indigo-600">Ngay lập tức.</span>
        </h2>

        <p className="text-slate-400 mt-6 max-w-lg mx-auto font-bold text-sm leading-relaxed">
          Sử dụng công nghệ trí tuệ nhân tạo để phân tích tình trạng da của bạn chỉ trong vài giây qua ảnh chụp.
        </p>

        <div className="flex justify-center gap-4 mt-8">
          <Badge icon={<Zap size={14}/>} text="Kết quả tức thì" />
          <Badge icon={<ShieldCheck size={14}/>} text="Bảo mật & Riêng tư" />
          <Badge icon={<BarChart3 size={14}/>} text="Độ chính xác cao" />
        </div>
      </section>

      {/* 3. MAIN CARDS CONTAINER */}
      <section className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto mt-20 px-6 pb-20 flex-1">
        {/* UPLOAD CARD */}
        <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-xl shadow-slate-200/50">
          <h3 className="text-xl font-[900] mb-2 tracking-tight">Tải ảnh lên</h3>
          <p className="text-sm text-slate-400 font-bold mb-8 uppercase tracking-widest text-[10px]">Yêu cầu ảnh rõ nét, đủ ánh sáng</p>

          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

          <div
            onClick={!cameraActive ? handleClickUpload : undefined}
            className={`group border-2 border-dashed border-slate-200 rounded-[32px] h-80 flex flex-col items-center justify-center text-slate-300 transition-all relative overflow-hidden ${!cameraActive && 'hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer'}`}
          >
            {cameraActive ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-[30px]" />
            ) : preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover rounded-[30px]" />
            ) : (
              <>
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-indigo-500" size={28} />
                </div>
                <p className="font-black text-slate-700 uppercase text-xs tracking-widest">Kéo thả ảnh vào đây</p>
                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">PNG, JPG tối đa 10MB</p>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {!cameraActive ? (
              <button 
                onClick={startCamera}
                className="flex items-center justify-center gap-2 bg-slate-900 text-white rounded-2xl py-4 text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
              >
                <Camera size={18} /> Chụp ảnh
              </button>
            ) : (
              <button 
                onClick={capturePhoto}
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-2xl py-4 text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
              >
                <Camera size={18} /> Chụp ngay
              </button>
            )}
            
            <button 
              onClick={cameraActive ? stopCamera : handleClickUpload} 
              className="flex items-center justify-center gap-2 border border-slate-200 rounded-2xl py-4 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              {cameraActive ? <><XCircle size={18} /> Hủy</> : <><RefreshCcw size={18} /> Chọn lại</>}
            </button>
          </div>
        </div>

        {/* RESULT CARD */}
        <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
          {!preview && !loading && !result && !error && (
            <div className="text-center">
              <div className="w-24 h-24 rounded-[32px] bg-slate-50 flex items-center justify-center text-indigo-500 mx-auto mb-6">
                <CheckCircle2 size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-[900] tracking-tight text-slate-800 uppercase">Sẵn sàng phân tích</h3>
              <p className="text-xs text-slate-400 mt-3 font-bold max-w-[200px] mx-auto uppercase tracking-wider">
                Tải ảnh lên để nhận báo cáo chẩn đoán chi tiết từ AI
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center">
               <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
               </div>
               <p className="text-indigo-600 font-[900] uppercase text-[11px] tracking-[0.2em] animate-pulse">
                AI đang phân tích...
              </p>
            </div>
          )}

          {error && (
            <div className="text-center p-6 bg-rose-50 rounded-3xl border border-rose-100">
              <AlertTriangle className="text-rose-500 mx-auto mb-4" size={40} />
              <p className="text-rose-600 font-black text-sm uppercase">{error}</p>
            </div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
              <div className="flex items-center gap-2 mb-8 justify-center">
                <div className="h-[1px] w-12 bg-slate-100"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Kết quả chẩn đoán</span>
                <div className="h-[1px] w-12 bg-slate-100"></div>
              </div>

              <div className={`p-8 rounded-[32px] border-2 text-center ${result.predicted_class === 'mel' ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <p className={`text-[11px] font-[900] uppercase tracking-widest mb-2 ${result.predicted_class === 'mel' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  Phát hiện loại bệnh:
                </p>
                <h3 className={`text-5xl font-[900] tracking-tighter mb-4 ${result.predicted_class === 'mel' ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {result.predicted_class.toUpperCase()}
                </h3>
                
                <div className="flex items-center justify-center gap-4">
                  <div className="bg-white/50 px-4 py-2 rounded-xl border border-white">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Độ tin cậy</p>
                    <p className="text-lg font-[900] text-slate-800">{(result.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                <p className="text-xs text-slate-500 font-bold leading-relaxed italic">
                  * Lưu ý: Kết quả này được tạo bởi AI và chỉ mang tính chất tham khảo. Vui lòng tham khảo ý kiến bác sĩ chuyên khoa.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden"></canvas>

      {/* 4. FOOTER */}
      <footer className="bg-slate-900 text-white pt-20 pb-10 mt-auto shrink-0">
        <div className="max-w-7xl mx-auto px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <span className="font-black text-xl">AI</span>
                </div>
                <h2 className="font-[900] text-xl tracking-tighter uppercase">DermoScan</h2>
              </div>
              <p className="text-slate-400 text-sm font-bold leading-relaxed">
                Tiên phong trong việc ứng dụng Trí tuệ nhân tạo vào sàng lọc và chẩn đoán bệnh lý da liễu tại Việt Nam.
              </p>
              <div className="flex gap-4">
                <SocialIcon icon={<Facebook size={18} />} />
                <SocialIcon icon={<Twitter size={18} />} />
                <SocialIcon icon={<Instagram size={18} />} />
              </div>
            </div>

            <div>
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-indigo-400 mb-8">Dịch vụ</h3>
              <ul className="space-y-4 text-sm font-bold text-slate-300">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Kiểm tra da AI</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Tra cứu bệnh lý</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Tìm kiếm bác sĩ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-indigo-400 mb-8">Thông tin</h3>
              <ul className="space-y-4 text-sm font-bold text-slate-300">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Điều khoản sử dụng</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Chính sách bảo mật</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Miễn trừ trách nhiệm</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-indigo-400 mb-8">Liên hệ</h3>
              <ul className="space-y-4 text-sm font-bold text-slate-300">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-indigo-500 shrink-0" />
                  <span>Phú Diễn, Hà Nội</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-indigo-500 shrink-0" />
                  <span>035 999 3813</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-indigo-500 shrink-0" />
                  <span>22111060965@hunre.edu.vn</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              © 2026 DermoScan AI. Build with <Heart size={12} className="text-rose-500 fill-rose-500" /> for Healthcare.
            </div>
            <div className="max-w-md text-right text-[10px] font-bold text-slate-600 leading-tight uppercase tracking-tighter">
              Cảnh báo: Hệ thống AI không thay thế cho chẩn đoán y khoa chuyên nghiệp từ bác sĩ da liễu.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Badge({ icon, text }) {
  return (
    <div className="flex items-center gap-2 px-5 py-2.5 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-500 bg-white shadow-sm shadow-slate-100 uppercase tracking-wider">
      <span className="text-indigo-500">{icon}</span>
      {text}
    </div>
  );
}

function SocialIcon({ icon }) {
  return (
    <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-lg">
      {icon}
    </a>
  );
}