import { cn } from "@/lib/utils";

interface XRepairxLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  variant?: "full" | "icon";
}

export function XRepairxLogo({ 
  className, 
  size = "md", 
  showText = true,
  variant = "full" 
}: XRepairxLogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 48, text: "text-3xl" },
    xl: { icon: 64, text: "text-4xl" },
  };

  const { icon: iconSize, text: textSize } = sizes[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Icon - Industrial circuit-wrench hybrid */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Outer hexagon frame */}
        <path
          d="M32 4L56 18V46L32 60L8 46V18L32 4Z"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary"
          fill="none"
        />
        
        {/* Inner circuit lines */}
        <path
          d="M20 20L32 20M32 20L32 28M32 20L44 20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-muted-foreground"
        />
        <path
          d="M20 44L32 44M32 44L32 36M32 44L44 44"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-muted-foreground"
        />
        
        {/* Central wrench/gear element */}
        <circle
          cx="32"
          cy="32"
          r="10"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-primary"
          fill="none"
        />
        
        {/* Gear teeth */}
        <path
          d="M32 20V24M32 40V44M20 32H24M40 32H44"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-primary"
        />
        
        {/* Diagonal gear teeth */}
        <path
          d="M23.5 23.5L26.3 26.3M37.7 37.7L40.5 40.5M40.5 23.5L37.7 26.3M26.3 37.7L23.5 40.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="text-primary"
        />
        
        {/* Center dot - power indicator */}
        <circle
          cx="32"
          cy="32"
          r="3"
          className="fill-primary"
        />
        
        {/* Corner circuit nodes */}
        <circle cx="20" cy="20" r="2" className="fill-accent" />
        <circle cx="44" cy="20" r="2" className="fill-accent" />
        <circle cx="20" cy="44" r="2" className="fill-accent" />
        <circle cx="44" cy="44" r="2" className="fill-accent" />
      </svg>

      {/* Text */}
      {showText && variant === "full" && (
        <div className="flex flex-col leading-none">
          <span className={cn("font-bold tracking-tight", textSize)}>
            <span className="text-primary">x</span>
            <span className="text-foreground">REPAIR</span>
            <span className="text-primary">x</span>
          </span>
        </div>
      )}
    </div>
  );
}