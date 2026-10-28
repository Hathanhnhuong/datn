import { useState } from "react";
import api from "../../api/axios";

export default function CreateArticle() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const submit = async () => {
    await api.post("/news", { title, content });
    alert("Tạo thành công");
  };

  return (
    <div className="space-y-4">
      <input
        className="border p-2 w-full"
        placeholder="Tiêu đề"
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="border p-2 w-full"
        rows={5}
        placeholder="Nội dung"
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={submit} className="btn bg-blue-500 text-white">
        Đăng bài
      </button>
    </div>
  );
}
