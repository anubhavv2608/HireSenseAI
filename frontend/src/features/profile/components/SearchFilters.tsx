import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SkillsInput } from "./SkillsInput";
import type { SearchStudentsQuery } from "../types/profile.types";

const SORT_OPTIONS: { value: NonNullable<SearchStudentsQuery["sort"]>; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name" },
];

interface SearchFiltersProps {
  college: string;
  branch: string;
  graduationYear: string;
  skills: string[];
  sort: SearchStudentsQuery["sort"];
  hasActiveFilters: boolean;
  onCollegeChange: (value: string) => void;
  onBranchChange: (value: string) => void;
  onGraduationYearChange: (value: string) => void;
  onSkillsChange: (value: string[]) => void;
  onSortChange: (value: SearchStudentsQuery["sort"]) => void;
  onReset: () => void;
}

export function SearchFilters({
  college,
  branch,
  graduationYear,
  skills,
  sort,
  hasActiveFilters,
  onCollegeChange,
  onBranchChange,
  onGraduationYearChange,
  onSkillsChange,
  onSortChange,
  onReset,
}: SearchFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="filter-college">College</Label>
          <Input id="filter-college" value={college} onChange={(event) => onCollegeChange(event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filter-branch">Branch</Label>
          <Input id="filter-branch" value={branch} onChange={(event) => onBranchChange(event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filter-graduation-year">Graduation Year</Label>
          <Input
            id="filter-graduation-year"
            type="number"
            value={graduationYear}
            onChange={(event) => onGraduationYearChange(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Sort by</Label>
          <div className="flex gap-2">
            {SORT_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={sort === option.value ? "default" : "outline"}
                onClick={() => onSortChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="flex-1 space-y-1.5">
          <Label>Skills</Label>
          <SkillsInput skills={skills} onChange={onSkillsChange} />
        </div>
        {hasActiveFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={onReset} className="shrink-0">
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
}
