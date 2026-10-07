export interface SkeletonProps {
    className?: string;
}

function Skeleton({ className = "" }: SkeletonProps) {
    return <div className={`animate-pulse rounded-md bg-white/10 ${className}`} />;
}

export default Skeleton;
