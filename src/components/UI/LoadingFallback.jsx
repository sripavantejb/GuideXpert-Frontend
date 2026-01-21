const LoadingFallback = () => {
  return (
    <div className="w-full min-h-[400px] flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-blue-200 border-t-primary-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;

