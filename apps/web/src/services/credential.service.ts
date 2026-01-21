import axiosInstance from '@/lib/axios';

interface IGetAuthUrlResponse {
  authUrl: string;
}

interface IGetTokenUrlResponse {
  id: string;
  app: string;
}

class CredentialService {
  async getAuthUrl(provider: string): Promise<IGetAuthUrlResponse> {
    const { data } = await axiosInstance.get(`/credential/${provider}`);

    return data.data;
  }

  async getTokenUrl(
    provider: string,
    code: string,
  ): Promise<IGetTokenUrlResponse> {
    const { data } = await axiosInstance.post(`/credential/${provider}/token`, {
      code,
    });

    return data.data;
  }
}

const credentialService = new CredentialService();
export default credentialService;
