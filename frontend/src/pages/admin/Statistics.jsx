import { useEffect, useState } from "react";
import axios from "../../api/axios";

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/admin/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy thống kê:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-6">Đang tải thống kê...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Thống kê hệ thống</h2>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white shadow p-4 rounded">
          <h3 className="text-lg font-semibold">Tổng người dùng</h3>
          <p className="text-2xl">{stats?.total_users}</p>
        </div>

        <div className="bg-white shadow p-4 rounded">
          <h3 className="text-lg font-semibold">Tổng chuẩn đoán</h3>
          <p className="text-2xl">{stats?.total_diagnoses}</p>
        </div>

        <div className="bg-white shadow p-4 rounded">
          <h3 className="text-lg font-semibold">Số model</h3>
          <p className="text-2xl">{stats?.total_models}</p>
        </div>
      </div>
    </div>
  );
}