import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon, error, type, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label ? (
          <label
            className="text-sm font-medium text-[var(--text)]/80"
            htmlFor={props.id}
          >
            {label}
          </label>
        ) : null}
        <div className="relative">
          {icon ? (
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[var(--primary)]">
              {icon}
            </div>
          ) : null}
          <input
            ref={ref}
            type={type}
            className={cn(
              "w-full rounded-lg border-2 bg-[var(--background)] text-[var(--text)] placeholder:text-[var(--text)]/40 transition-all",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]/20",
              "border-[var(--border)] focus:border-[var(--primary)]",
              icon ? "pl-12" : "pl-4",
              "pr-4 py-3",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
            aria-invalid={Boolean(error)}
            {...props}
          />
        </div>
        {error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export default Input;
