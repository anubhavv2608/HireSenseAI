import { useParams } from "react-router-dom";
import { PageContainer } from "@/components/common/PageContainer";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { isApiError } from "@/api/apiError";
import { FriendActionButton } from "@/features/friends/components/FriendActionButton";
import { ChallengeActionButton } from "@/features/challenges/components/ChallengeActionButton";
import { usePublicProfile, usePublicProfileByUsername } from "../hooks/usePublicProfile";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileStats } from "../components/ProfileStats";
import { ProfileCompletion } from "../components/ProfileCompletion";

export default function PublicProfilePage() {
  const { userId, username } = useParams<{ userId?: string; username?: string }>();
  const byUserId = usePublicProfile(username ? "" : (userId ?? ""));
  const byUsername = usePublicProfileByUsername(username ?? "");
  const query = username ? byUsername : byUserId;
  const notFound = query.isError && isApiError(query.error) && query.error.status === 404;

  return (
    <PageContainer className="space-y-6">
      {query.isPending ? (
        <LoadingSkeleton variant="card" />
      ) : notFound ? (
        <EmptyState title="Profile not found" description="This student doesn't have a profile yet." />
      ) : query.isError ? (
        <ErrorState description="Couldn't load this profile." onRetry={() => query.refetch()} />
      ) : query.data ? (
        <>
          <ProfileHeader
            name={query.data.name}
            username={query.data.username}
            profilePicture={query.data.profilePicture}
            college={query.data.college}
            degree={query.data.degree}
            branch={query.data.branch}
            graduationYear={query.data.graduationYear}
            about={query.data.about}
            skills={query.data.skills}
            github={query.data.github}
            linkedin={query.data.linkedin}
            leetcode={query.data.leetcode}
            codeforces={query.data.codeforces}
            actions={
              <div className="flex gap-2">
                <FriendActionButton targetUserId={query.data.userId} />
                <ChallengeActionButton targetUserId={query.data.userId} targetName={query.data.name} />
              </div>
            }
          />
          <ProfileStats
            stats={{
              resumeScore: query.data.resumeScore,
              currentStreak: query.data.currentStreak,
              bestStreak: query.data.bestStreak,
              problemsSolved: query.data.problemsSolved,
            }}
          />
          <ProfileCompletion percentage={query.data.completionPercentage} />
        </>
      ) : null}
    </PageContainer>
  );
}
