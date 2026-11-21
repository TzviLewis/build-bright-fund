import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import { AdminProtectedRoute } from '@/components/ui/admin-protected-route';
import { TeamProtectedRoute } from '@/components/ui/team-protected-route';
import { MemberProtectedRoute } from '@/components/ui/member-protected-route';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load all page components
const HomePage = lazy(() => import('@/components/pages/HomePage'));
const AdminDashboard = lazy(() => import('@/components/pages/AdminDashboard'));
const AdminLoginPage = lazy(() => import('@/components/pages/AdminLoginPage'));
const TeamPage = lazy(() => import('@/components/pages/TeamPage'));
const GalleryPage = lazy(() => import('@/components/pages/GalleryPage'));
const UpdateCampaignVideo = lazy(() => import('@/components/pages/UpdateCampaignVideo'));
const AdminCampaignDatesPage = lazy(() => import('@/components/pages/AdminCampaignDatesPage'));
const CampaignsPage = lazy(() => import('@/components/pages/CampaignsPageNew'));
const AdminCampaignsPage = lazy(() => import('@/components/pages/AdminCampaignsPage'));
const TeamLoginPage = lazy(() => import('@/components/pages/TeamLoginPage'));
const TeamDashboardPage = lazy(() => import('@/components/pages/TeamDashboardPage'));
const CampaignDetailPage = lazy(() => import('@/components/pages/CampaignDetailPage'));
const AdminDonationsPage = lazy(() => import('@/components/pages/AdminDonationsPage'));
const AdminMatchersPage = lazy(() => import('@/components/pages/AdminMatchersPage'));
const AdminAnalyticsPage = lazy(() => import('@/components/pages/AdminAnalyticsPage'));
const VideoEditorPage = lazy(() => import('@/components/pages/VideoEditorPage'));
const AIWebsiteEditorPage = lazy(() => import('@/components/pages/AIWebsiteEditorPage'));
const DonorProfilePage = lazy(() => import('@/components/pages/DonorProfilePage'));

// Fallback component for lazy loading
function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  );
}

// Layout component that includes ScrollToTop
function Layout() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
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
        element: (
          <Suspense fallback={<PageFallback />}>
            <CampaignsPage />
          </Suspense>
        ),
      },
      {
        path: "home",
        element: (
          <Suspense fallback={<PageFallback />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: "admin-login",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminLoginPage />
          </Suspense>
        ),
      },
      {
        path: "admin",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "team/:teamId",
        element: (
          <Suspense fallback={<PageFallback />}>
            <TeamPage />
          </Suspense>
        ),
      },
      {
        path: "campaigns",
        element: (
          <Suspense fallback={<PageFallback />}>
            <CampaignsPage />
          </Suspense>
        ),
      },
      {
        path: "gallery",
        element: (
          <Suspense fallback={<PageFallback />}>
            <GalleryPage />
          </Suspense>
        ),
      },
      {
        path: "update-video",
        element: (
          <Suspense fallback={<PageFallback />}>
            <UpdateCampaignVideo />
          </Suspense>
        ),
      },
      {
        path: "admin/campaigns",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminProtectedRoute>
              <AdminCampaignsPage />
            </AdminProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "admin/campaign-dates",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminProtectedRoute>
              <AdminCampaignDatesPage />
            </AdminProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "admin/donations",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminProtectedRoute>
              <AdminDonationsPage />
            </AdminProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "admin/matchers",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminProtectedRoute>
              <AdminMatchersPage />
            </AdminProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "admin/analytics",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminProtectedRoute>
              <AdminAnalyticsPage />
            </AdminProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "admin/video-editor",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminProtectedRoute>
              <VideoEditorPage />
            </AdminProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "admin/ai-editor",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminProtectedRoute>
              <AIWebsiteEditorPage />
            </AdminProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "campaign/:campaignId",
        element: (
          <Suspense fallback={<PageFallback />}>
            <CampaignDetailPage />
          </Suspense>
        ),
      },
      {
        path: "c/:campaignSlug",
        element: (
          <Suspense fallback={<PageFallback />}>
            <CampaignDetailPage />
          </Suspense>
        ),
      },
      {
        path: "team-login",
        element: (
          <Suspense fallback={<PageFallback />}>
            <TeamLoginPage />
          </Suspense>
        ),
      },
      {
        path: "team-dashboard",
        element: (
          <Suspense fallback={<PageFallback />}>
            <TeamProtectedRoute>
              <TeamDashboardPage />
            </TeamProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "donor-profile",
        element: (
          <Suspense fallback={<PageFallback />}>
            <MemberProtectedRoute>
              <DonorProfilePage />
            </MemberProtectedRoute>
          </Suspense>
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
