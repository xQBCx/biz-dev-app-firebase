import { useImpersonation } from '@/contexts/ImpersonationContext';
import { ImpersonationBanner } from './ImpersonationBanner';
import { cn } from '@/lib/utils';

interface ImpersonationLayoutProps {
  children: React.ReactNode;
}

export const ImpersonationLayout = ({ children }: ImpersonationLayoutProps) => {
  const { isImpersonating } = useImpersonation();

  return (
    <>
      <ImpersonationBanner />
      <div className={cn(
        "h-screen flex w-full overflow-hidden transition-all duration-200",
        isImpersonating && "pt-12"
      )}>
        {children}
      </div>
    </>
  );
};
