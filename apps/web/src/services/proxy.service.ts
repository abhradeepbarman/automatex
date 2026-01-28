import axiosInstance from '@/lib/axios';

class ProxyService {
  async getDynamicOptions(url: string, connectionId: string): Promise<any> {
    const { data } = await axiosInstance.get('/proxy', {
      params: {
        url,
        connectionId,
      },
    });
    return data.data;
  }
}

const proxyService = new ProxyService();
export default proxyService;
