import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { RoleProtectedRoute } from "./RoleProtectedRoute";
import { RootRedirect } from "./RootRedirect";
import { ROUTES } from "./routePaths";
import { ADMIN_ROLES, STUDENT_ROLES } from "@/features/auth/constants/roles";
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import ResumePage from "@/pages/ResumePage";
import ResumeAnalysisPage from "@/pages/ResumeAnalysisPage";
import JobAnalysisPage from "@/pages/JobAnalysisPage";
import InterviewPage from "@/pages/InterviewPage";
import SettingsPage from "@/pages/SettingsPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import AdminResumesPage from "@/pages/AdminResumesPage";
import AdminDailyDsaPage from "@/pages/AdminDailyDsaPage";
import DailyDsaPage from "@/features/daily-dsa/pages/DailyDsaPage";
import MyProfilePage from "@/features/profile/pages/MyProfilePage";
import EditProfilePage from "@/features/profile/pages/EditProfilePage";
import PublicProfilePage from "@/features/profile/pages/PublicProfilePage";
import StudentSearchPage from "@/features/profile/pages/StudentSearchPage";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage";
import FriendsPage from "@/features/friends/pages/FriendsPage";
import ChallengesPage from "@/features/challenges/pages/ChallengesPage";
import LeaderboardPage from "@/features/leaderboard/pages/LeaderboardPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import NotFoundPage from "@/pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<RootRedirect />} />

      <Route element={<PublicRoute />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
      </Route>

      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.RESUME} element={<ResumePage />} />
          <Route path={ROUTES.RESUME_ANALYSIS} element={<ResumeAnalysisPage />} />
          <Route path={ROUTES.JOB_ANALYSIS} element={<JobAnalysisPage />} />
          <Route path={ROUTES.INTERVIEW} element={<InterviewPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />

          <Route path={ROUTES.PROFILE} element={<MyProfilePage />} />
          <Route path={ROUTES.PROFILE_EDIT} element={<EditProfilePage />} />
          <Route path={ROUTES.PUBLIC_PROFILE} element={<PublicProfilePage />} />
          <Route path={ROUTES.PUBLIC_PROFILE_BY_USERNAME} element={<PublicProfilePage />} />
          <Route path={ROUTES.STUDENT_SEARCH} element={<StudentSearchPage />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
          <Route path={ROUTES.FRIENDS} element={<FriendsPage />} />
          <Route path={ROUTES.CHALLENGES} element={<ChallengesPage />} />
          <Route path={ROUTES.LEADERBOARD} element={<LeaderboardPage />} />

          <Route element={<RoleProtectedRoute allowedRoles={STUDENT_ROLES} />}>
            <Route path={ROUTES.DAILY_DSA} element={<DailyDsaPage />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={ADMIN_ROLES} />}>
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
            <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
            <Route path={ROUTES.ADMIN_RESUMES} element={<AdminResumesPage />} />
            <Route path={ROUTES.ADMIN_DAILY_DSA} element={<AdminDailyDsaPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
