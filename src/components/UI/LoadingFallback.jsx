import PageSkeleton from './PageSkeleton';

const LoadingFallback = () => {
  return (
    <div className="w-full min-h-[400px] py-8">
      <PageSkeleton />
    </div>
  );
};

export default LoadingFallback;

