export default function ProductLoading() {
  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex gap-2 mb-10">
          {[60, 80, 100, 140].map((w) => (
            <div key={w} className={`skeleton h-3 w-${w === 60 ? '16' : w === 80 ? '20' : w === 100 ? '24' : '36'} rounded`} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image skeleton */}
          <div className="space-y-4">
            <div className="skeleton aspect-square w-full rounded" />
            <div className="flex gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="skeleton w-20 h-20 rounded" />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="skeleton h-3 w-32 rounded" />
              <div className="skeleton h-12 w-3/4 rounded" />
              <div className="skeleton h-4 w-40 rounded" />
            </div>
            <div className="skeleton h-14 w-48 rounded" />
            <div className="space-y-2">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton h-9 w-16 rounded" />
                ))}
              </div>
            </div>
            <div className="skeleton h-14 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
