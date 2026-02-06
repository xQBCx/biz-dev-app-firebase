import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { PropertySwitcher } from '@/components/PropertySwitcher';
import { SkipToContent } from '@/components/accessibility/SkipToContent';
import { 
  LayoutGrid,
  ClipboardList,
  Bell,
  Sparkles,
  Wrench,
  UserPlus,
  GraduationCap,
  MessageSquare,
  Users,
  BarChart3,
  Calendar,
  Package,
  Settings,
  Menu,
  X,
  ChevronLeft, 
  ChevronRight, 
  User,
  LogOut,
  Home
} from 'lucide-react';

const sidebarItems = [
  // Core Operations
  {
    title: 'Dashboard',
    icon: LayoutGrid,
    href: '/os',
    group: 'operations'
  },
  {
    title: 'Operations',
    icon: ClipboardList,
    href: '/os/operations',
    group: 'operations'
  },
  {
    title: 'Front Desk',
    icon: Bell,
    href: '/os/frontdesk',
    group: 'operations'
  },
  {
    title: 'Housekeeping',
    icon: Sparkles,
    href: '/os/housekeeping',
    group: 'operations'
  },
  {
    title: 'Maintenance',
    icon: Wrench,
    href: '/os/maintenance',
    group: 'operations'
  },
  
  // Management & People
  {
    title: 'Onboarding',
    icon: UserPlus,
    href: '/os/onboarding',
    group: 'management'
  },
  {
    title: 'Academy',
    icon: GraduationCap,
    href: '/os/academy',
    group: 'management'
  },
  {
    title: 'COMS',
    icon: MessageSquare,
    href: '/os/coms',
    badge: true,
    group: 'management'
  },
  {
    title: 'Team',
    icon: Users,
    href: '/os/team',
    group: 'management'
  },
  
  // Analytics & Control
  {
    title: 'Reports',
    icon: BarChart3,
    href: '/os/reports',
    group: 'analytics'
  },
  {
    title: 'Schedule',
    icon: Calendar,
    href: '/os/schedule',
    group: 'analytics'
  },
  {
    title: 'Inventory',
    icon: Package,
    href: '/os/inventory',
    group: 'analytics'
  }
];

