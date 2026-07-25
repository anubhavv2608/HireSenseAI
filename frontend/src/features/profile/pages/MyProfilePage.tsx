import { Link } from "react-router-dom";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { isApiError } from "@/api/apiError";
import { useMyProfile } from "../hooks/useMyProfile";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileStats } from "../components/ProfileStats";
import { ProfileCompletion } from "../components/ProfileCompletion";
import { ROUTES } from "@/routes/routePaths";

export default function MyProfilePage() {
  const { user } = useAuth();
  const query = useMyProfile();
  const notCreatedYet = query.isError && isApiError(query.error) && query.error.status === 404;

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="My Profile" description="Manage how you appear to other students." />

      {query.isPending ? (
        <LoadingSkeleton variant="card" />
      ) : notCreatedYet ? (
        <EmptyState
          title="Set up your profile"
          description="Add your college, skills, and social links so other students can find and connect with you."
          action={
            <Button asChild>
              <Link to={ROUTES.PROFILE_EDIT}>Create Profile</Link>
            </Button>
          }
        />
      ) : query.isError ? (
        <ErrorState description="Couldn't load your profile." onRetry={() => query.refetch()} />
      ) : query.data ? (
        <>
          <ProfileHeader
            name={query.data.profile.fullName}
            username={user?.username}
            email={user?.email}
            profilePicture={query.data.profile.profilePicture}
            college={query.data.profile.college}
            degree={query.data.profile.degree}
            branch={query.data.profile.branch}
            graduationYear={query.data.profile.graduationYear}
            about={query.data.profile.bio}
            skills={query.data.profile.skills}
            github={query.data.profile.github}
            linkedin={query.data.profile.linkedin}
            leetcode={query.data.profile.leetcode}
            codeforces={query.data.profile.codeforces}
            actions={
              <Button asChild>
                <Link to={ROUTES.PROFILE_EDIT}>Edit Profile</Link>
              </Button>
            }
          />
          <ProfileStats stats={query.data.stats} />
          <ProfileCompletion percentage={query.data.completionPercentage} />
        </>
      ) : null}
    </PageContainer>
  );
}
