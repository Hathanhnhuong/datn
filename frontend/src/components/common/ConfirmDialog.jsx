export default function ConfirmDialog({ open, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded space-y-4">
        <p>Bạn chắc chắn?</p>
        <div className="flex gap-4">
          <button onClick={onConfirm} className="btn bg-red-500 text-white">
            Xóa
          </button>
          <button onClick={onCancel} className="btn">
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
