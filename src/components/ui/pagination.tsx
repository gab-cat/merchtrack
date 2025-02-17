import { type HTMLAttributes } from "react";
import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button , ButtonProps, buttonVariants } from "@/components/ui/button";



type PaginationProps = {
  page: number;
  total: number;
  onChange: (page: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>;

export function Pagination({
  page,
  total,
  onChange,
  hasNextPage,
  hasPrevPage,
  className = "",
  ...props
}: Readonly<PaginationProps>) {
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= total) {
      onChange(newPage);
    }
  };

  return (
    <div 
      className={cn("flex items-center justify-center gap-1", className)}
      {...props}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(1)}
        disabled={!hasPrevPage}
      >
        First
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(page - 1)}
        disabled={!hasPrevPage}
      >
        Previous
      </Button>
      <span className="mx-2 text-sm">
        Page {page} of {total}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(page + 1)}
        disabled={!hasNextPage}
      >
        Next
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(total)}
        disabled={!hasNextPage}
      >
        Last
      </Button>
    </div>
  );
}

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
  href: string;
} & Pick<ButtonProps, "size"> & 
  Omit<React.ComponentProps<"a">, "href">

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  onClick,
  children,
  ...props
}: PaginationLinkProps) => (
  <Link
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    onClick={onClick}
    {...props}
  >
    {children}
  </Link>
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="size-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="size-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="size-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
