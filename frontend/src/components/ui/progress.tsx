import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  variant?: "default" | "gradient" | "striped";
  indicatorClassName?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", indicatorClassName, ...props }, ref) => {
  const variants = {
    default: "bg-primary",
    gradient: "bg-gradient-to-r from-primary to-success",
    striped: "bg-primary striped",
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-secondary/50 shadow-inner",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-out rounded-full",
          variants[variant],
          "shadow-[0_0_10px_hsl(173_58%_39%/0.3)]",
          indicatorClassName,
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
