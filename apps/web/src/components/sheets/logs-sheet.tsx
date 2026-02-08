import workflowService, {
  type IExecutionLog,
} from '@/services/workflow.service';
import apps from '@repo/common/@apps';
import { ExecutionStatus, StepType } from '@repo/common/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { cn, formatDate } from '@/lib/utils';

interface ILogsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LogsSheet = ({ open, onOpenChange }: ILogsSheetProps) => {
  const { id: workflowId } = useParams();
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['execution-logs', workflowId],
    queryFn: ({ pageParam = 1 }) =>
      workflowService.getExecutionLogs(workflowId!, 20, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.pagination.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: open && !!workflowId,
  });

  useEffect(() => {
    if (!observerTarget.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observerTarget.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getAppDetails = (appId: string) => {
    return apps.find((app) => app.id === appId);
  };

  const getStepDetails = (
    stepId: string,
    appId: string,
    stepType: StepType,
  ) => {
    const app = getAppDetails(appId);
    if (!app) return null;
    if (stepType == StepType.TRIGGER) {
      if (app.triggers && app.triggers.length > 0) {
        return app.triggers.find((trigger) => trigger.id === stepId);
      } else {
        return null;
      }
    }
    if (stepType == StepType.ACTION) {
      if (app.actions && app.actions.length > 0) {
        return app.actions.find((action) => action.id === stepId);
      } else {
        return null;
      }
    }
    return null;
  };

  const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
      case ExecutionStatus.COMPLETED:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case ExecutionStatus.FAILED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case ExecutionStatus.PENDING:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case ExecutionStatus.RUNNING:
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ExecutionStatus) => {
    switch (status) {
      case ExecutionStatus.COMPLETED:
        return 'bg-green-50 text-green-700 border-green-200';
      case ExecutionStatus.FAILED:
        return 'bg-red-50 text-red-700 border-red-200';
      case ExecutionStatus.PENDING:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case ExecutionStatus.RUNNING:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const allLogs = data?.pages.flatMap((page) => page.executionLogs) || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-hidden pb-0">
        <SheetHeader>
          <SheetTitle>Execution Logs</SheetTitle>
          <SheetDescription>
            View the execution history of your workflow
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading logs...</p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex flex-col items-center gap-2 text-center">
                <XCircle className="h-8 w-8 text-red-500" />
                <p className="text-sm text-muted-foreground">
                  Failed to load execution logs
                </p>
              </div>
            </div>
          ) : allLogs.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex flex-col items-center gap-2 text-center">
                <Clock className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No execution logs yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Logs will appear here when your workflow runs
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {allLogs.map((log: IExecutionLog, index: number) => {
                const app = getAppDetails(log.app_id);
                return (
                  <div
                    key={`${log.id}-${index}`}
                    className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* App Icon */}
                      <div className="shrink-0 mt-0.5">
                        {app?.icon ? (
                          <img
                            src={app.icon}
                            alt={app.name}
                            className="h-8 w-8 object-contain rounded"
                          />
                        ) : (
                          <div className="h-8 w-8 bg-muted rounded flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {log.app_id.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Log Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-sm font-medium truncate">
                            {app?.name || log.app_id}
                          </h4>
                          {getStatusIcon(log.status)}
                        </div>

                        {/* Step Name */}
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">
                          {
                            getStepDetails(
                              log.step_id,
                              log.app_id,
                              log.step_type,
                            )?.name
                          }
                        </p>

                        {/* Message */}
                        {log.message && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {log.message}
                          </p>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full border font-medium',
                              getStatusColor(log.status),
                            )}
                          >
                            {log.status}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted border">
                            {log.step_type}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(log.executed_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Intersection Observer Target */}
              <div ref={observerTarget} className="h-4" />

              {/* Loading More Indicator */}
              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Loading more...
                    </p>
                  </div>
                </div>
              )}

              {/* End of List Indicator */}
              {!hasNextPage && allLogs.length > 0 && (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground">
                    No more logs to load
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LogsSheet;
