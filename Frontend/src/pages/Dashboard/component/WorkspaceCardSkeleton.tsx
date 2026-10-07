import Skeleton from "../../../components/ui/Skeleton";

export default function WorkspaceCardSkeleton() {
    return (
        <div
            className="
        flex
        h-[170px]
        w-full
        flex-col
        rounded-xl
        border
        p-5
      "
        >
            <Skeleton className="h-12 w-12 rounded-xl" />

            <div className="mt-4">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="mt-3 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-4/5" />
            </div>
        </div>
    );
}
