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
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-5xl"
  };

  const iconSizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* M/Y Heart Logo in Crimson */}
      <div className={`relative ${iconSizeClasses[size]} flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Heart outline shape */}
          <path
            d="M50 85C50 85 15 65 15 40C15 28 23 20 32 20C40 20 45 25 50 32C55 25 60 20 68 20C77 20 85 28 85 40C85 65 50 85 50 85Z"
            className="fill-primary"
          />
          
          {/* M letter (top portion) */}
          <path
            d="M30 35 L30 55 M30 35 L50 50 M50 50 L70 35 M70 35 L70 55"
            className="stroke-white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Y letter (bottom portion) */}
          <path
            d="M35 60 L50 70 M65 60 L50 70 M50 70 L50 80"
            className="stroke-white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <span className={`font-bold tracking-wide text-white drop-shadow-md ${sizeClasses[size]}`}>
          Mutual Yes
        </span>
      )}
    </div>
  );
};

export default Logo;