import Skeleton from '../UI/Skeleton';

export function FeaturedBlogSkeleton() {
  return <Skeleton className="aspect-[21/9] w-full rounded-3xl md:aspect-[3/1]" />;
}

export function BlogGridSkeleton({ count = 9 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Skeleton className="aspect-[16/10] w-full" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

