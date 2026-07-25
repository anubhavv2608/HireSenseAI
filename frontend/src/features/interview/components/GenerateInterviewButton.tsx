import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/common/Spinner";

interface GenerateInterviewButtonProps {
  isPending: boolean;
  disabled?: boolean;
  hasExisting: boolean;
  onClick: () => void;
}

export function GenerateInterviewButton({ isPending, disabled, hasExisting, onClick }: GenerateInterviewButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled || isPending} aria-busy={isPending}>
      {isPending ? (
        <>
          <Spinner size="sm" />
          {hasExisting ? "Regenerating..." : "Generating..."}
        </>
      ) : hasExisting ? (
        "Regenerate Interview"
      ) : (
        "Generate Interview"
      )}
    </Button>
  );
}
