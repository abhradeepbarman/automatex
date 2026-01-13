import axiosInstance from '@/lib/axios';

export interface ILoginResponse {
  id: string;
  name: string;
  email: string;
  access_token: string;
}

class AuthService {
  async login(email: string, password: string): Promise<ILoginResponse> {
    const { data } = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return data.data;
  }
}

const authService = new AuthService();
export default authService;
