import { credentialAxiosInstance } from '@/lib/credentials-axios';
import type { StepType } from '@repo/common/types';

interface IGetRedirectUrlResponse {
  redirectUrl: string;
}

interface IGetAccessTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

class CredentialService {
  async getRedirectUrl(
    appId: string,
    stepType: StepType,
    stepId: string,
  ): Promise<IGetRedirectUrlResponse> {
    const { data } = await credentialAxiosInstance.get(
      `/oauth/redirect-url?app=${appId}&stepType=${stepType}&stepId=${stepId}`,
    );

    return data.data;
  }

  async getAccessToken(
    appId: string,
    stepType: StepType,
    code: string,
  ): Promise<IGetAccessTokenResponse> {
    const { data } = await credentialAxiosInstance.get(
      `/oauth/access-token?app=${appId}&stepType=${stepType}&code=${code}`,
    );

    return data.data;
  }
}

const credentialService = new CredentialService();
export default credentialService;
