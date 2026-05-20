import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
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
        <textarea
          ref={ref}
          className={cn(
            "w-full rounded-lg border-2 bg-[var(--background)] text-[var(--text)] placeholder:text-[var(--text)]/40 transition-all resize-none",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]/20",
            "border-[var(--border)] focus:border-[var(--primary)]",
            "px-4 py-3",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
export default Textarea;
