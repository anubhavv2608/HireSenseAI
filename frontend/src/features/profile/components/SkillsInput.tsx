import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const MAX_SKILLS = 20;
const MAX_SKILL_LENGTH = 30;

interface SkillsInputProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  disabled?: boolean;
}

export function SkillsInput({ skills, onChange, disabled }: SkillsInputProps) {
  const [draft, setDraft] = useState("");

  function addSkill() {
    const trimmed = draft.trim().slice(0, MAX_SKILL_LENGTH);
    if (!trimmed) return;
    if (skills.length >= MAX_SKILLS) return;
    const exists = skills.some((skill) => skill.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setDraft("");
      return;
    }
    onChange([...skills, trimmed]);
    setDraft("");
  }

  function removeSkill(skill: string) {
    onChange(skills.filter((existing) => existing !== skill));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  }

  return (
    <div className="space-y-2">
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={skills.length >= MAX_SKILLS ? `Maximum ${MAX_SKILLS} skills reached` : "Type a skill and press Enter"}
        disabled={disabled || skills.length >= MAX_SKILLS}
        aria-label="Add a skill"
      />
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1 pr-1">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                disabled={disabled}
                aria-label={`Remove ${skill}`}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
