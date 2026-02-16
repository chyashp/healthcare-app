export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-gray-800" />
      <div className="h-4 w-72 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}
