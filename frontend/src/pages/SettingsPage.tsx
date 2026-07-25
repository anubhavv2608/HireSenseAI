import { useState } from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { ContentCard } from "@/components/common/ContentCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toastSuccess, toastError } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { useUsernameAvailability } from "@/features/auth/hooks/useUsernameAvailability";
import { useUpdateUsername } from "@/features/auth/hooks/useUpdateUsername";
import { isValidUsernameFormat, USERNAME_FORMAT_HINT } from "@/features/auth/utils/username";

export default function SettingsPage() {
  const { user } = useAuth();
  const currentUsername = user?.username;
  const [draft, setDraft] = useState(currentUsername ?? "");
  const debounced = useDebounce(draft.trim().toLowerCase(), 400);
  const updateMutation = useUpdateUsername();

  const isDirty = debounced !== "" && debounced !== currentUsername?.toLowerCase();
  const formatValid = isValidUsernameFormat(debounced);
  const showAvailability = isDirty && formatValid;

  const availabilityQuery = useUsernameAvailability(showAvailability ? debounced : "", currentUsername);
  const isAvailable = availabilityQuery.data?.available;

  function handleSave() {
    if (!isDirty || !formatValid || isAvailable === false) return;
    updateMutation.mutate(debounced, {
      onSuccess: () => toastSuccess("Username updated"),
      onError: (error) => toastError("Couldn't update username", isApiError(error) ? error.message : undefined),
    });
  }

  return (
    <PageContainer className="max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences." />

      <ContentCard
        title="Username"
        description="Your unique @handle, shown on your profile, student cards, and the leaderboard."
      >
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">@</span>
            <Input
              id="username"
              value={draft}
              onChange={(event) => setDraft(event.target.value.toLowerCase())}
              maxLength={25}
              className="max-w-xs"
            />
          </div>

          {draft.trim() !== "" && !formatValid ? (
            <p className="text-sm text-destructive">{USERNAME_FORMAT_HINT}</p>
          ) : showAvailability && availabilityQuery.isFetching ? (
            <p className="text-sm text-muted-foreground">Checking availability…</p>
          ) : showAvailability && isAvailable === false ? (
            <p className="text-sm text-destructive">This username is already taken.</p>
          ) : showAvailability && isAvailable === true ? (
            <p className="text-sm text-success">Available!</p>
          ) : null}

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={!isDirty || !formatValid || isAvailable === false || updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Username"}
            </Button>
          </div>
        </div>
      </ContentCard>
    </PageContainer>
  );
}
