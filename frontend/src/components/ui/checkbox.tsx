import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  variant?: "default" | "success" | "warning";
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
    success: "border-success data-[state=checked]:bg-success data-[state=checked]:text-success-foreground",
    warning: "border-warning data-[state=checked]:bg-warning data-[state=checked]:text-warning-foreground",
  };

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-5 w-5 shrink-0 rounded-md border-2 ring-offset-background transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "focus-visible:shadow-[0_0_0_3px_hsl(173_58%_39%/0.15)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "hover:scale-110 hover:shadow-md",
        "data-[state=checked]:scale-110",
        variants[variant],
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current transition-transform duration-200")}>
        <Check className="h-3.5 w-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
