import { useState, useRef, useEffect } from "react";
import api from "../api/axios";
import UploadBox from "../components/UploadBox";
import ResultCard from "../components/ResultCard";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function Diagnose() {

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const handleUpload = async (file) => {

    // kiểm tra file ảnh
    if (!file.type.startsWith("image/")) {
      setError("⚠️ Vui lòng chọn file ảnh hợp lệ.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError(null);
    setResult(null);

    try {

      const endpoint = "/diagnosis/upload";

      const res = await api.post(endpoint, formData);

      setResult(res.data);

    } catch (err) {

      console.log("Lỗi trả về:", err.response?.data);

      const message =
        err.response?.data?.detail ||
        "Không thể kết nối với AI. Vui lòng thử lại.";

      setError(message);

    } finally {

      setLoading(false);

    }
  };

  const startCamera = async () => {

    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraActive(true);

    } catch (e) {

      setError("Không thể truy cập camera. Vui lòng kiểm tra quyền hoặc trình duyệt.");

    }

  };

  const stopCamera = () => {

    if (streamRef.current) {

      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;

    }

    setCameraActive(false);

  };

  const capturePhoto = async () => {

    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL("image/jpeg", 0.9);

    stopCamera();

    setLoading(true);
    setError(null);
    setResult(null);

    try {

      const res = await api.post("/diagnosis/capture", {
        image_base64: base64Image,
        filename: "camera_capture.jpg"
      });

      setResult(res.data);

    } catch (err) {

      console.log("Lỗi trả về:", err.response?.data);

      const message =
        err.response?.data?.detail ||
        "Không thể kết nối với AI. Vui lòng thử lại.";

      setError(message);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    return () => stopCamera();

  }, []);

  return (
    <div className="space-y-6">

      <UploadBox onUpload={handleUpload} />

      {loading && <LoadingSpinner />}

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-[24px] flex flex-col items-center gap-4 shadow-sm">

          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold">!</span>
          </div>

          <p className="text-rose-700 font-bold text-center uppercase text-sm tracking-tight">
            {error}
          </p>

        </div>
      )}

      {result && (
        <ResultCard
          result={result}
          isWarning={result.is_warning}
        />
      )}

      {cameraActive && (
        <div className="flex flex-col items-center gap-4">

          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="rounded-xl w-full max-w-md"
          />

          <div className="flex gap-4">

            <button
              onClick={capturePhoto}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Chụp ảnh
            </button>

            <button
              onClick={stopCamera}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg"
            >
              Huỷ
            </button>

          </div>

        </div>
      )}

      {!cameraActive && (
        <button
          onClick={startCamera}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Mở camera
        </button>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />

    </div>
  );
}