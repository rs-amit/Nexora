import Skeleton from "../../../components/ui/Skeleton";
import RoomCardSkeleton from "./RoomCardSkeleton";

function StatCardSkeleton() {
    return (
        <div className="rounded-xl border p-5">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="mt-3 h-3.5 w-20" />
            <Skeleton className="mt-2 h-7 w-12" />
            <Skeleton className="mt-2 h-3 w-24" />
        </div>
    );
}

export default function WorkspaceSkeleton() {
    return (
        <div className="mx-auto w-full max-w-[1200px] p-6 text-white">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="w-full max-w-[520px]">
                    <Skeleton className="h-7 w-64" />
                    <Skeleton className="mt-2 h-4 w-full" />
                </div>
                <Skeleton className="h-9 w-32 rounded-lg" />
            </div>

            {/* Tabs */}
            <div className="mt-6 flex gap-6 border-b border-white/10 pb-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
            </div>

            <div className="mt-6">
                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <StatCardSkeleton key={index} />
                    ))}
                </div>

                {/* Rooms */}
                <div className="mt-8">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="mt-2 h-3.5 w-64" />
                        </div>
                        <Skeleton className="h-9 w-28 rounded-lg" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <RoomCardSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
