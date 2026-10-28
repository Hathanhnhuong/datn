import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { motion } from "framer-motion";
import { Calendar, User, ArrowLeft, Share2, ChevronRight } from "lucide-react";

export default function NewsDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`/news/${slug}`)
      .then(res => {
        setArticle(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!article) return <div className="text-center py-20 font-bold text-slate-400">Không tìm thấy bài viết.</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#fcfcfd] pb-20"
    >
      {/* 1. THANH ĐIỀU HƯỚNG PHỤ */}
      <div className="bg-white/70 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
          <Link to="/" className="hover:text-indigo-600">Trang chủ</Link>
          <ChevronRight size={12} />
          <Link to="/news" className="hover:text-indigo-600">Tin tức</Link>
          <ChevronRight size={12} />
          <span className="text-slate-800 truncate">Chi tiết</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto pt-12 px-6">
        {/* 2. TIÊU ĐỀ & META */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-[900] text-slate-900 tracking-tighter leading-[1.1] mb-8">
            {article.title}
          </h1>
          
          <div className="flex items-center gap-6 border-y border-slate-100 py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <User size={16} />
              </div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-tight">DermoScan Editor</span>
            </div>
            <div className="text-slate-300">|</div>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
              <Calendar size={14} />
              <span>{new Date().toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </header>

        {/* 3. HÌNH ẢNH ĐẠI DIỆN */}
        <figure className="mb-12">
          <img
            src={`http://localhost:8000${article.thumbnail}`}
            alt={article.title}
            className="w-full aspect-video object-cover rounded-[32px] shadow-2xl shadow-indigo-100/50"
          />
          <figcaption className="text-center text-xs text-slate-400 mt-4 font-medium italic">
            Hình ảnh minh họa cho bài viết: {article.title}
          </figcaption>
        </figure>

        {/* 4. NỘI DUNG CHI TIẾT (CĂN LỀ & DÃN DÒNG) */}
        <div 
          className="news-rich-text 
            text-slate-700 
            text-lg 
            leading-relaxed 
            text-justify 
            selection:bg-indigo-100 
            selection:text-indigo-900"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* 5. PHẦN KẾT BÀI */}
        <footer className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center">
          <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-black text-[11px] uppercase tracking-widest">
            <Share2 size={16} /> Chia sẻ bài viết
          </button>
          <Link to="/news" className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">
            Xem tin khác
          </Link>
        </footer>
      </div>

      {/* CSS INJECT ĐỂ XỬ LÝ CÁC THẺ HTML TRONG CONTENT */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Bôi đen và dãn cách các đầu mục */
        .news-rich-text h2, .news-rich-text h3 {
          color: #0f172a; /* slate-900 */
          font-weight: 900;
          letter-spacing: -0.025em;
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
          text-align: left; /* Tiêu đề không nên justify */
        }
        .news-rich-text h2 { font-size: 1.875rem; line-height: 1.2; }
        .news-rich-text h3 { font-size: 1.5rem; line-height: 1.3; }

        /* Dãn dòng cho đoạn văn */
        .news-rich-text p {
          margin-bottom: 1.75rem;
        }

        /* Bôi đậm các từ quan trọng trong nội dung */
        .news-rich-text strong {
          color: #1e293b; /* slate-800 */
          font-weight: 800;
        }

        /* Xử lý danh sách */
        .news-rich-text ul, .news-rich-text ol {
          margin-bottom: 1.75rem;
          padding-left: 1.5rem;
        }
        .news-rich-text li {
          margin-bottom: 0.5rem;
        }

        /* Xử lý ảnh trong nội dung */
        .news-rich-text img {
          border-radius: 1.5rem;
          margin: 2.5rem 0;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
      `}} />
    </motion.div>
  );
}