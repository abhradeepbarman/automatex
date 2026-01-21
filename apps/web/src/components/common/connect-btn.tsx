import credentialService from '@/services/credential.service';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface IConnectBtnProps {
  appId: string;
  onAuthSuccess?: (id: string) => void;
}

const ConnectBtn = ({ appId, onAuthSuccess }: IConnectBtnProps) => {
  const [code, setCode] = useState<string>('');

  const { refetch } = useQuery({
    queryKey: ['auth-url', appId],
    queryFn: () => credentialService.getAuthUrl(appId),
    enabled: false,
  });

  const { refetch: getTokenUrl } = useQuery({
    queryKey: ['token-url', appId],
    queryFn: () => credentialService.getTokenUrl(appId, code),
    enabled: false,
  });

  const handleClick = async () => {
    try {
      const { data } = await refetch();
      if (data && data.authUrl) {
        window.open(data.authUrl, 'Authentication', 'width=500,height=600');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  useEffect(() => {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'OAUTH_SUCCESS') {
        setCode(event.data.code);
      }
    });

    return () => {
      window.removeEventListener('message', () => {});
    };
  }, []);

  useEffect(() => {
    const fetchAccessToken = async () => {
      if (!code) return;

      try {
        const { data } = await getTokenUrl();
        if (data) {
          toast.success('Successfully connected!');

          if (onAuthSuccess) {
            onAuthSuccess(data.id);
          }
        }
      } catch (error) {
        toast.error('Failed to get access token');
      }
    };

    fetchAccessToken();
  }, [code, getTokenUrl, onAuthSuccess]);

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleClick}
    >
      Connect app
    </Button>
  );
};

export default ConnectBtn;
