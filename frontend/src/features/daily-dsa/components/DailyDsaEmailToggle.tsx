import { Link } from "react-router-dom";
import { ContentCard } from "@/components/common/ContentCard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toastError, toastSuccess } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { useMyProfile } from "@/features/profile/hooks/useMyProfile";
import { useUpdateDailyDsaEmailPreference } from "@/features/profile/hooks/useUpdateDailyDsaEmailPreference";
import { ROUTES } from "@/routes/routePaths";

export function DailyDsaEmailToggle() {
  const query = useMyProfile();
  const mutation = useUpdateDailyDsaEmailPreference();
  const notCreatedYet = query.isError && isApiError(query.error) && query.error.status === 404;

  if (query.isPending) return null;

  if (notCreatedYet) {
    return (
      <ContentCard>
        <p className="text-sm text-muted-foreground">
          <Link to={ROUTES.PROFILE_EDIT} className="text-primary hover:underline">
            Complete your profile
          </Link>{" "}
          to manage email preferences.
        </p>
      </ContentCard>
    );
  }

  if (!query.data) return null;

  const checked = query.data.profile.receiveDailyDSAEmails;

  return (
    <ContentCard>
      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="daily-dsa-email-toggle">Email me the daily problem</Label>
          <p className="text-sm text-muted-foreground">Get today's problem in your inbox when it's published.</p>
        </div>
        <Switch
          id="daily-dsa-email-toggle"
          checked={checked}
          disabled={mutation.isPending}
          onCheckedChange={(value) =>
            mutation.mutate(value, {
              onSuccess: () => toastSuccess(value ? "You'll get daily emails" : "Daily emails turned off"),
              onError: (error) =>
                toastError("Couldn't update preference", isApiError(error) ? error.message : undefined),
            })
          }
        />
      </div>
    </ContentCard>
  );
}