export const OSLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Denver'
  });

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full bg-slate text-slate-foreground">
      {/* Sidebar Header */}
      <div className={`p-4 border-b border-slate-foreground/20 flex items-center justify-between ${isMobile ? 'pb-6' : ''}`}>
        {(!sidebarCollapsed || isMobile) && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SL</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">SmartLink OS</h1>
              <p className="text-xs text-slate-foreground/70">Property Management</p>
            </div>
          </div>
        )}
        
        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto text-white hover:bg-white/10 focus:ring-2 focus:ring-white/20"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={`flex-1 px-3 py-4 space-y-3 ${isMobile ? 'pb-6' : ''}`}>
        {/* Operations Group */}
        <div>
          {(!sidebarCollapsed || isMobile) && (
            <div className="px-3 py-1 mb-2">
              <span className="text-xs font-semibold text-slate-foreground/60 uppercase tracking-wider">
                Operations
              </span>
            </div>
          )}
          {sidebarItems.filter(item => item.group === 'operations').map((item) => (
            <Link
              key={item.title}
              to={item.href}
              onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
              className={`
                flex items-center px-3 py-3 rounded-lg transition-colors mb-1 min-h-[44px]
                hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20
                ${isActive(item.href) ? 'bg-white/20 text-white border-l-4 border-primary' : 'text-slate-foreground/80'}
                ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}
              `}
              aria-label={sidebarCollapsed && !isMobile ? item.title : undefined}
            >
              <item.icon className={`h-5 w-5 ${sidebarCollapsed && !isMobile ? '' : 'mr-3'} flex-shrink-0`} />
              {(!sidebarCollapsed || isMobile) && (
                <>
                  <span className="font-medium">{item.title}</span>
                  {item.badge && item.title === 'COMS' && (
                    <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                      3
                    </Badge>
                  )}
                </>
              )}
            </Link>
          ))}
        </div>

        {/* Management Group */}
        <div>
          {(!sidebarCollapsed || isMobile) && (
            <div className="px-3 py-1 mb-2">
              <span className="text-xs font-semibold text-slate-foreground/60 uppercase tracking-wider">
                Management
              </span>
            </div>
          )}
          {sidebarItems.filter(item => item.group === 'management').map((item) => (
            <Link
              key={item.title}
              to={item.href}
              onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
              className={`
                flex items-center px-3 py-3 rounded-lg transition-colors mb-1 min-h-[44px]
                hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20
                ${isActive(item.href) ? 'bg-white/20 text-white border-l-4 border-primary' : 'text-slate-foreground/80'}
                ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}
              `}
              aria-label={sidebarCollapsed && !isMobile ? item.title : undefined}
            >
              <item.icon className={`h-5 w-5 ${sidebarCollapsed && !isMobile ? '' : 'mr-3'} flex-shrink-0`} />
              {(!sidebarCollapsed || isMobile) && (
                <>
                  <span className="font-medium">{item.title}</span>
                  {item.badge && item.title === 'COMS' && (
                    <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                      3
                    </Badge>
                  )}
                </>
              )}
            </Link>
          ))}
        </div>

        {/* Analytics Group */}
        <div>
          {(!sidebarCollapsed || isMobile) && (
            <div className="px-3 py-1 mb-2">
              <span className="text-xs font-semibold text-slate-foreground/60 uppercase tracking-wider">
                Analytics
              </span>
            </div>
          )}
          {sidebarItems.filter(item => item.group === 'analytics').map((item) => (
            <Link
              key={item.title}
              to={item.href}
              onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
              className={`
                flex items-center px-3 py-3 rounded-lg transition-colors mb-1 min-h-[44px]
                hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20
                ${isActive(item.href) ? 'bg-white/20 text-white border-l-4 border-primary' : 'text-slate-foreground/80'}
                ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}
              `}
              aria-label={sidebarCollapsed && !isMobile ? item.title : undefined}
            >
              <item.icon className={`h-5 w-5 ${sidebarCollapsed && !isMobile ? '' : 'mr-3'} flex-shrink-0`} />
              {(!sidebarCollapsed || isMobile) && <span className="font-medium">{item.title}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* Settings - Always at Bottom */}
      <div className={`p-3 border-t border-slate-foreground/20 ${isMobile ? 'pb-6' : ''}`}>
        <Link
          to="/os/settings"
          onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
          className={`
            flex items-center px-3 py-3 rounded-lg transition-colors min-h-[44px]
            hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20
            ${isActive('/os/settings') ? 'bg-white/20 text-white border-l-4 border-primary' : 'text-slate-foreground/80'}
            ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}
          `}
          aria-label={sidebarCollapsed && !isMobile ? 'Settings' : undefined}
        >
          <Settings className={`h-5 w-5 ${sidebarCollapsed && !isMobile ? '' : 'mr-3'} flex-shrink-0`} />
          {(!sidebarCollapsed || isMobile) && <span className="font-medium">Settings</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background w-full">
      <SkipToContent />
      
      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent 
          side="left" 
          className="p-0 w-72 sm:w-80 border-r-0 z-50"
          aria-describedby="mobile-navigation-description"
        >
          <span id="mobile-navigation-description" className="sr-only">
            Navigation menu for SmartLink OS
          </span>
          <SidebarContent isMobile={true} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside 
        className={`
          hidden lg:block bg-slate transition-all duration-300 border-r border-slate-foreground/20 flex-shrink-0
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
        `}
      >
        <SidebarContent isMobile={false} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navigation Bar */}
        <header className="h-14 sm:h-16 border-b border-border bg-background flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Hamburger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden p-2 focus:ring-2 focus:ring-primary min-h-[44px] min-w-[44px]"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <PropertySwitcher />
                <Badge variant="secondary" className="text-xs font-medium hidden sm:inline-flex">DEMO</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <div className="hidden sm:flex items-center text-xs sm:text-sm text-muted-foreground">
              <span className="hidden lg:inline">{currentTime} MDT</span>
              <span className="lg:hidden">{currentTime.split(' ')[0]}</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative focus:ring-2 focus:ring-primary p-2 min-h-[44px] min-w-[44px]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                3
              </span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 focus:ring-2 focus:ring-primary p-2 min-h-[44px]"
                  aria-label="User menu"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden md:inline font-medium text-sm">
                    {user?.email?.split('@')[0] || 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-background border border-border shadow-lg z-50"
              >
                <DropdownMenuItem 
                  onClick={signOut}
                  className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 cursor-pointer min-h-[44px] flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-muted/30 focus:outline-none" tabIndex={-1}>
          <div className="h-full p-4 sm:p-6">
            <div className="max-w-7xl mx-auto h-full animate-fade-in">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};