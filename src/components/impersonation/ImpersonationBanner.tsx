import { useImpersonation } from '@/contexts/ImpersonationContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Eye, Clock, Pencil } from 'lucide-react';
import { useState, useEffect } from 'react';

export const ImpersonationBanner = () => {
  const { 
    isImpersonating, 
    impersonatedUser, 
    endImpersonation,
    allowWrites,
    setAllowWrites 
  } = useImpersonation();
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isImpersonating) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isImpersonating]);

  if (!isImpersonating || !impersonatedUser) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 py-2 px-4 flex items-center justify-between shadow-lg h-12">
      <div className="flex items-center gap-3">
        <Eye className="w-5 h-5" />
        <span className="font-medium">
          Viewing as: <strong>{impersonatedUser.full_name || impersonatedUser.email}</strong>
        </span>
        <span className="text-amber-800 hidden sm:inline">({impersonatedUser.email})</span>
        <div className="flex items-center gap-1 text-amber-800 text-sm">
          <Clock className="w-4 h-4" />
          <span>{formatTime(elapsedTime)}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Allow Writes Toggle */}
        <div className="flex items-center gap-2 bg-amber-400/50 rounded-md px-3 py-1">
          <Pencil className="w-4 h-4 text-amber-800" />
          <Label 
            htmlFor="allow-writes" 
            className="text-sm text-amber-900 cursor-pointer hidden md:inline"
          >
            Allow Writes
          </Label>
          <Switch
            id="allow-writes"
            checked={allowWrites}
            onCheckedChange={setAllowWrites}
            className="data-[state=checked]:bg-amber-700"
          />
        </div>
        
        <span className="text-sm text-amber-800 hidden lg:inline">
          {allowWrites ? 'Write mode enabled' : 'Read-only mode'}
        </span>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={endImpersonation}
          className="bg-amber-100 hover:bg-amber-200 text-amber-900"
        >
          <X className="w-4 h-4 mr-1" />
          End Session
        </Button>
      </div>
    </div>
  );
};
