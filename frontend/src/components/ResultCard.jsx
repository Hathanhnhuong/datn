  export default function ResultCard({ result }) {

    // 🛑 nếu backend trả lỗi
    if (!result || !result.prediction) return null;

    const { predicted_class, confidence, probabilities, recommendation } = result.prediction;

    return (
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl">
        {/* Nội dung hiển thị kết quả AI */}
        <h3 className={`text-2xl font-[900] text-center uppercase tracking-tighter ${predicted_class === 'mel' ? 'text-rose-600' : 'text-emerald-600'}`}>
           {predicted_class === 'nv' ? 'Nốt ruồi (Nevus)' : 'Ung thư biểu mô (Melanoma)'}
        </h3>

        <p className="text-center">
          Độ tin cậy: {(confidence * 100).toFixed(2)}%
        </p>

        <div className="mt-4 space-y-1 text-sm">
          <div>Nevus: {(probabilities.nv * 100).toFixed(2)}%</div>
          <div className="text-red-600">
            Melanoma: {(probabilities.mel * 100).toFixed(2)}%
          </div>
        </div>

        {predicted_class === "mel" && (
          <div className="mt-4 bg-red-100 p-3 text-red-700">
            {recommendation}
          </div>
        )}
      </div>
    );
    
  }