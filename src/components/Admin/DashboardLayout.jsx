export default function DashboardLayout({ title, subtitle, children }) {
  return (
    <div className="w-full min-h-0 rounded-2xl bg-gray-50/80 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-primary-navy tracking-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm sm:text-base text-gray-600">{subtitle}</p>
        ) : null}
      </div>
      <div className="space-y-6 sm:space-y-8">{children}</div>
    </div>
  );
}
