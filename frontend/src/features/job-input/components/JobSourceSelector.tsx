import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { JobSource } from "../types/jobInput.types";

interface JobSourceSelectorProps {
  value: JobSource;
  onChange: (source: JobSource) => void;
  disabled?: boolean;
}

const SOURCE_OPTIONS: { value: JobSource; label: string; disabled?: boolean }[] = [
  { value: "text", label: "Paste Text" },
  { value: "pdf", label: "Upload PDF" },
  { value: "image", label: "Upload Image", disabled: true },
];

export function JobSourceSelector({ value, onChange, disabled }: JobSourceSelectorProps) {
  return (
    <div role="group" aria-label="Job description source" className="flex flex-wrap gap-2">
      {SOURCE_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        const isDisabled = disabled || option.disabled;
        return (
          <Button
            key={option.value}
            type="button"
            variant={isSelected ? "default" : "outline"}
            size="sm"
            aria-pressed={isSelected}
            aria-disabled={isDisabled}
            disabled={isDisabled}
            onClick={() => onChange(option.value)}
            title={option.disabled ? "Image upload is coming in a future update." : undefined}
          >
            {option.label}
            {option.disabled && <StatusBadge tone="neutral">Coming soon</StatusBadge>}
          </Button>
        );
      })}
    </div>
  );
}
