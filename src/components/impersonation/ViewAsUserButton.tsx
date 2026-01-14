import { Button } from '@/components/ui/button';
import { Eye, Loader } from 'lucide-react';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { useUserRole } from '@/hooks/useUserRole';

interface ViewAsUserButtonProps {
  userId: string;
  userName?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon';
  showLabel?: boolean;
}

export const ViewAsUserButton = ({
  userId,
  userName,
  variant = 'ghost',
  size = 'sm',
  showLabel = true,
}: ViewAsUserButtonProps) => {
  const { startImpersonation, loading, isImpersonating } = useImpersonation();
  const { hasRole } = useUserRole();

  // Only show for admins and when not already impersonating
  if (!hasRole('admin') || isImpersonating) {
    return null;
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await startImpersonation(userId);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading}
      title={`View as ${userName || 'user'}`}
    >
      {loading ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
      {showLabel && <span className="ml-1">View as User</span>}
    </Button>
  );
};
