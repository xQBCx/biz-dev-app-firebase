import { Home, MessageSquare, User, Map } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/useHaptics";

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Map, label: "Map", path: "/map" },
  { icon: MessageSquare, label: "Chats", path: "/chats" },
  { icon: User, label: "Profile", path: "/profile" },
];

export const BottomNav = () => {
  const location = useLocation();
  const { lightTap } = useHaptics();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === "/home" && location.pathname === "/");
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => lightTap()}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all",
                isActive 
                  ? "text-primary shadow-[0_0_15px_hsl(var(--primary)/0.4)]" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-6 w-6", isActive && "animate-glow")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
