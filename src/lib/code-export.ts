/**
 * Code Export Utility
 * Generates a zip file containing the full website source code
 */

export async function downloadFullCodeAsZip() {
  try {
    // Dynamically import JSZip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Get all source files from the repository
    const sourceFiles = await fetchSourceFiles();

    // Add files to zip
    sourceFiles.forEach(({ path, content }) => {
      zip.file(path, content);
    });

    // Generate zip blob
    const blob = await zip.generateAsync({ type: 'blob' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `website-code-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, message: 'Code downloaded successfully' };
  } catch (error) {
    console.error('Error downloading code:', error);
    throw new Error('Failed to download code. Please try again.');
  }
}

async function fetchSourceFiles(): Promise<Array<{ path: string; content: string }>> {
  const files: Array<{ path: string; content: string }> = [];

  // List of important directories and files to include
  const sourceStructure = {
    'src/components': true,
    'src/entities': true,
    'src/hooks': true,
    'src/lib': true,
    'src/pages': true,
    'src/services': true,
    'src/stores': true,
    'src/styles': true,
    'integrations': true,
    'public': true,
  };

  // Configuration files
  const configFiles = [
    'tsconfig.json',
    'tailwind.config.mjs',
    'astro.config.mjs',
    'package.json',
    'vite.config.ts',
    'postcss.config.mjs',
    'wix.config.json',
    '.env.example',
    'README.md',
  ];

  // Fetch configuration files
  for (const file of configFiles) {
    try {
      const response = await fetch(`/${file}`);
      if (response.ok) {
        const content = await response.text();
        files.push({ path: file, content });
      }
    } catch (error) {
      console.warn(`Could not fetch ${file}:`, error);
    }
  }

  // Fetch source files - this is a simplified approach
  // In production, you'd want to use a backend API to properly traverse directories
  const sourceFiles = [
    // Components
    'src/components/Router.tsx',
    'src/components/DonationWidget.tsx',
    'src/components/VideoPlayer.tsx',
    'src/components/VideoEditor.tsx',
    'src/components/TeamEmailSender.tsx',
    'src/components/BreadcrumbNav.tsx',
    'src/components/DonationNotificationPopup.tsx',
    'src/components/DiagnosticPanel.tsx',
    'src/components/AdvancedFilters.tsx',
    'src/components/AdvancedSearchBar.tsx',
    'src/components/CampaignComparisonTool.tsx',
    'src/components/CampaignReviews.tsx',
    'src/components/CircularCountdownTimer.tsx',
    'src/components/ConfettiAnimation.tsx',
    'src/components/CountdownTimer.tsx',
    'src/components/DarkModeToggle.tsx',
    'src/components/DonationCalculator.tsx',
    'src/components/DonationReceiptGenerator.tsx',
    'src/components/DonationTiersSelector.tsx',
    'src/components/FAQSection.tsx',
    'src/components/FilesFilePlayer.tsx',
    'src/components/HighContrastToggle.tsx',
    'src/components/ImpactTracker.tsx',
    'src/components/Leaderboards.tsx',
    'src/components/LiveChat.tsx',
    'src/components/RecurringDonationSelector.tsx',
    'src/components/ReducedMotionWrapper.tsx',
    'src/components/SEOHead.tsx',
    'src/components/TestimonialsSection.tsx',
    // Pages
    'src/components/pages/HomePage.tsx',
    'src/components/pages/AdminDashboard.tsx',
    'src/components/pages/AdminLoginPage.tsx',
    'src/components/pages/AdminCampaignsPage.tsx',
    'src/components/pages/AdminCampaignDatesPage.tsx',
    'src/components/pages/AdminDonationsPage.tsx',
    'src/components/pages/AdminMatchersPage.tsx',
    'src/components/pages/AdminAnalyticsPage.tsx',
    'src/components/pages/CampaignsPageNew.tsx',
    'src/components/pages/CampaignDetailPage.tsx',
    'src/components/pages/GalleryPage.tsx',
    'src/components/pages/TeamPage.tsx',
    'src/components/pages/TeamLoginPage.tsx',
    'src/components/pages/TeamDashboardPage.tsx',
    'src/components/pages/DonorProfilePage.tsx',
    'src/components/pages/VideoEditorPage.tsx',
    'src/components/pages/AIWebsiteEditorPage.tsx',
    'src/components/pages/UpdateCampaignVideo.tsx',
    // Entities
    'src/entities/index.ts',
    // Hooks
    'src/hooks/use-toast.tsx',
    'src/hooks/use-size.ts',
    // Lib
    'src/lib/scroll-to-top.tsx',
    'src/lib/utils.ts',
    'src/lib/media-upload.ts',
    'src/lib/sitemap-generator.ts',
    // Services
    'src/services/aiService.ts',
    // Stores
    'src/stores/donationStore.ts',
    'src/stores/donationHistoryStore.ts',
    'src/stores/favoritesStore.ts',
    'src/stores/filterStore.ts',
    // Styles
    'src/styles/global.css',
    'src/styles/fonts.css',
    // Pages
    'src/pages/[...slug].astro',
    // API
    'src/pages/api/send-email.ts',
  ];

  for (const file of sourceFiles) {
    try {
      const response = await fetch(`/${file}`);
      if (response.ok) {
        const content = await response.text();
        files.push({ path: file, content });
      }
    } catch (error) {
      console.warn(`Could not fetch ${file}:`, error);
    }
  }

  return files;
}

/**
 * Alternative: Download code as a tar.gz file
 * Requires backend support
 */
export async function downloadCodeFromBackend() {
  try {
    const response = await fetch('/api/export-code', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to export code');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `website-code-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, message: 'Code downloaded successfully' };
  } catch (error) {
    console.error('Error downloading code from backend:', error);
    throw new Error('Failed to download code. Please try again.');
  }
}
