import { Button } from '@/components/ui/button';

export const SkipToContent = () => {
  const handleSkip = () => {
    const main = document.querySelector('main');
    if (main) {
      main.focus();
      main.scrollIntoView();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-background border-2 border-primary"
      onClick={handleSkip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSkip();
        }
      }}
    >
      Skip to content
    </Button>
  );
};