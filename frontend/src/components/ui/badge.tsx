import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 hover:shadow-md hover:shadow-primary/25",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md hover:shadow-secondary/25",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 hover:shadow-md hover:shadow-destructive/25",
        outline: "text-foreground border-border hover:bg-accent/10 hover:text-accent",
        success: "border-transparent bg-success text-success-foreground hover:bg-success/80 hover:shadow-md hover:shadow-success/25",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/80 hover:shadow-md hover:shadow-warning/25",
        // New enhanced variants
        gradient: "border-transparent bg-gradient-to-r from-primary to-primary-light text-primary-foreground hover:shadow-lg hover:shadow-primary/30 hover:scale-105",
        glow: "border-transparent bg-primary/20 text-primary hover:bg-primary/30 hover:shadow-[0_0_20px_hsl(173_58%_39%/0.3)]",
        soft: "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
        "outline-primary": "border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50",
        // Skill level badges
        beginner: "border-transparent bg-[hsl(215_28%_60%/0.15)] text-[hsl(215_28%_60%)] hover:bg-[hsl(215_28%_60%/0.25)] hover:shadow-sm",
        intermediate: "border-transparent bg-[hsl(173_58%_50%/0.15)] text-[hsl(173_58%_50%)] hover:bg-[hsl(173_58%_50%/0.25)] hover:shadow-sm",
        advanced: "border-transparent bg-[hsl(152_69%_45%/0.15)] text-[hsl(152_69%_45%)] hover:bg-[hsl(152_69%_45%/0.25)] hover:shadow-sm",
        expert: "border-transparent bg-[hsl(262_83%_58%/0.15)] text-[hsl(262_83%_58%)] hover:bg-[hsl(262_83%_58%/0.25)] hover:shadow-sm",
        // Gap severity badges
        "gap-low": "border-transparent bg-[hsl(152_69%_40%/0.15)] text-[hsl(152_69%_40%)] hover:bg-[hsl(152_69%_40%/0.25)]",
        "gap-medium": "border-transparent bg-[hsl(38_92%_50%/0.15)] text-[hsl(38_92%_50%)] hover:bg-[hsl(38_92%_50%/0.25)]",
        "gap-high": "border-transparent bg-[hsl(0_84%_60%/0.15)] text-[hsl(0_84%_60%)] hover:bg-[hsl(0_84%_60%/0.25)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
