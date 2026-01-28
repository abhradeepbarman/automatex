import axiosInstance from '@/lib/axios';

export interface DashboardStats {
  totalWorkflows: number;
  totalRuns: number;
  totalErrors: number;
}

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    const { data } = await axiosInstance.get('/dashboard/stats');
    return data.data;
  }
}

const dashboardService = new DashboardService();
export default dashboardService;
