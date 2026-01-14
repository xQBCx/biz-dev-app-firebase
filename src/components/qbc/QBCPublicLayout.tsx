import { ReactNode } from 'react';
import { QBCPublicHeader } from './QBCPublicHeader';
import { QBCPublicFooter } from './QBCPublicFooter';

interface QBCPublicLayoutProps {
  children: ReactNode;
}

export function QBCPublicLayout({ children }: QBCPublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background bg-qbc-gradient bg-grid-pattern flex flex-col">
      <QBCPublicHeader />
      <main className="flex-1">
        {children}
      </main>
      <QBCPublicFooter />
    </div>
  );
}
