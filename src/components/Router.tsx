import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import HomePage from '@/components/pages/HomePage';
import AdminDashboard from '@/components/pages/AdminDashboard';
import AdminLoginPage from '@/components/pages/AdminLoginPage';
import TeamPage from '@/components/pages/TeamPage';
import GalleryPage from '@/components/pages/GalleryPage';
import UpdateCampaignVideo from '@/components/pages/UpdateCampaignVideo';
import AdminCampaignDatesPage from '@/components/pages/AdminCampaignDatesPage';
import CampaignsPage from '@/components/pages/CampaignsPageNew';
import AdminCampaignsPage from '@/components/pages/AdminCampaignsPage';
import { AdminProtectedRoute } from '@/components/ui/admin-protected-route';
import { TeamProtectedRoute } from '@/components/ui/team-protected-route';
import DonationNotificationPopup from '@/components/DonationNotificationPopup';
import TeamLoginPage from '@/components/pages/TeamLoginPage';
import TeamDashboardPage from '@/components/pages/TeamDashboardPage';
import CampaignDetailPage from '@/components/pages/CampaignDetailPage';
import AdminDonationsPage from '@/components/pages/AdminDonationsPage';
import AdminMatchersPage from '@/components/pages/AdminMatchersPage';
import AdminAnalyticsPage from '@/components/pages/AdminAnalyticsPage';
import VideoEditorPage from '@/components/pages/VideoEditorPage';
import AIWebsiteEditorPage from '@/components/pages/AIWebsiteEditorPage';
import DonorProfilePage from '@/components/pages/DonorProfilePage';
import { MemberProtectedRoute } from '@/components/ui/member-protected-route';
import DiagnosticPanel from '@/components/DiagnosticPanel';

// Layout component that includes ScrollToTop
function Layout() {
  return (
    <>
      <ScrollToTop />
      <DonationNotificationPopup />
      <DiagnosticPanel />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <CampaignsPage />,
      },
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "admin-login",
        element: <AdminLoginPage />,
      },
      {
        path: "admin",
        element: (
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "team/:teamId",
        element: <TeamPage />,
      },
      {
        path: "campaigns",
        element: <CampaignsPage />,
      },
      {
        path: "gallery",
        element: <GalleryPage />,
      },
      {
        path: "update-video",
        element: <UpdateCampaignVideo />,
      },
      {
        path: "admin/campaigns",
        element: (
          <AdminProtectedRoute>
            <AdminCampaignsPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/campaign-dates",
        element: (
          <AdminProtectedRoute>
            <AdminCampaignDatesPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/donations",
        element: (
          <AdminProtectedRoute>
            <AdminDonationsPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/matchers",
        element: (
          <AdminProtectedRoute>
            <AdminMatchersPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/analytics",
        element: (
          <AdminProtectedRoute>
            <AdminAnalyticsPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/video-editor",
        element: (
          <AdminProtectedRoute>
            <VideoEditorPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/ai-editor",
        element: (
          <AdminProtectedRoute>
            <AIWebsiteEditorPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "campaign/:campaignId",
        element: <CampaignDetailPage />,
      },
      {
        path: "team-login",
        element: <TeamLoginPage />,
      },
      {
        path: "team-dashboard",
        element: (
          <TeamProtectedRoute>
            <TeamDashboardPage />
          </TeamProtectedRoute>
        ),
      },
      {
        path: "donor-profile",
        element: (
          <MemberProtectedRoute>
            <DonorProfilePage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_NAME,
});

export default function AppRouter() {
  return (
    <MemberProvider>
      <RouterProvider router={router} />
    </MemberProvider>
  );
}
