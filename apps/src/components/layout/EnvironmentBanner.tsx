import { AlertTriangle } from 'lucide-react';

export const EnvironmentBanner = () => {
  // Check if we're not in production
  const isProduction = import.meta.env.MODE === 'production';
  
  if (isProduction) {
    return null;
  }

  const environment = import.meta.env.MODE || 'development';

  return (
    <div className="bg-warning text-warning-foreground px-4 py-2 text-center text-sm font-medium border-b">
      <div className="flex items-center justify-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>
          {environment.charAt(0).toUpperCase() + environment.slice(1)} Environment
        </span>
      </div>
    </div>
  );
};