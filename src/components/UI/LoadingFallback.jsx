import Loader from './Loader';

const LoadingFallback = () => {
  return (
    <div className="w-full min-h-[400px] flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <Loader size="large" />
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;

