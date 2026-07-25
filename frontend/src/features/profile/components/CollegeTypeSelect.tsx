import { Button } from "@/components/ui/button";
import type { CollegeType } from "../types/profile.types";

const COLLEGE_TYPE_OPTIONS: CollegeType[] = ["Government", "Private", "NIT", "IIT", "IIIT", "Other"];

interface CollegeTypeSelectProps {
  value?: CollegeType;
  onChange: (value: CollegeType) => void;
  disabled?: boolean;
}

export function CollegeTypeSelect({ value, onChange, disabled }: CollegeTypeSelectProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="College type">
      {COLLEGE_TYPE_OPTIONS.map((option) => (
        <Button
          key={option}
          type="button"
          variant={value === option ? "default" : "outline"}
          size="sm"
          disabled={disabled}
          onClick={() => onChange(option)}
          aria-pressed={value === option}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
