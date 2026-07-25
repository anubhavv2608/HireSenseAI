import { Link } from "react-router-dom";
import { ContentCard } from "@/components/common/ContentCard";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { isApiError } from "@/api/apiError";
import { useAuth } from "@/hooks/useAuth";
import { useMyProfile } from "@/features/profile/hooks/useMyProfile";
import { ROUTES } from "@/routes/routePaths";

export function ProfileSummaryCard() {
  const { user } = useAuth();
  const query = useMyProfile();
  const notCreatedYet = query.isError && isApiError(query.error) && query.error.status === 404;

  if (!user) return null;

  const profile = query.data?.profile;
  const details = profile ? [profile.college, profile.branch].filter(Boolean).join(" · ") : undefined;

  return (
    <ContentCard>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar
            email={user.email}
            name={profile?.fullName}
            imageUrl={profile?.profilePicture?.url}
            size="lg"
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{profile?.fullName ?? user.email}</p>
            <p className="truncate text-sm text-muted-foreground">@{user.username}</p>
            {details && <p className="truncate text-sm text-muted-foreground">{details}</p>}
          </div>
        </div>
        {notCreatedYet ? (
          <Button asChild size="sm" className="shrink-0">
            <Link to={ROUTES.PROFILE_EDIT}>Complete your profile</Link>
          </Button>
        ) : query.data ? (
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link to={ROUTES.PROFILE}>View Profile</Link>
          </Button>
        ) : null}
      </div>
    </ContentCard>
  );
}
