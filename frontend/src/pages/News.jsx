import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import axios from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";

import {
  Search,
  Calendar,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  TrendingUp,
} from "lucide-react";

export default function News() {
  const { user, logout } = useAuth();

  const [articles, setArticles] = useState([]);

  // Logic Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  useEffect(() => {
    axios
      .get("/news")
      .then((res) => {
        setArticles(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const allArticles = articles;

  // Top bài viết
  const topArticles = allArticles.slice(0, 8);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = allArticles.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Inter',_sans-serif] text-slate-900 flex flex-col">
      {/* HEADER */}
      <header className="flex justify-between items-center px-12 py-6 bg-white border-b border-slate-100 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <span className="font-black text-xl">AI</span>
          </div>
          <h1 className="font-[900] text-xl tracking-tighter text-slate-800 uppercase">
            DermoScan
          </h1>
        </Link>

        <nav className="flex gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400 items-center">
          <Link to="/news" className="text-indigo-600">
            Tin Tức
          </Link>
          <Link to="/about" className="hover:text-indigo-600 transition-colors">
            Về chúng tôi
          </Link>

          {user ? (
            <button
              onClick={logout}
              className="bg-rose-50 text-rose-600 px-5 py-2 rounded-xl font-black"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/auth"
              className="bg-slate-900 text-white px-6 py-2 rounded-xl"
            >
              Login
            </Link>
          )}
        </nav>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-12">
          {/* LEFT */}
          <div className="lg:col-span-7">
            {/* SEARCH */}
            <div className="mb-12">
              <h2 className="text-4xl font-[900] tracking-tighter italic mb-6">
                Bản tin <span className="text-indigo-600">DermoScan</span>
              </h2>

              <div className="relative group">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />

                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full pl-14 pr-6 py-5 rounded-[24px] border border-slate-200 bg-white shadow-sm focus:outline-none font-bold text-sm"
                />
              </div>
            </div>

            {/* GRID POSTS */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="wait">
                {currentPosts.map((article) => (
                  <Link key={article.id} to={`/news/${article.slug}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
                    >
                      <div className="h-44 overflow-hidden">
                        <img
                          src={`http://localhost:8000${article.thumbnail}`}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                          {article.category}
                        </span>

                        <h3 className="font-[900] text-lg leading-tight mt-2 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {article.title}
                        </h3>

                        <p className="text-slate-400 text-[11px] font-bold mb-4 line-clamp-2 italic">
                          {article.excerpt}
                        </p>

                        <div className="mt-auto flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {article.created_at}
                          </span>

                          <ArrowRight size={14} className="text-indigo-300" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </AnimatePresence>
            </div>

            {/* PAGINATION */}
            <div className="mt-12 flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-4 rounded-2xl border border-slate-200"
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={() => setCurrentPage(1)}
                className={`w-12 h-12 rounded-2xl font-black text-xs ${currentPage === 1 ? "bg-indigo-600 text-white" : "bg-white text-slate-400 border"}`}
              >
                1
              </button>

              <button
                onClick={() => setCurrentPage(2)}
                className={`w-12 h-12 rounded-2xl font-black text-xs ${currentPage === 2 ? "bg-indigo-600 text-white" : "bg-white text-slate-400 border"}`}
              >
                2
              </button>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, 2))}
                className="p-4 rounded-2xl border border-slate-200"
                disabled={currentPage === 2}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          {/* RIGHT SIDEBAR */}
          <aside className="lg:col-span-3">
            <div className="bg-slate-900 rounded-[40px] p-8 text-white min-h-[1000px] sticky top-28">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-[900] flex items-center gap-2">
                  Hot <TrendingUp size={20} className="text-indigo-400" />
                </h3>
              </div>

              <div className="space-y-10">
                {topArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    to={`/news/${article.slug}`}
                    className="flex gap-5 group items-start"
                  >
                    <span className="text-4xl font-[900] text-slate-800 group-hover:text-indigo-500">
                      {index + 1}
                    </span>

                    <div className="space-y-1">
                      <h4 className="font-bold text-[13px] leading-snug line-clamp-2 italic">
                        {article.title}
                      </h4>

                      <div className="flex items-center gap-3 text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(article.created_at).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-12 flex justify-between items-center">
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            DermoScan AI{" "}
            <Heart size={12} className="text-rose-500 fill-rose-500" /> 2026
          </div>

          <div className="flex gap-6 text-[10px] font-black text-slate-400 uppercase">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
