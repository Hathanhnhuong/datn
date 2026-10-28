import { useEffect, useState, useCallback } from "react";
import axios from "../../api/axios";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Download } from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DiagnosisHistory() {
  const [data, setData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    label: "",
    min_confidence: "",
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Palette màu sắc từ hình ảnh của bạn (Tím xanh và Đỏ hồng)
  const COLORS = ["#5c51e8", "#f43f5e", "#10b981", "#f59e0b"];

  /* ================= XỬ LÝ URL ẢNH ================= */
  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/150";
    const BASE = "http://127.0.0.1:8000";
    const cleanPath = path.replace(/\\/g, "/");
    return `${BASE}/${cleanPath.startsWith("/") ? cleanPath.slice(1) : cleanPath}`;
  };

  /* ================= FETCH DATA ================= */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (filters.label) params.label = filters.label;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.min_confidence) {
        params.min_confidence = Number(filters.min_confidence) / 100;
      }

      const res = await axios.get("/admin/diagnosis", { params });
      setData(res.data.items || []);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("/admin/diagnosis/analytics");
      setAnalytics(res.data);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

 

const exportCSV = async () => {
  try {
    const response = await axios.get(
      "http://127.0.0.1:8000/api/admin/diagnosis/export",
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "diagnosis_report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Export failed:", error);
  }
};

  const danger = (d) => d.predicted_class === "mel" || d.confidence < 0.7;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 text-slate-900">
      
      {/* ================= TOP METRICS (Giống hình image_aaf5c0) ================= */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <MetricCard title="Tổng số ca" value={analytics?.total || 0} />
        <MetricCard
          title="Độ chính xác TB"
          value={analytics?.avg_confidence ? `${(analytics.avg_confidence * 100).toFixed(1)}%` : "0%"}
        />
        <MetricCard
          title="Ca cần chú ý"
          value={analytics?.low_confidence || 0}
          danger
        />
      </div>

      {/* ================= CHARTS SECTION ================= */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <GlassCard>
          <h3 className="mb-4 font-bold text-slate-700">Số ca theo ngày</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.by_day || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickMargin={10} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="count" stroke="#5c51e8" strokeWidth={3} dot={{ r: 4, fill: '#5c51e8' }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-4 font-bold text-slate-700">Tỷ lệ bệnh lý</h3>
          <div className="flex flex-col items-center justify-center">
            {/* BIỂU ĐỒ TRÒN FULL */}
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics?.ratio || []}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  stroke="none"
                >
                  {(analytics?.ratio || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* PHẦN THÊM MỚI: CHÚ THÍCH SỐ CA MEL VÀ NV DƯỚI BIỂU ĐỒ */}
            <div className="flex gap-6 mt-6 w-full justify-center">
              {(analytics?.ratio || []).map((item, index) => (
                <div key={index} className="flex flex-col items-center px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 min-w-[120px]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                  </div>
                  <span className="text-xl font-black text-slate-800">{item.count}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Ca chẩn đoán</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ================= FILTERS ================= */}
      <GlassCard className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <input type="date" className="p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600 bg-white" onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} />
          <input type="date" className="p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600 bg-white" onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} />
          <select className="p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600 bg-white min-w-[150px]" onChange={(e) => setFilters({ ...filters, label: e.target.value })}>
            <option value="">Tất cả kết quả</option>
            <option value="mel">Melanoma (mel)</option>
            <option value="nv">Nevus (nv)</option>
          </select>
          <button onClick={exportCSV} className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5c51e8] text-white hover:bg-[#4a40d1] transition-all shadow-lg shadow-indigo-100 font-bold">
            <Download size={18} /> Xuất CSV
          </button>
        </div>
      </GlassCard>

      {/* ================= TABLE SECTION ================= */}
      <GlassCard>
        {loading ? (
          <div className="py-20 text-center text-slate-400 animate-pulse font-bold">ĐANG TẢI DỮ LIỆU...</div>
        ) : data.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-bold uppercase">Không có dữ liệu phù hợp.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 text-left uppercase text-[11px] tracking-[0.1em] font-black">
                  <th className="p-4">Ảnh</th>
                  <th className="p-4">Kết quả</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4 text-right">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4">
                      <img
                        src={getImageUrl(d.image_url)}
                        alt="Skin scan"
                        className="w-14 h-14 object-cover rounded-xl border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
                      />
                    </td>
                    <td className="p-4">
                      {danger(d) ? (
                        <span className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-xl font-black flex items-center gap-2 w-fit text-[11px] uppercase border border-rose-100">
                          <AlertTriangle size={14} /> {d.predicted_class}
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl font-black flex items-center gap-2 w-fit text-[11px] uppercase border border-emerald-100">
                          <CheckCircle size={14} /> {d.predicted_class}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`${danger(d) ? "bg-rose-400" : "bg-[#5c51e8]"} h-full`}
                            style={{ width: `${d.confidence * 100}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700 text-xs">{(d.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-right text-slate-500 font-bold text-xs">
                      {new Date(d.predicted_at).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function MetricCard({ title, value, danger }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 rounded-[24px] border transition-all ${
        danger
          ? "bg-rose-50 border-rose-100"
          : "bg-white border-slate-200 shadow-sm"
      }`}
    >
      <p
        className={`text-sm font-medium mb-2 ${
          danger ? "text-rose-500" : "text-slate-500"
        }`}
      >
        {title}
      </p>

      <h2
        className={`text-3xl font-semibold tracking-tight ${
          danger ? "text-rose-700" : "text-slate-900"
        }`}
      >
        {value}
      </h2>
    </motion.div>
  );
}

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-white border border-slate-100 rounded-[24px] p-8 shadow-sm ${className}`}>
      {children}
    </div>
  );
}