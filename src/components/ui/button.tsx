import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 ease-in-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer rounded-[50px] bg-[hsl(0_0%_88%)] border-2 border-[hsl(0_0%_81%)] text-[hsl(0_0%_30%)] shadow-[inset_4px_4px_10px_hsl(0_0%_74%),inset_-4px_-4px_10px_hsl(0_0%_100%)] hover:shadow-[inset_2px_2px_5px_hsl(0_0%_74%),inset_-2px_-2px_5px_hsl(0_0%_100%),2px_2px_5px_hsl(0_0%_74%),-2px_-2px_5px_hsl(0_0%_100%)] focus:shadow-[inset_2px_2px_5px_hsl(0_0%_74%),inset_-2px_-2px_5px_hsl(0_0%_100%),2px_2px_5px_hsl(0_0%_74%),-2px_-2px_5px_hsl(0_0%_100%)]",
  {
    variants: {
      variant: {
        default: "",
        destructive: "",
        outline: "",
        secondary: "",
        ghost: "",
        link: "shadow-none border-none bg-transparent text-primary underline-offset-4 hover:underline hover:shadow-none",
        chrome: "",
        elevated: "",
      },
      size: {
        default: "h-11 px-10 text-lg",
        sm: "h-9 px-6 text-sm",
        lg: "h-14 px-12 text-xl",
        icon: "h-11 w-11 px-0",
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
    
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size, className }))} 
        ref={ref} 
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
