import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminDashboardTableSkeletonProps {
  rows?: number;
}

export function AdminDashboardTableSkeleton({ rows = 6 }: AdminDashboardTableSkeletonProps) {
  return (
    <motion.tr
      key="skeletons"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <td colSpan={6} className="p-0">
        <div>
          {Array.from({ length: rows }).map((_, row) => (
            <div
              key={row}
              className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto_auto_auto] gap-4 items-center border-t p-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="hidden md:block">
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="hidden lg:block">
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="hidden sm:block h-4 w-24" />
              <Skeleton className="h-9 w-20 justify-self-start md:justify-self-end" />
            </div>
          ))}
        </div>
      </td>
    </motion.tr>
  );
}
