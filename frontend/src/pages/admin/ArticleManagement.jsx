import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Eye, FileText, X, ChevronLeft, ChevronRight, Edit3, Trash2, AlertTriangle } from "lucide-react";

const BASE_URL = "http://127.0.0.1:8000";

export default function ArticleManagement() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // Lưu ID bài viết cần xóa

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 5;

  const fetchArticles = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/news`, {
        params: { search, category, page: currentPage, limit }
      });
      if (res.data && res.data.items) {
        setArticles(res.data.items);
        setTotalItems(res.data.total);
        setTotalPages(res.data.total_pages);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => { setCurrentPage(1); }, [search, category]);
  useEffect(() => { fetchArticles(); }, [currentPage, search, category]);

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/admin/news/${deleteConfirm}`);
      setDeleteConfirm(null);
      fetchArticles();
    } catch (err) {
      alert("Lỗi khi xóa bài viết");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "published" ? "draft" : "published";
      await axios.patch(`${BASE_URL}/api/admin/news/${id}/status`, null, { params: { status: newStatus } });
      setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    } catch (err) { console.error(err); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 font-sans">
      
      {/* METRICS */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <GlassCard icon={<FileText />} title="Tổng bài viết" value={totalItems} />
        <GlassCard icon={<Eye />} title="Tổng lượt xem" value={articles.reduce((sum, a) => sum + (a.views || 0), 0)} />
      </div>

      {/* TOOLBAR */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <input type="text" placeholder="Tìm kiếm..." className="pl-9 pr-4 py-2 rounded-xl bg-white/40 backdrop-blur-md border border-white/30 outline-none" onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="px-4 py-2 rounded-xl bg-white/40 backdrop-blur-md border border-white/30 outline-none cursor-pointer" onChange={(e) => setCategory(e.target.value)}>
            <option value="">Tất cả danh mục</option>
            <option value="melanoma">Melanoma</option>
            <option value="prevention">Prevention</option>
            <option value="general">General</option>
          </select>
        </div>
        <button onClick={() => { setEditingArticle(null); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium shadow-lg shadow-indigo-200">
          <Plus size={16} /> Viết bài mới
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40 overflow-hidden shadow-xl">
        <div className="min-h-[400px]">
          {articles.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-6 py-4 border-b border-white/20 hover:bg-white/40 transition">
              <div className="flex items-center gap-4">
                <img src={a.thumbnail ? `${BASE_URL}/${a.thumbnail.replace(/^\//, '')}` : "https://via.placeholder.com/150"} alt="" className="w-14 h-14 object-cover rounded-xl bg-gray-200 border border-white/50" />
                <div>
                  <h2 className="font-semibold text-slate-800 line-clamp-1">{a.title}</h2>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-700 font-bold">{a.category}</span>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold ${a.status === "published" ? "bg-green-500/20 text-green-700" : "bg-gray-400/20 text-gray-700"}`}>{a.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm font-medium text-slate-600 w-20 text-right">{a.views || 0} views</span>
                <div className="flex items-center gap-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={a.status === "published"} onChange={() => toggleStatus(a.id, a.status)} className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                  <button onClick={() => { setEditingArticle(a); setShowModal(true); }} className="p-2 text-slate-600 hover:bg-white/50 rounded-lg transition"><Edit3 size={18} /></button>
                  <button onClick={() => setDeleteConfirm(a.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="px-6 py-4 bg-white/20 flex justify-between items-center border-t border-white/10">
          <p className="text-sm text-slate-600 font-medium">Trang <span className="text-indigo-600">{currentPage}</span> / {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-lg bg-white/40 hover:bg-white/60 disabled:opacity-20"><ChevronLeft size={18} /></button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-9 h-9 rounded-lg text-sm font-bold ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-white/40'}`}>{i + 1}</button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-lg bg-white/40 hover:bg-white/60 disabled:opacity-20"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {/* MODAL SOẠN THẢO/CHỈNH SỬA */}
        {showModal && (
          <ArticleModal 
            onClose={() => { setShowModal(false); setEditingArticle(null); }} 
            onSuccess={fetchArticles} 
            data={editingArticle} 
          />
        )}

        {/* MODAL XÁC NHẬN XÓA TÙY CHỈNH */}
        {deleteConfirm && (
          <ConfirmModal 
            title="Xác nhận xóa?" 
            message="Hành động này không thể hoàn tác. Bài viết sẽ bị xóa vĩnh viễn khỏi hệ thống."
            onConfirm={handleDelete}
            onCancel={() => setDeleteConfirm(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- COMPONENTS HỖ TRỢ ---

function GlassCard({ icon, title, value }) {
  return (
    <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
      <div className="p-3 bg-white/40 rounded-xl text-slate-700">{icon}</div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{title}</p>
        <h2 className="text-2xl font-bold text-slate-800">{value}</h2>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm mb-8">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition">Hủy</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition shadow-lg shadow-red-200">Xóa bài</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ArticleModal({ onClose, onSuccess, data }) {
  const isEdit = !!data;
  const [form, setForm] = useState({
    title: data?.title || "",
    slug: data?.slug || "",
    category: data?.category || "general",
    content: data?.content || "",
    source: data?.source || "",
    thumbnail: null
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title || !form.content) return alert("Vui lòng nhập đủ thông tin");
    setLoading(true);
    try {
      let articleId = data?.id;
      
      if (isEdit) {
        // Cập nhật bài viết (PUT)
        await axios.put(`${BASE_URL}/api/admin/news/${articleId}`, {
          title: form.title, slug: form.slug, category: form.category, content: form.content, source: form.source
        });
      } else {
        // Tạo mới bài viết (POST)
        const res = await axios.post(`${BASE_URL}/api/admin/news`, { ...form, status: "published" });
        articleId = res.data.id;
      }

      // Xử lý upload ảnh nếu có file mới chọn
      if (form.thumbnail && articleId) {
        const formData = new FormData();
        formData.append("file", form.thumbnail);
        await axios.post(`${BASE_URL}/api/admin/news/${articleId}/thumbnail`, formData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      alert("Thao tác thất bại");
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white/70 backdrop-blur-2xl border border-white/40 rounded-3xl w-full max-w-xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">{isEdit ? "Chỉnh sửa bài viết" : "Soạn thảo bài viết mới"}</h2>
          <X onClick={onClose} className="cursor-pointer text-slate-400 hover:text-slate-800" />
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Tiêu đề</label>
            <input value={form.title} className="w-full p-3 rounded-xl bg-white/50 border border-white/30 outline-none focus:ring-2 ring-indigo-500/20" onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Slug (Đường dẫn)</label>
            <input value={form.slug} className="w-full p-3 rounded-xl bg-white/50 border border-white/30 outline-none" onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Ảnh đại diện {isEdit && "(Chọn để thay đổi)"}</label>
            <input type="file" accept="image/*" className="w-full p-2 rounded-xl bg-white/50 border border-white/30 text-sm" onChange={(e) => setForm({ ...form, thumbnail: e.target.files[0] })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Danh mục</label>
              <select className="w-full p-3 rounded-xl bg-white/50 border border-white/30 outline-none" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="melanoma">Melanoma</option>
                <option value="prevention">Prevention</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Nguồn bài viết</label>
              <input value={form.source} className="w-full p-3 rounded-xl bg-white/50 border border-white/30 outline-none" onChange={(e) => setForm({ ...form, source: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Nội dung chi tiết</label>
            <textarea rows={5} value={form.content} className="w-full p-3 rounded-xl bg-white/50 border border-white/30 outline-none" onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <button onClick={handleSubmit} disabled={loading} className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">
            {loading ? "Đang lưu..." : isEdit ? "CẬP NHẬT BÀI VIẾT" : "XÁC NHẬN ĐĂNG BÀI"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}