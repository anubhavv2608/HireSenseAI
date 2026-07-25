import type { AxiosProgressEvent } from "axios";
import { apiClient } from "@/api/axiosClient";
import type { ApiEnvelope } from "@/types/api.types";
import type {
  MyProfileResponse,
  PaginatedResult,
  Profile,
  ProfilePicture,
  PublicProfile,
  SaveProfilePayload,
  SearchStudentsQuery,
  StudentCard,
} from "../types/profile.types";

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise;
  if (!data.data) {
    throw new Error(data.message || "Unexpected empty response.");
  }
  return data.data;
}

function toFormData(file: File): FormData {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
}

export const profileApi = {
  getMyProfile: (): Promise<MyProfileResponse> => unwrap(apiClient.get("/profile/me")),

  createProfile: async (payload: SaveProfilePayload): Promise<Profile> => {
    const { profile } = await unwrap<{ profile: Profile }>(apiClient.post("/profile", payload));
    return profile;
  },

  updateProfile: async (payload: SaveProfilePayload): Promise<Profile> => {
    const { profile } = await unwrap<{ profile: Profile }>(apiClient.patch("/profile/me", payload));
    return profile;
  },

  updateDailyDsaEmailPreference: async (receiveDailyDSAEmails: boolean): Promise<Profile> => {
    const { profile } = await unwrap<{ profile: Profile }>(
      apiClient.patch("/profile/me", { receiveDailyDSAEmails }),
    );
    return profile;
  },

  uploadProfilePicture: async (
    file: File,
    onUploadProgress?: (event: AxiosProgressEvent) => void,
  ): Promise<ProfilePicture> => {
    const { profilePicture } = await unwrap<{ profilePicture: ProfilePicture }>(
      apiClient.post("/profile/me/picture", toFormData(file), { onUploadProgress }),
    );
    return profilePicture;
  },

  removeProfilePicture: async (): Promise<void> => {
    await apiClient.delete("/profile/me/picture");
  },

  getPublicProfile: async (userId: string): Promise<PublicProfile> => {
    const { profile } = await unwrap<{ profile: PublicProfile }>(apiClient.get(`/profile/${userId}`));
    return profile;
  },

  getPublicProfileByUsername: async (username: string): Promise<PublicProfile> => {
    const { profile } = await unwrap<{ profile: PublicProfile }>(apiClient.get(`/profile/username/${username}`));
    return profile;
  },

  searchStudents: (query: SearchStudentsQuery): Promise<PaginatedResult<StudentCard>> =>
    unwrap(apiClient.get("/profile/search", { params: query })),
};
