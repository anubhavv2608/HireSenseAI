import { Textarea } from "@/components/ui/textarea";

interface JobTextInputProps {
  value: string;
  onChange: (text: string) => void;
  maxLength: number;
  disabled?: boolean;
}

const INPUT_ID = "job-description-input";

export function JobTextInput({ value, onChange, maxLength, disabled }: JobTextInputProps) {
  const tooLong = value.length > maxLength;

  return (
    <div className="space-y-2">
      <label htmlFor={INPUT_ID} className="text-sm font-medium text-foreground">
        Job Description
      </label>
      <Textarea
        id={INPUT_ID}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste the job description here…"
        rows={8}
        disabled={disabled}
        aria-invalid={tooLong}
      />
      <span className="block text-right text-xs text-muted-foreground">
        {value.length}/{maxLength}
      </span>
    </div>
  );
}
