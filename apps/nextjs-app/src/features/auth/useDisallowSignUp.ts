import { useQuery } from '@tanstack/react-query';
import { getPublicSetting } from '@teable/openapi';
import { ReactQueryKeys } from '@teable/sdk/config';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

export const useDisallowSignUp = () => {
  const { data: setting } = useQuery({
    queryKey: ReactQueryKeys.getPublicSetting(),
    queryFn: () => getPublicSetting().then(({ data }) => data),
  });
  const router = useRouter();
  const redirect = decodeURIComponent((router.query.redirect as string) || '');
  const isInvitation = useMemo(() => {
    return (
      redirect.includes('invitation') &&
      redirect.includes('invitationCode') &&
      redirect.includes('invitationId')
    );
  }, [redirect]);
  const { disallowSignUp } = setting ?? {};
  return disallowSignUp && !isInvitation;
};
