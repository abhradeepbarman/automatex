import { StepType } from '@repo/common/types';
import { Button } from '../ui/button';

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
  return (
    <Button type="button" variant="outline" className="w-full">
      Connect app
    </Button>
  );
};

export default ConnectBtn;
