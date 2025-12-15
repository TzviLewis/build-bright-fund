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
import { AdminProtectedRoute } from '@/components/ui/admin-protected-route';
import DonationNotificationPopup from '@/components/DonationNotificationPopup';

// Layout component that includes ScrollToTop
function Layout() {
  return (
    <>
      <ScrollToTop />
      <DonationNotificationPopup />
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
        path: "gallery",
        element: <GalleryPage />,
      },
      {
        path: "update-video",
        element: <UpdateCampaignVideo />,
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
