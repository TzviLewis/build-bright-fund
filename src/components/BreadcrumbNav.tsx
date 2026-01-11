import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const pathLabels: Record<string, string> = {
  '': 'Home',
  'campaigns': 'Campaigns',
  'campaign': 'Campaign Details',
  'gallery': 'Gallery',
  'admin': 'Admin Dashboard',
  'admin-login': 'Admin Login',
  'team-login': 'Team Login',
  'team-dashboard': 'Team Dashboard',
  'donor-profile': 'Donor Profile',
  'admin/campaigns': 'Manage Campaigns',
  'admin/campaign-dates': 'Campaign Dates',
  'admin/donations': 'Donations',
  'admin/matchers': 'Matchers',
  'admin/analytics': 'Analytics',
  'admin/video-editor': 'Video Editor',
  'admin/ai-editor': 'AI Editor',
};

export default function BreadcrumbNav() {
  const location = useLocation();
  const pathSegments = location.pathname
    .split('/')
    .filter(segment => segment && !segment.match(/^[a-f0-9-]{36}$/)); // Filter out UUIDs

  // Build breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
  ];

  let currentPath = '';
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ label, path: currentPath });
  }

  // Don't show breadcrumb on home page
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-b border-primary/10 sticky top-0 z-30"
      aria-label="Breadcrumb"
    >
      <div className="max-w-[120rem] mx-auto px-8 py-3">
        <ol className="flex items-center gap-2 flex-wrap">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isHome = index === 0;

            return (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-2"
              >
                {isHome ? (
                  <Link
                    to={item.path}
                    className="flex items-center gap-1 text-primary hover:text-secondary transition-colors duration-200 font-paragraph text-sm"
                    title="Home"
                  >
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">Home</span>
                  </Link>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4 text-primary/40 flex-shrink-0" />
                    {isLast ? (
                      <span className="text-primary font-paragraph font-semibold text-sm truncate">
                        {item.label}
                      </span>
                    ) : (
                      <Link
                        to={item.path}
                        className="text-primary hover:text-secondary transition-colors duration-200 font-paragraph text-sm truncate"
                      >
                        {item.label}
                      </Link>
                    )}
                  </>
                )}
              </motion.li>
            );
          })}
        </ol>
      </div>
    </motion.nav>
  );
}
