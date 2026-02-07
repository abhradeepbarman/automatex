import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { useEffect, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  PlayCircle,
} from 'lucide-react';
import workflowService, {
  type IExecutionLog,
} from '@/services/workflow.service';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ExecutionStatus } from '@repo/common/types';

interface LogsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId?: string;
}

const LogsSheet = ({ open, onOpenChange, workflowId }: LogsSheetProps) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ['workflow-logs', workflowId],
      queryFn: ({ pageParam }) =>
        workflowService.getWorkflowExecutionLogs(workflowId!, 20, pageParam),
      getNextPageParam: (lastPage) =>
        lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
      enabled: open && !!workflowId,
      initialPageParam: 1,
    });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case ExecutionStatus.COMPLETED:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case ExecutionStatus.FAILED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case ExecutionStatus.RUNNING:
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case ExecutionStatus.PENDING:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case ExecutionStatus.COMPLETED:
        return 'text-green-600';
      case ExecutionStatus.FAILED:
        return 'text-red-600';
      case ExecutionStatus.RUNNING:
        return 'text-blue-600';
      case ExecutionStatus.PENDING:
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const allLogs =
    data?.pages.flatMap((page) => page.executionLogs) ??
    ([] as IExecutionLog[]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 w-full sm:max-w-lg">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Execution Logs</SheetTitle>
          <SheetDescription>View workflow execution history</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : allLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p className="text-sm">No execution logs found</p>
            </div>
          ) : (
            <div className="divide-y">
              {allLogs.map((log) => (
                <div
                  key={log.id}
                  className="px-6 py-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getStatusIcon(log.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium text-sm">
                          {log.step_name}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(log.executed_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs font-medium capitalize ${getStatusColor(log.status)}`}
                        >
                          {log.status.toLowerCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {log.step_type.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div ref={observerTarget} className="py-4 flex justify-center">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading more...</span>
                  </div>
                )}
                {!hasNextPage && allLogs.length > 0 && (
                  <p className="text-xs text-muted-foreground">End of logs</p>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LogsSheet;
