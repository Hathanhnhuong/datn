import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

export function DiseaseDistributionChart({
  distribution,
  currentMonthMel = 0,
  previousMonthMel = 0,
}) {
  const total = distribution.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const COLORS = {
    mel: "#ef4444",
    nv: "#10b981",
  };

  /* ===============================
     CALCULATE REAL PERCENT CHANGE
  ================================= */

  let melTrendPercent = 0;

  if (previousMonthMel > 0) {
    melTrendPercent =
      ((currentMonthMel - previousMonthMel) /
        previousMonthMel) *
      100;
  }

  const isIncrease = melTrendPercent >= 0;

  return (
    <div className="h-full backdrop-blur-lg bg-white/60 border border-white/10 shadow-lg rounded-2xl p-6 flex flex-col">

      {/* Title + Smart Insight */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-slate-700">
          Phân phối bệnh lý
        </h2>

        <div
          className={`flex items-center justify-center gap-1 text-xs mt-1
          ${
            isIncrease
              ? "text-red-500"
              : "text-emerald-500"
          }`}
        >
          {isIncrease ? (
            <TrendingUp size={14} />
          ) : (
            <TrendingDown size={14} />
          )}

          <span>
            Tỷ lệ nguy cơ cao (Mel){" "}
            {isIncrease ? "tăng" : "giảm"}{" "}
            {Math.abs(melTrendPercent).toFixed(1)}%
            so với tháng trước
          </span>
        </div>
      </div>

      {/* Donut */}
      <div className="relative flex items-center justify-center flex-1">
        <ResponsiveContainer width="100%" height={252}>
          <PieChart>
            <Pie
              data={distribution}
              dataKey="count"
              nameKey="label"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              animationDuration={1000}
            >
              {distribution.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    COLORS[entry.label?.toLowerCase()] ||
                    "#3b82f6"
                  }
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        {/* Center */}
        <div className="absolute text-center">
          <p className="text-sm text-slate-500">Tổng</p>
          <p className="text-2xl font-bold text-slate-800">
            {total}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-3">
        {distribution.map((item, index) => {
          const percentage = total
            ? ((item.count / total) * 100).toFixed(1)
            : 0;

          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-xl bg-white/50 hover:bg-white/70 transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      COLORS[item.label?.toLowerCase()] ||
                      "#3b82f6",
                  }}
                />
                <span className="text-sm font-medium text-slate-700">
                  {item.label}
                </span>
              </div>

              <div className="text-sm text-slate-600 text-right">
                <div className="font-semibold">
                  {item.count}
                </div>
                <div className="text-xs text-slate-400">
                  {percentage}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}