import { forwardRef, useId, useState } from "react";
import type { ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends Omit<ComponentProps<"input">, "type"> {
  label: string;
  error?: string;
  containerClassName?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, id, containerClassName, className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className={cn("space-y-2", containerClassName)}>
        <Label htmlFor={inputId}>{label}</Label>
        <div className="relative">
          <Input
            id={inputId}
            ref={ref}
            type={visible ? "text" : "password"}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            className={cn("pr-9", className)}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-0.5 top-1/2 -translate-y-1/2"
            onClick={() => setVisible((prev) => !prev)}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        </div>
        {error && (
          <p id={errorId} className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
