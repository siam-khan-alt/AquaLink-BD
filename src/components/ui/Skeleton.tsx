import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circle" | "text";
}

const Skeleton = ({ className, variant = "default", ...props }: SkeletonProps) => {
  const variants = {
    default: "rounded-lg",
    circle: "rounded-full",
    text: "rounded-sm h-4",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-[var(--border)]",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

export { Skeleton };
export default Skeleton;
