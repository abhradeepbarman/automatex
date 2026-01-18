import connectionService from '@/services/credential.service';
import { StepType } from '@repo/common/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import config from '@/config';

interface IConnectBtnProps {
  appId: string;
  stepType: StepType;
  stepId: string;
  onAuthSuccess?: (authData: {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  }) => void;
}

const ConnectBtn = ({
  appId,
  stepType,
  stepId,
  onAuthSuccess,
}: IConnectBtnProps) => {
  const [code, setCode] = useState<string>('');

  const { refetch: fetchRedirectUrl } = useQuery({
    queryKey: ['redirect-url', appId, stepType, stepId],
    queryFn: () => connectionService.getRedirectUrl(appId, stepType, stepId),
    enabled: false,
  });

  const { refetch } = useQuery({
    queryKey: ['access-token', appId, stepType, stepId],
    queryFn: () => connectionService.getAccessToken(appId, stepType, code),
    enabled: false,
  });

  const handleConnectClick = async () => {
    const popup = window.open('', 'oauth-popup', 'width=600,height=600');

    const result = await fetchRedirectUrl();

    if (result.data?.redirectUrl) {
      popup!.location.href = result.data.redirectUrl;
    }
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== config.APP_BASE_URL) return;

      if (event.data?.type === 'OAUTH_SUCCESS') {
        const { code } = event.data;
        setCode(code);

        const { data } = await refetch();
        console.log('Access Token Response:', data);

        if (data && onAuthSuccess) {
          onAuthSuccess({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refetch, onAuthSuccess]);

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleConnectClick}
    >
      Connect app
    </Button>
  );
};

export default ConnectBtn;
