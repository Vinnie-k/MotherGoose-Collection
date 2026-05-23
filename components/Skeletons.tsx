export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="skeleton aspect-[3/4]" />
          <div className="skeleton h-2.5 w-16 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
        </div>
      ))}
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div className="space-y-4">
        <div className="skeleton aspect-square" />
        <div className="flex gap-3">
          <div className="skeleton w-20 h-20" />
          <div className="skeleton w-20 h-20" />
        </div>
      </div>
      <div className="space-y-5">
        <div className="skeleton h-3 w-32 rounded" />
        <div className="skeleton h-12 w-3/4 rounded" />
        <div className="skeleton h-4 w-40 rounded" />
        <div className="skeleton h-10 w-44 rounded" />
        <div className="flex gap-2 mt-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-9 w-16 rounded" />)}
        </div>
        <div className="skeleton h-14 w-full rounded mt-2" />
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton aspect-[3/4]" />
      <div className="skeleton h-2.5 w-16 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-20 rounded" />
    </div>
  )
}
