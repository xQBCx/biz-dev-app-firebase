import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold uppercase tracking-wider ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 min-h-[48px] min-w-[48px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 border border-border",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-glow-danger",
        outline:
          "border-2 border-accent bg-transparent text-accent hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
        ghost: "hover:bg-accent/10 hover:text-accent",
        link: "text-accent underline-offset-4 hover:underline",
        industrial:
          "bg-gradient-to-r from-accent to-orange-600 text-accent-foreground shadow-glow-accent hover:shadow-[0_0_40px_hsla(25,95%,53%,0.5)] border border-accent/30",
        danger:
          "bg-gradient-to-r from-destructive to-red-700 text-destructive-foreground shadow-glow-danger hover:shadow-[0_0_40px_hsla(0,72%,51%,0.6)]",
        success:
          "bg-success text-success-foreground hover:bg-success/90",
        glass:
          "bg-card/50 backdrop-blur-sm text-card-foreground border border-border hover:bg-card/70",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-md px-4",
        lg: "h-14 rounded-md px-8 text-base",
        xl: "h-16 rounded-lg px-10 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
