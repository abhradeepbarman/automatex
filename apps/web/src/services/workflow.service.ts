import axiosInstance from '@/lib/axios';
import { WorkflowStatus } from '@repo/common/types';

export interface ICreateWorkflowResponse {
  id: string;
  name: string;
  userId: string;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
}

class WorkflowService {
  async createWorkflow(name?: string): Promise<ICreateWorkflowResponse> {
    const { data } = await axiosInstance.post('/workflow', {
      name,
    });

    return data.data;
  }
}

const workflowService = new WorkflowService();
export default workflowService;
