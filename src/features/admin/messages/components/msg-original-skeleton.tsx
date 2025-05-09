export default function MessageOriginalSkeleton() {
  return (
    <div className="animate-pulse space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
      <div className="h-6 w-32 rounded bg-gray-200" />
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
      </div>
      <div className="rounded-lg bg-white p-4">
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
          <div className="h-4 w-4/6 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
