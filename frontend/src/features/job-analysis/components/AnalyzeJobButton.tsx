import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/common/Spinner";

interface AnalyzeJobButtonProps {
  isPending: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function AnalyzeJobButton({ isPending, disabled, onClick }: AnalyzeJobButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled || isPending} aria-busy={isPending}>
      {isPending ? (
        <>
          <Spinner size="sm" />
          Analyzing...
        </>
      ) : (
        "Analyze Job Description"
      )}
    </Button>
  );
}
