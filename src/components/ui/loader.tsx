import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Loader = ({ size = "md", className }: LoaderProps) => {
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-24 w-24",
    lg: "h-32 w-32"
  };

  return (
    <div className="relative flex items-center justify-center">
      <div 
        className={cn(
          "absolute rounded-full animate-spin",
          "bg-gradient-to-br from-royal-blue via-chrome to-brushed-silver",
          sizeClasses[size],
          className
        )}
        style={{
          animation: "spin 1.2s linear infinite"
        }}
      >
        <span className="absolute rounded-full h-full w-full bg-gradient-to-br from-royal-blue via-chrome to-brushed-silver blur-[5px]" />
        <span className="absolute rounded-full h-full w-full bg-gradient-to-br from-royal-blue via-chrome to-brushed-silver blur-[10px]" />
        <span className="absolute rounded-full h-full w-full bg-gradient-to-br from-royal-blue via-chrome to-brushed-silver blur-[25px]" />
        <span className="absolute rounded-full h-full w-full bg-gradient-to-br from-royal-blue via-chrome to-brushed-silver blur-[50px]" />
        
        {/* Inner white circle */}
        <div className={cn(
          "absolute bg-background border-[5px] border-card rounded-full",
          size === "sm" ? "inset-[6px]" : size === "md" ? "inset-[10px]" : "inset-[14px]"
        )} />
      </div>
    </div>
  );
};

export const LoaderFullScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-depth">
      <Loader size="lg" />
    </div>
  );
};
