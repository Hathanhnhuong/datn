export default function UploadBox({ onUpload }) {
  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onUpload(file);
      }}
      className="border p-3 rounded w-full"
    />
  );
}
