import * as React from "react";
import { format } from "date-fns";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ExtendedLogs } from "@/types/logs";
import { Skeleton } from "@/components/ui/skeleton";

interface LogsTableProps {
  logs?: ExtendedLogs[];
  isLoading: boolean;
  onLogClick: (log: ExtendedLogs) => void;
}

export function LogsTable({ logs, isLoading, onLogClick }: Readonly<LogsTableProps>) {
  const [parent] = useAutoAnimate();

  if (isLoading) {
    return (
      <Card className="mx-auto max-w-6xl">
        <div className="max-w-6xl">
          <Table>
            <TableHeader>
              <TableRow className="font-bold text-primary">
                <TableHead>Date & Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="w-full">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(10)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    );
  }

  if (!logs?.length) {
    return null;
  }

  return (
    <Card className="mx-auto max-w-6xl">
      <div className="max-w-6xl">
        <Table>
          <TableHeader>
            <TableRow className="font-bold text-primary">
              <TableHead>Date & Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="w-full">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody ref={parent}>
            {logs.map((log) => (
              <TableRow 
                key={log.id}
                onClick={() => onLogClick(log)}
                className="cursor-pointer border hover:bg-primary-100"
              >
                <TableCell className="whitespace-nowrap font-mono">
                  {format(new Date(log.createdDate), "MMM d, yyyy HH:mm:ss")}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                </TableCell>
                <TableCell>{log.reason}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {log.createdBy ? `${log.createdBy.firstName} ${log.createdBy.lastName}` : 'System'}
                </TableCell>
                <TableCell className="max-w-md">
                  <div className="line-clamp-2">{log.systemText}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}