import Skeleton from "../../../components/ui/Skeleton";

export default function RoomCardSkeleton() {
    return (
        <div className="flex w-full flex-col rounded-xl border p-5">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-3.5 w-24" />
                </div>

                <Skeleton className="h-4 w-14 rounded-full" />
            </div>

            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-3/5" />

            <div className="mt-4 flex items-center justify-end border-t pt-3">
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
    );
}
