// no-dd-sa:typescript-best-practices/boolean-prop-naming
import { useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  className?: string;
  showTotalItems?: boolean;
  disabled?: boolean;
}

export function PaginationNav({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  className = "",
  showTotalItems = true,
  disabled = false
}: Readonly<PaginationNavProps>) {
  const pages = useMemo(() => {
    const items = [];
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }

    return items;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <Pagination
        page={currentPage}
        total={totalPages}
        onChange={onPageChange}
        hasNextPage={currentPage < totalPages}
        hasPrevPage={currentPage > 1}
        className={className}
      >
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (!disabled && currentPage > 1) {
                  onPageChange(currentPage - 1);
                }
              }}
              aria-disabled={disabled || currentPage === 1}
              className={disabled || currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {pages[0] > 1 && (
            <>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!disabled) onPageChange(1);
                  }}
                  isActive={currentPage === 1}
                >
                  1
                </PaginationLink>
              </PaginationItem>
              {pages[0] > 2 && <PaginationEllipsis />}
            </>
          )}

          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (!disabled) onPageChange(page);
                }}
                isActive={currentPage === page}
                aria-disabled={disabled}
                className={disabled ? "pointer-events-none opacity-50" : ""}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {pages[pages.length - 1] < totalPages && (
            <>
              {pages[pages.length - 1] < totalPages - 1 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!disabled) onPageChange(totalPages);
                  }}
                  isActive={currentPage === totalPages}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (!disabled && currentPage < totalPages) {
                  onPageChange(currentPage + 1);
                }
              }}
              aria-disabled={disabled || currentPage === totalPages}
              className={disabled || currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      {showTotalItems && totalItems !== undefined && (
        <p className="text-muted-foreground text-sm">
          Total items: {totalItems}
        </p>
      )}
    </div>
  );
}
