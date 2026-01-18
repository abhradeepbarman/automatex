import config from '@/config';
import axios from 'axios';

export const credentialAxiosInstance = axios.create({
  baseURL: `${config.CREDENTIAL_API_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

credentialAxiosInstance.interceptors.request.use(
  (config) => {
    const { access_token } = JSON.parse(localStorage.getItem('user') ?? '{}');
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
