import { useState, useMemo } from "react";
import axios from "../../api/axios";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function HealthInsightsChart({ data }) {
  const [timeRange, setTimeRange] = useState("7d");

  // Mock filter local
  const filteredData = useMemo(() => {
    if (!data) return [];

    if (timeRange === "7d") return data.slice(-7);
    if (timeRange === "30d") return data.slice(-30);
    return data;
  }, [timeRange, data]);

  const handleTimeChange = (range) => {
    setTimeRange(range);
  };

  return (
    <div className="backdrop-blur-lg bg-white/60 border border-white/10 shadow-lg rounded-2xl p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-700">
          Xu hướng chẩn đoán
        </h2>

        {/* Time Filter */}
        <div className="flex gap-2 backdrop-blur-md bg-white/40 p-1 rounded-xl border border-white/20">
          {[
            { label: "7 ngày", value: "7d" },
            { label: "30 ngày", value: "30d" },
            { label: "1 năm", value: "1y" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => handleTimeChange(item.value)}
              className={`px-3 py-1 text-sm rounded-lg transition-all duration-300
                ${
                  timeRange === item.value
                    ? "bg-blue-500/20 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-white/30"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={420}>
        <AreaChart key={timeRange} data={filteredData}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" interval="preserveStartEnd" />
          <YAxis />
          <Tooltip />

          <Area
            type="monotone"
            dataKey="count"
            stroke="#2563eb"
            strokeWidth={3}
            fill="url(#trendGradient)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}