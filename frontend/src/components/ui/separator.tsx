import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

interface SeparatorProps extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  variant?: "default" | "gradient" | "dashed";
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(({ className, orientation = "horizontal", decorative = true, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-border",
    gradient: "bg-gradient-to-r from-transparent via-border to-transparent",
    dashed: "bg-transparent border-dashed border-t border-b-0 border-x-0",
  };

  const orientationClass = orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]";

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0",
        variant === "dashed" ? "border" : variants[variant],
        orientationClass,
        className,
      )}
      {...props}
    />
  );
});
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
