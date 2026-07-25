import { forwardRef, useId } from "react";
import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InputFieldProps extends ComponentProps<"input"> {
  label: string;
  error?: string;
  containerClassName?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, id, containerClassName, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className={cn("space-y-2", containerClassName)}>
        <Label htmlFor={inputId}>{label}</Label>
        <Input
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

InputField.displayName = "InputField";
