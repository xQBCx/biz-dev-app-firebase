import { ReactNode } from "react";
import { AppHeader } from "./AppHeader";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container px-4 py-4 pb-28 sm:px-6 sm:py-6 sm:pb-32">{children}</main>
    </div>
  );
}
