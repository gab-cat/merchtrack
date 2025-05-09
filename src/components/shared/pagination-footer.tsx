import { memo } from "react";
import { Pagination } from "@/components/ui/pagination";

interface PaginationFooterProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  scrollToId?: string;
}

export const PaginationFooter = memo(({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  scrollToId = "#",
}: PaginationFooterProps) => {
  if (totalPages <= 0) return null;

  return (
    <div className="mt-4 flex items-center justify-between px-2">
      <div className="text-muted-foreground text-sm">
        Showing {(currentPage - 1) * itemsPerPage + 1}-
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
      </div>
      <Pagination
        page={currentPage}
        total={totalPages}
        onChange={onPageChange}
        hasNextPage={currentPage < totalPages}
        hasPrevPage={currentPage > 1}
        scrollToId={scrollToId}
      />
    </div>
  );
});

PaginationFooter.displayName = "PaginationFooter";