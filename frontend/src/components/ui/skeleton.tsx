import { cn } from "@/lib/utils";

function Skeleton({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "shimmer" | "wave" | "gradient";
  size?: "default" | "sm" | "lg" | "xl" | "circle";
}) {
  const variants = {
    default: "animate-pulse rounded-md bg-muted",
    shimmer: "relative overflow-hidden rounded-md bg-muted/50",
    wave: "animate-pulse rounded-md bg-muted",
    gradient: "relative overflow-hidden rounded-md bg-muted/50",
  };

  const sizes = {
    default: "h-4 w-full",
    sm: "h-3 w-20",
    lg: "h-6 w-full",
    xl: "h-10 w-full",
    circle: "h-10 w-10 rounded-full",
  };

  const shimmerStyles: React.CSSProperties = variant === "shimmer" || variant === "gradient" 
    ? {
        background: variant === "gradient"
          ? 'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.3) 50%, hsl(var(--muted)) 100%)'
          : 'linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted) / 0.5) 50%, hsl(var(--muted)) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }
    : {};

  return ( 
    <div 
      className={cn(
        variants[variant],
        sizes[size],
        className
      )} 
      style={shimmerStyles}
      {...props} 
    />
  );
}

export { Skeleton };
