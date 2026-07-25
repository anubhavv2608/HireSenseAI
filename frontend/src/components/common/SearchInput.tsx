import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchInputProps {
  onValueChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  defaultValue?: string;
}

export function SearchInput({
  onValueChange,
  placeholder = "Search...",
  debounceMs = 300,
  className,
  defaultValue = "",
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const debouncedValue = useDebounce(internalValue, debounceMs);

  useEffect(() => {
    onValueChange(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={internalValue}
        onChange={(event) => setInternalValue(event.target.value)}
        placeholder={placeholder}
        className="pl-8"
        aria-label={placeholder}
      />
    </div>
  );
}
