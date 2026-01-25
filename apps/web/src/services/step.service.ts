import axiosInstance from '@/lib/axios';
import type { StepType } from '@repo/common/types';

class StepService {
  async addStep(
    workflowId: string,
    app: string,
    index: number,
    type: StepType,
    connectionId: string,
    metadata: any,
  ): Promise<{ id: string }> {
    const { data } = await axiosInstance.post(`/step/${workflowId}`, {
      app,
      index,
      type,
      connectionId,
      metadata,
    });

    return data.data;
  }

  async getStep(workflowId: string, stepId: string) {
    const { data } = await axiosInstance.get(`/step/${workflowId}/${stepId}`);
    return data.data;
  }

  async deleteStep(workflowId: string, stepId: string) {
    const { data } = await axiosInstance.delete(
      `/step/${workflowId}/${stepId}`,
    );
    return data.data;
  }

  async updateStep(
    workflowId: string,
    stepId: string,
    app?: string,
    connectionId?: string,
    metadata?: any,
  ) {
    const { data } = await axiosInstance.put(`/step/${workflowId}/${stepId}`, {
      app,
      connectionId,
      metadata,
    });

    return data.data;
  }
}

const stepService = new StepService();
export default stepService;
