import { useEffect, useState } from "react";
import axios from "../../api/axios";

import { HealthInsightsChart } from "../../components/dashboard/HealthInsightsChart";
import { DiseaseDistributionChart } from "../../components/dashboard/DiseaseDistributionChart";

import {
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import {
  Users,
  Activity,
  FileText,
  AlertTriangle,
} from "lucide-react";

/* ===============================
   MAIN DASHBOARD
================================= */

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get("/admin/stats")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/50">
        <p className="text-gray-500 animate-pulse">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  const { metrics, health_insights } = data;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 to-blue-50/50 font-sans space-y-10 animate-fadeInUp">

      {/* ================= METRICS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng người dùng"
          value={metrics.total_users}
          icon={<Users size={20} />}
          color="blue"
          sparkline={metrics.user_trend}
        />

        <StatCard
          title="Tổng lượt chẩn đoán"
          value={metrics.total_diagnoses}
          icon={<Activity size={20} />}
          color="indigo"
          sparkline={metrics.diagnosis_trend_small}
        />

        <StatCard
          title="Số lượng bài viết"
          value={metrics.total_articles}
          icon={<FileText size={20} />}
          color="emerald"
          sparkline={metrics.article_trend}
        />

        <StatCard
          title="Cảnh báo Melanoma"
          value={metrics.melanoma_cases}
          icon={<AlertTriangle size={20} />}
          color="danger"
          highlight
          sparkline={metrics.melanoma_trend}
        />
      </div>

      {/* ================= MAIN 7:3 ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">

        {/* LEFT - HEALTH INSIGHTS */}
        <div className="lg:col-span-7">
          <HealthInsightsChart
            data={health_insights.diagnosis_trend}
          />
        </div>

        {/* RIGHT - DISEASE DISTRIBUTION */}
        <div className="lg:col-span-3">
          <DiseaseDistributionChart
            distribution={health_insights.disease_distribution}
            melTrendPercent={5} 
          />
        </div>

      </div>
    </div>
  );
}

/* ===============================
   STAT CARD COMPONENT
================================= */

function StatCard({
  title,
  value,
  icon,
  color,
  highlight,
  sparkline,
}) {
  const colorMap = {
    blue: "text-blue-600",
    indigo: "text-indigo-600",
    emerald: "text-emerald-500",
    danger: "text-red-500",
  };

  return (
    <div className="relative backdrop-blur-lg bg-white/60 border border-white/10 shadow-lg rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl">

      {/* Sparkline */}
      {sparkline && (
        <div className="absolute bottom-2 left-2 right-2 opacity-20">
          <ResponsiveContainer width="100%" height={40}>
            <LineChart data={sparkline}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-semibold text-slate-800 mt-2">
            {value}
          </p>
        </div>

        <div className={`relative ${colorMap[color]}`}>
          {highlight && (
            <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-50"></span>
          )}
          {icon}
        </div>
      </div>
    </div>
  );
}