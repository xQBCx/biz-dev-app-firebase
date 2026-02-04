import { Heart } from "lucide-react";
interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}
const Logo = ({
  className = "",
  showText = true,
  size = "md"
}: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20"
  };
  const textSizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl"
  };
  return <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <Heart className={`${sizeClasses[size]} text-primary fill-primary/10 stroke-2`} strokeWidth={2} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center -mt-0.5">
            <div className="flex gap-1.5 mb-1">
              <div className="w-1 h-1 rounded-full bg-primary" />
              <div className="w-1 h-1 rounded-full bg-primary" />
            </div>
            <div className="w-5 h-2 border-b-2 border-primary rounded-b-full" />
          </div>
        </div>
      </div>
      {showText && <span className={`font-bold tracking-wide text-primary ${textSizeClasses[size]}`}>
          CUMSENT
        </span>}
    </div>;
};
export default Logo;