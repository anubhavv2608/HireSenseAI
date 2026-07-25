import { forwardRef, useId } from "react";
import type { ComponentProps } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TextAreaProps extends ComponentProps<"textarea"> {
  label: string;
  error?: string;
  containerClassName?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, id, containerClassName, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className={cn("space-y-2", containerClassName)}>
        <Label htmlFor={inputId}>{label}</Label>
        <Textarea
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={className}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  },
);

TextArea.displayName = "TextArea";
