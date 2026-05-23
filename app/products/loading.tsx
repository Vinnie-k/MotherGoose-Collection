export default function Loading() {
  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header skeleton */}
        <div className="mb-10 space-y-3">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-10 w-64 rounded" />
        </div>

        {/* Toolbar skeleton */}
        <div className="flex gap-4 mb-8">
          <div className="skeleton h-10 w-28 rounded" />
          <div className="skeleton h-10 w-36 rounded ml-auto" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton aspect-[3/4] rounded" />
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
