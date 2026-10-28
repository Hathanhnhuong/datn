export default function LoadingSpinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );
}
