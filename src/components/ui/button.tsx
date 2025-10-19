import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden cursor-pointer",
  {
    variants: {
      variant: {
        default: [
          "rounded-2xl p-0.5 border-none",
          "bg-[image:var(--gradient-button-outer)]",
          "after:content-[''] after:absolute after:w-[65%] after:h-[60%] after:rounded-[120px] after:top-0 after:right-0",
          "after:shadow-[0_0_20px_hsl(0_0%_100%/0.22)] after:-z-10",
          "before:content-[''] before:absolute before:w-[70px] before:h-full before:rounded-2xl before:bottom-0 before:left-0",
          "before:bg-[image:var(--gradient-button-blob)] before:shadow-[-10px_10px_30px_hsl(216_100%_50%/0.18)]",
          "hover:scale-[1.02]"
        ],
        destructive: [
          "rounded-2xl p-0.5 border-none",
          "bg-gradient-to-br from-red-500 to-red-900",
          "after:content-[''] after:absolute after:w-[65%] after:h-[60%] after:rounded-[120px] after:top-0 after:right-0",
          "after:shadow-[0_0_20px_hsl(0_84%_60%/0.3)] after:-z-10",
          "hover:scale-[1.02]"
        ],
        outline: [
          "rounded-2xl p-0.5 border-2 border-primary/30",
          "bg-card/30 backdrop-blur-sm",
          "hover:border-primary/60 hover:bg-primary/10"
        ],
        secondary: [
          "rounded-2xl p-0.5 border-none",
          "bg-gradient-to-br from-gray-600 to-gray-800",
          "hover:scale-[1.02]"
        ],
        ghost: "hover:bg-muted/50 hover:text-foreground rounded-lg",
        link: "text-primary underline-offset-4 hover:underline",
        chrome: [
          "rounded-2xl p-0.5 border-none",
          "bg-gradient-to-br from-cyan-400 to-cyan-600",
          "hover:scale-[1.02]"
        ],
        elevated: [
          "rounded-2xl p-0.5 border border-border",
          "bg-card",
          "hover:scale-[1.02]"
        ],
      },
      size: {
        default: "h-11",
        sm: "h-9 text-xs",
        lg: "h-14 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const innerVariants = cva(
  "w-full h-full flex items-center justify-center gap-2 relative z-10",
  {
    variants: {
      variant: {
        default: [
          "rounded-[14px] px-6 py-2.5",
          "bg-[image:var(--gradient-button-inner)]",
          "before:content-[''] before:w-full before:h-full before:left-0 before:top-0 before:rounded-[14px]",
          "before:bg-[image:var(--gradient-button-glow)] before:absolute before:pointer-events-none",
          "text-white"
        ],
        destructive: [
          "rounded-[14px] px-6 py-2.5",
          "bg-gradient-to-br from-red-700 to-red-950",
          "text-white"
        ],
        outline: "px-6 py-2.5 rounded-2xl text-foreground",
        secondary: [
          "rounded-[14px] px-6 py-2.5",
          "bg-gradient-to-br from-gray-700 to-gray-900",
          "text-white"
        ],
        ghost: "px-4 py-2",
        link: "",
        chrome: [
          "rounded-[14px] px-6 py-2.5",
          "bg-gradient-to-br from-cyan-500 to-cyan-700",
          "text-white font-bold"
        ],
        elevated: [
          "rounded-[14px] px-6 py-2.5",
          "bg-card",
          "text-foreground"
        ],
      },
      size: {
        default: "px-6 py-2.5",
        sm: "px-4 py-2 text-xs",
        lg: "px-10 py-3.5 text-base",
        icon: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // For ghost and link variants, don't use the inner wrapper
    if (variant === "ghost" || variant === "link" || variant === "outline") {
      return (
        <Comp 
          className={cn(buttonVariants({ variant, size, className }))} 
          ref={ref} 
          {...props}
        >
          {children}
        </Comp>
      );
    }
    
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size, className }))} 
        ref={ref} 
        {...props}
      >
        <span className={cn(innerVariants({ variant, size }))}>
          {children}
        </span>
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
