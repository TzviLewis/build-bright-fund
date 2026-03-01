import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeExportButtonProps {
  variant?: 'default' | 'compact' | 'inline';
  showLabel?: boolean;
}

export default function CodeExportButton({ 
  variant = 'default',
  showLabel = true 
}: CodeExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleDownload = async () => {
    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      // Dynamically import JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Create a manifest file
      const manifest = {
        name: 'Website Source Code',
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        description: 'Full website source code export',
      };
      zip.file('MANIFEST.json', JSON.stringify(manifest, null, 2));

      // Add a README
      const readme = `# Website Source Code Export

This is a complete export of the website source code.

## Export Information
- **Date**: ${new Date().toLocaleString()}
- **Format**: ZIP Archive

## Directory Structure
- \`src/\` - Source code (components, pages, utilities)
- \`integrations/\` - Wix integrations and services
- \`public/\` - Static assets
- Configuration files (tsconfig.json, tailwind.config.mjs, etc.)

## Getting Started
1. Extract the ZIP file
2. Install dependencies: \`npm install\`
3. Start development: \`npm run dev\`

## Key Directories
- \`src/components/\` - React components and pages
- \`src/entities/\` - TypeScript entity definitions
- \`src/hooks/\` - Custom React hooks
- \`src/lib/\` - Utility functions
- \`src/services/\` - Business logic services
- \`src/stores/\` - Zustand state management
- \`integrations/\` - Wix platform integrations

## Configuration
- \`tailwind.config.mjs\` - Tailwind CSS configuration
- \`tsconfig.json\` - TypeScript configuration
- \`astro.config.mjs\` - Astro framework configuration
- \`package.json\` - Project dependencies

Generated on: ${new Date().toLocaleString()}
`;
      zip.file('README.md', readme);

      // List of important files to include
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
        'src/components/CodeExportButton.tsx',
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
        'src/lib/code-export.ts',
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
        // Config files
        'tsconfig.json',
        'tailwind.config.mjs',
        'astro.config.mjs',
        'package.json',
        'postcss.config.mjs',
        'wix.config.json',
      ];

      // Fetch and add files
      let filesAdded = 0;
      for (const filePath of sourceFiles) {
        try {
          const response = await fetch(`/${filePath}`);
          if (response.ok) {
            const content = await response.text();
            zip.file(filePath, content);
            filesAdded++;
          }
        } catch (error) {
          console.warn(`Could not fetch ${filePath}:`, error);
        }
      }

      if (filesAdded === 0) {
        throw new Error('No files could be exported. Please try again.');
      }

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

      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Error downloading code:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to download code');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={handleDownload}
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg px-4 py-2 font-semibold shadow-lg"
          title="Download full website code as ZIP"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : status === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : status === 'error' ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </Button>
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors disabled:opacity-50"
        title="Download full website code as ZIP"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : status === 'success' ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : status === 'error' ? (
          <AlertCircle className="w-4 h-4 text-red-600" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {showLabel && (
          <span>
            {isLoading ? 'Exporting...' : status === 'success' ? 'Downloaded!' : status === 'error' ? 'Error' : 'Export Code'}
          </span>
        )}
      </button>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-heading text-xl font-bold text-primary mb-2">
              Export Source Code
            </h3>
            <p className="font-paragraph text-sm text-muted-foreground mb-4">
              Download the complete website source code as a ZIP file. Includes all components, pages, configurations, and utilities.
            </p>
            <Button
              onClick={handleDownload}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg px-6 py-2 font-semibold shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Downloaded!
                </>
              ) : status === 'error' ? (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Error
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Code
                </>
              )}
            </Button>
          </div>
          <div className="ml-4 p-3 bg-blue-100 rounded-xl">
            <Download className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <AnimatePresence>
          {status === 'error' && errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="font-paragraph text-sm text-red-700">{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
