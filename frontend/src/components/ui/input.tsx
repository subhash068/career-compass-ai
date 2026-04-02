import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "filled" | "ghost";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const variants = {
      default: "border border-input bg-background focus:bg-background",
      filled: "border-0 bg-muted/30 focus:bg-muted/50",
      ghost: "border-0 bg-transparent focus:bg-transparent",
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl px-4 py-2 text-sm ring-offset-background transition-all duration-200",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "focus:border-primary focus:shadow-[0_0_0_3px_hsl(173_58%_39%/0.15)]",
          "hover:border-primary/30 hover:shadow-sm",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
          variants[variant],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
