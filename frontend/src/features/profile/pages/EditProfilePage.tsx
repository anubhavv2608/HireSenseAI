import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { ContentCard } from "@/components/common/ContentCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toastSuccess, toastError } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { useAuth } from "@/hooks/useAuth";
import { useMyProfile } from "../hooks/useMyProfile";
import { useCreateProfile } from "../hooks/useCreateProfile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { SkillsInput } from "../components/SkillsInput";
import { CollegeTypeSelect } from "../components/CollegeTypeSelect";
import { ProfilePictureUploader } from "../components/ProfilePictureUploader";
import { ROUTES } from "@/routes/routePaths";
import type { ProfileFormValues } from "../types/profile.types";

const EMPTY_FORM: ProfileFormValues = {
  fullName: "",
  college: "",
  collegeType: undefined,
  degree: "",
  branch: "",
  graduationYear: "",
  github: "",
  linkedin: "",
  leetcode: "",
  codeforces: "",
  about: "",
  skills: [],
};

function isDirty(a: ProfileFormValues, b: ProfileFormValues): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

export default function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const query = useMyProfile();
  const createMutation = useCreateProfile();
  const updateMutation = useUpdateProfile();

  const notCreatedYet = query.isError && isApiError(query.error) && query.error.status === 404;
  const profileExists = !!query.data;

  const initialValues = useMemo<ProfileFormValues>(() => {
    if (!query.data) return EMPTY_FORM;
    const { profile } = query.data;
    return {
      fullName: profile.fullName,
      college: profile.college ?? "",
      collegeType: profile.collegeType,
      degree: profile.degree ?? "",
      branch: profile.branch ?? "",
      graduationYear: profile.graduationYear ? String(profile.graduationYear) : "",
      github: profile.github ?? "",
      linkedin: profile.linkedin ?? "",
      leetcode: profile.leetcode ?? "",
      codeforces: profile.codeforces ?? "",
      about: profile.bio ?? "",
      skills: profile.skills,
    };
  }, [query.data]);

  const [form, setForm] = useState<ProfileFormValues>(initialValues);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  const dirty = isDirty(form, initialValues);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (dirty) {
        event.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  function update<K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    if (!form.fullName.trim()) {
      toastError("Name is required");
      return;
    }

    const payload = {
      fullName: form.fullName.trim(),
      college: form.college.trim(),
      collegeType: form.collegeType,
      degree: form.degree.trim(),
      branch: form.branch.trim(),
      graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
      github: form.github.trim(),
      linkedin: form.linkedin.trim(),
      leetcode: form.leetcode.trim(),
      codeforces: form.codeforces.trim(),
      about: form.about.trim(),
      skills: form.skills,
    };

    if (profileExists) {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          toastSuccess("Profile updated");
          navigate(ROUTES.PROFILE);
        },
        onError: (error) => toastError("Couldn't update profile", isApiError(error) ? error.message : undefined),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toastSuccess("Profile created");
          navigate(ROUTES.PROFILE);
        },
        onError: (error) => toastError("Couldn't create profile", isApiError(error) ? error.message : undefined),
      });
    }
  }

  return (
    <PageContainer className="max-w-3xl space-y-6">
      <PageHeader title={profileExists ? "Edit Profile" : "Create Profile"} />

      {query.isPending ? (
        <LoadingSkeleton variant="card" />
      ) : query.isError && !notCreatedYet ? (
        <ErrorState description="Couldn't load your profile." onRetry={() => query.refetch()} />
      ) : (
        <>
          {profileExists && query.data && (
            <ContentCard title="Profile Picture">
              <ProfilePictureUploader
                name={form.fullName || user?.email || ""}
                email={user?.email ?? ""}
                profilePicture={query.data.profile.profilePicture}
              />
            </ContentCard>
          )}

          <ContentCard title="Basic Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={form.fullName} onChange={(event) => update("fullName", event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="college">College Name</Label>
                <Input id="college" value={form.college} onChange={(event) => update("college", event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="degree">Degree</Label>
                <Input id="degree" value={form.degree} onChange={(event) => update("degree", event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="branch">Branch</Label>
                <Input id="branch" value={form.branch} onChange={(event) => update("branch", event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  value={form.graduationYear}
                  onChange={(event) => update("graduationYear", event.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>College Type</Label>
                <CollegeTypeSelect value={form.collegeType} onChange={(value) => update("collegeType", value)} />
              </div>
            </div>
          </ContentCard>

          <ContentCard title="About">
            <Textarea
              value={form.about}
              onChange={(event) => update("about", event.target.value)}
              placeholder="Tell other students a bit about yourself"
              maxLength={500}
            />
          </ContentCard>

          <ContentCard title="Skills">
            <SkillsInput skills={form.skills} onChange={(skills) => update("skills", skills)} />
          </ContentCard>

          <ContentCard title="Social Links">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={form.github}
                  onChange={(event) => update("github", event.target.value)}
                  placeholder="github.com/username"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={form.linkedin}
                  onChange={(event) => update("linkedin", event.target.value)}
                  placeholder="linkedin.com/in/username"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="leetcode">LeetCode</Label>
                <Input
                  id="leetcode"
                  value={form.leetcode}
                  onChange={(event) => update("leetcode", event.target.value)}
                  placeholder="leetcode.com/username"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="codeforces">Codeforces</Label>
                <Input
                  id="codeforces"
                  value={form.codeforces}
                  onChange={(event) => update("codeforces", event.target.value)}
                  placeholder="codeforces.com/profile/username"
                />
              </div>
            </div>
          </ContentCard>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate(ROUTES.PROFILE)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!dirty || isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </>
      )}
    </PageContainer>
  );
}
