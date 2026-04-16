const WeakAreaBanner = ({ topic }: { topic: string | null }) => {
  if (!topic) return null;

  return (
    <div className="bg-red-100 p-4 rounded-xl border border-red-300 mt-4">
      <p className="text-red-700 font-semibold">
        ⚠️ You are weak in <strong>{topic}</strong>.
      </p>
      <p className="text-red-600">Start targeted practice today.</p>
    </div>
  );
};

export default WeakAreaBanner;
