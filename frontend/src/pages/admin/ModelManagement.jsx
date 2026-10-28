import { useState } from "react";
// import { motion } from "framer-motion";
import {
  Cpu,
  Activity,
  ShieldCheck,
  Database,
  RefreshCw,
  Power,
} from "lucide-react";

export default function ModelManagement() {
  const [isActive, setIsActive] = useState(true);

  // Giả lập dữ liệu của model duy nhất hiện tại
  const currentModel = {
    name: "SkinCancer-AI-Classifier",
    version: "1.0.4",
    architecture: "CNN - ResNet50",
    lastTrained: "2026-02-15",
    accuracy: 88.4,
    parameters: "23.5M",
    labels: ["mel", "nv", "bcc", "bkl"],
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 font-['Inter',_sans-serif]">
      <header className="mb-10">
        <h1 className="text-3xl font-[900] text-slate-800 tracking-tight">
          Quản lý Model
        </h1>
        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">
          Hệ thống phân tích AI hiện tại
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* CARD THÔNG TIN CHÍNH */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
                <Cpu size={32} />
              </div>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`p-2 rounded-full transition-all ${isActive ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
              >
                <Power size={20} />
              </button>
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-1">
              {currentModel.name}
            </h2>
            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tighter">
              Phiên bản {currentModel.version}
            </span>

            <div className="mt-8 space-y-4">
              <InfoRow
                icon={<ShieldCheck size={16} />}
                label="Kiến trúc"
                value={currentModel.architecture}
              />
              <InfoRow
                icon={<Database size={16} />}
                label="Tham số"
                value={currentModel.parameters}
              />
              <InfoRow
                icon={<RefreshCw size={16} />}
                label="Huấn luyện"
                value={currentModel.lastTrained}
              />
            </div>
          </div>

          <div
            className={`p-6 rounded-[32px] border-2 transition-all ${isActive ? "border-emerald-100 bg-emerald-50/30" : "border-slate-100 bg-white"}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${isActive ? "bg-emerald-500" : "bg-slate-300"}`}
              />
              <span className="font-black text-sm uppercase tracking-widest text-slate-600">
                {isActive ? "Model đang hoạt động" : "Model đã tạm dừng"}
              </span>
            </div>
          </div>
        </div>

        {/* CARD HIỆU SUẤT CHI TIẾT */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm">
            <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-indigo-500" />
              Chỉ số hiệu năng (Metrics)
            </h3>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Vòng tròn Accuracy */}
              <div className="flex flex-col items-center justify-center p-6 border border-slate-50 rounded-[24px]">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-slate-100"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={364.4}
                      strokeDashoffset={
                        364.4 * (1 - currentModel.accuracy / 100)
                      }
                      className="text-indigo-600"
                    />
                  </svg>
                  <span className="absolute text-2xl font-[900] text-slate-800">
                    {currentModel.accuracy}%
                  </span>
                </div>
                <p className="mt-4 font-black text-[11px] text-slate-400 uppercase tracking-widest">
                  Độ chính xác tổng quát
                </p>
              </div>

              {/* Danh sách nhãn bệnh nhận diện được */}
              <div className="space-y-4">
                <p className="font-bold text-slate-500 text-sm">
                  Các nhãn nhận diện:
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentModel.labels.slice(0, 2).map((label) => (
                    <span
                      key={label}
                      className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700"
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <div className="pt-4 border-t border-slate-50">
                  <button className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    Cập nhật phiên bản mới
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <div className="flex items-center gap-2 text-slate-400 font-bold">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-black text-slate-700">{value}</span>
    </div>
  );
}
