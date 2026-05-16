import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  );
};

export const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
      <div className="divide-y divide-gray-200 bg-white">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex w-full items-center justify-between px-6 py-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 w-24" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
