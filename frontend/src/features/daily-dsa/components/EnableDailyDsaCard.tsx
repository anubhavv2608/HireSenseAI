import { Flame } from "lucide-react";
import { ContentCard } from "@/components/common/ContentCard";
import { Button } from "@/components/ui/button";
import { toastSuccess, toastError } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { useEnableDailyDsa } from "../hooks/useEnableDailyDsa";

export function EnableDailyDsaCard() {
  const enableMutation = useEnableDailyDsa();

  function handleEnable() {
    enableMutation.mutate(undefined, {
      onSuccess: () => toastSuccess("Daily DSA enabled", "Your first challenge is ready."),
      onError: (error) => {
        if (isApiError(error) && error.isNetworkError) {
          toastError("Network error", "Check your connection and try again.");
          return;
        }
        toastError("Couldn't enable Daily DSA", isApiError(error) ? error.message : "Server error");
      },
    });
  }

  return (
    <ContentCard title="Enable Daily DSA">
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <Flame className="size-10 text-primary" aria-hidden="true" />
        <div className="max-w-md space-y-2">
          <p className="text-sm text-muted-foreground">
            Turn on Daily DSA to get a new coding problem every day, build a solving streak, and track your
            progress over time.
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• A fresh, hand-picked assignment published each day</li>
            <li>• Streak tracking that rewards daily consistency</li>
            <li>• Statistics on your completion rate and history</li>
          </ul>
        </div>
        <Button onClick={handleEnable} disabled={enableMutation.isPending}>
          {enableMutation.isPending ? "Enabling..." : "Enable Daily DSA"}
        </Button>
      </div>
    </ContentCard>
  );
}
