export default function NewsCard({ news }) {
  return (
    <div className="border rounded p-4 hover:shadow">
      <h3 className="font-bold">{news.title}</h3>
      <p className="text-sm text-gray-600">{news.summary}</p>
    </div>
  );
}
