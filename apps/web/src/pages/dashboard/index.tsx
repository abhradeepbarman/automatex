import Navbar from '@/components/common/navbar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import workflowService from '@/services/workflow.service';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { mutateAsync: createWorkflowFn, isPending } = useMutation({
    mutationFn: () => workflowService.createWorkflow(),
    onSuccess: (data) => navigate(`/workflow/${data.id}`),
    onError: (error: AxiosError<{ message: string }>) => {
      console.error('Create workflow failed:', error);
      toast.error('Create workflow failed', {
        description:
          error?.response?.data?.message ||
          'Unable to create workflow. Please try again.',
      });
    },
  });

  const handleCreateWorkflow = async () => {
    await createWorkflowFn();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="px-6 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Overview of your automation activity
              </p>
            </div>

            <Button
              className="h-10 w-37.5"
              onClick={handleCreateWorkflow}
              disabled={isPending}
            >
              {isPending ? 'Creating...' : 'Create new workflow'}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Workflows" value="12" />
            <StatCard title="Runs (30 days)" value="1,248" />
            <StatCard title="Errors" value="3" />
          </div>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent workflows</CardTitle>
              <CardDescription>
                Your most recently created automations
              </CardDescription>
            </CardHeader>

            <CardContent className="divide-y">
              <WorkflowItem
                name="Lead Sync Automation"
                status="Active"
                lastRun="2 hours ago"
              />
              <WorkflowItem
                name="Invoice Generator"
                status="Paused"
                lastRun="Yesterday"
              />
              <WorkflowItem
                name="Email Follow-up"
                status="Active"
                lastRun="3 days ago"
              />
            </CardContent>

            <div className="flex items-center justify-between border-t px-6 py-3">
              <p className="text-sm text-muted-foreground">Showing 1–3 of 12</p>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious />
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationLink isActive>1</PaginationLink>
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationLink>2</PaginationLink>
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationNext />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

const StatCard = ({ title, value }: { title: string; value: string }) => {
  return (
    <Card className="relative h-30 border-border/50 shadow-sm transition-shadow hover:shadow-md">
      <div className="absolute inset-y-0 left-0 w-1 bg-primary/70" />
      <CardContent className="flex h-full flex-col justify-center gap-1 p-6 pl-7">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">Last 30 days</p>
      </CardContent>
    </Card>
  );
};

const WorkflowItem = ({
  name,
  status,
  lastRun,
}: {
  name: string;
  status: 'Active' | 'Paused';
  lastRun: string;
}) => {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">Last run: {lastRun}</p>
      </div>

      <Button
        variant="outline"
        size="sm"
        className={
          status === 'Active'
            ? 'border-emerald-500/30 text-emerald-600'
            : 'text-muted-foreground'
        }
      >
        {status}
      </Button>
    </div>
  );
};
