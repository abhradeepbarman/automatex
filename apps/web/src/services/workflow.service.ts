import axiosInstance from '@/lib/axios';
import { WorkflowStatus } from '@repo/common/types';
import type { Node } from '@xyflow/react';

export interface ICreateWorkflowResponse {
  id: string;
  name: string;
  userId: string;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IGetWorkflowResponse {
  id: string;
  name: string;
  userId: string;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
  steps: {
    id: string;
    type: string;
    appId: string;
    actionId: string;
    connectionId: string;
    workflowId: string;
    createdAt: string;
    updatedAt: string;
    lastExecutedAt: string;
    metadata: Node;
  }[];
}

export interface IGetAllWorkflowsResponse {
  workflows: Array<{
    id: string;
    name: string;
    userId: string;
    status: WorkflowStatus;
    createdAt: string;
    updatedAt: string;
    lastExecutedAt: string | null;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class WorkflowService {
  async createWorkflow(name?: string): Promise<ICreateWorkflowResponse> {
    const { data } = await axiosInstance.post('/workflow', {
      name,
    });

    return data.data;
  }

  async deleteWorkflow(workflowId: string) {
    const { data } = await axiosInstance.delete(`/workflow/${workflowId}`);
    return data.data;
  }

  async getWorkflow(workflowId: string): Promise<IGetWorkflowResponse> {
    const { data } = await axiosInstance.get(`/workflow/${workflowId}`);
    return data.data;
  }

  async getAllWorkflows(
    page: number = 1,
    limit: number = 10,
  ): Promise<IGetAllWorkflowsResponse> {
    const { data } = await axiosInstance.get('/workflow', {
      params: { page, limit },
    });
    return data.data;
  }

  async updateWorkflow(
    workflowId: string,
    name?: string,
    status?: WorkflowStatus,
  ) {
    const { data } = await axiosInstance.put(`/workflow/${workflowId}`, {
      name,
      status,
    });
    return data.data;
  }
}

const workflowService = new WorkflowService();
export default workflowService;
