/**
 * Loading Skeleton Components
 * 
 * Reusable skeleton loaders for various content types
 */

export function CardSkeleton() {
    return (
        <div className="nordic-card p-4 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
            </div>
        </div>
    );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}

export function HeaderSkeleton() {
    return (
        <div className="animate-pulse mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
    );
}

export function FullPageSkeleton() {
    return (
        <div className="space-y-6">
            <HeaderSkeleton />
            <ListSkeleton count={6} />
        </div>
    );
}
