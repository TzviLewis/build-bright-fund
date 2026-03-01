import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails, Donations, Matchers, Teams, GalleryImages } from '@/entities';
import { 
  ArrowLeft, Save, DollarSign, Users, TrendingUp, Calendar, 
  Trash2, Plus, Edit, AlertCircle, CheckCircle, X, Loader2, Image as ImageIcon, Upload, Zap, Film, Copy, Target, Sparkles,
  Download, BarChart3, Settings, Mail, Send, Bell, Clock, Award, Filter, Search, Activity, TrendingDown, 
  RefreshCw, FileText, PieChart, Star, Trophy, Gift, Percent, ChevronRight, Eye, MessageSquare,
  Lock, Shield, Key, Database, Code, Palette, Globe, Link2, Megaphone, Share2, 
  UserCheck, UserX, FileCheck, FileX, Repeat, Workflow, Bot, Brain, Lightbulb,
  CreditCard, Receipt, Wallet, TrendingDown as TrendDown, LineChart, BarChart, 
  Layers, Grid, Layout, Package, Boxes, Archive, FolderOpen, Tags, Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image } from '@/components/ui/image';
import DonationWidget from '@/components/DonationWidget';
import VideoPlayer from '@/components/VideoPlayer';
import VideoEditor from '@/components/VideoEditor';
import TeamEmailSender from '@/components/TeamEmailSender';
import { FILE_SIZE_LIMITS, uploadVideoFile, isValidVideoFile, validateVideoFileSize } from '@/lib/media-upload';

interface FormState {
  campaignTitle: string;
  campaignSlug: string;
  fundraisingGoal: string;
  bonusGoal: string;
  bonusGoalDescription: string;
  projectDescription: string;
  promotionalText: string;
  mainCampaignImage: string;
  campaignVideo: string;
  homepageVideo: string;
  videos: string;
  campaignStartDate: string;
  campaignEndDate: string;
  campaignStatus: string;
  uploadedVideoFile?: File;
}

interface MatcherFormState {
  matcherName: string;
  matchingAmount: string;
  matchingPercentage: string;
  matcherStatus: string;
  contactEmail: string;
  matchingLimit: string;
}

interface TeamFormState {
  teamName: string;
  teamGoal: string;
  teamDescription: string;
  memberCount: string;
  teamLogo: string;
  teamId: string;
  teamPassword: string;
}

interface GalleryFormState {
  title: string;
  image: string;
  altText: string;
  width: string;
  height: string;
  description: string;
  displayOrder: string;
  uploadedFile?: File;
}

interface UIState {
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  showNewMatcher: boolean;
  showNewTeam: boolean;
  showNewGalleryImage: boolean;
  editingMatcherId: string | null;
  editingTeamId: string | null;
  editingGalleryImageId: string | null;
  uploadProgress: number;
  showVideoEditor: boolean;
  showExportModal: boolean;
  showAnalyticsModal: boolean;
  showBulkActions: boolean;
  showEmailSender: boolean;
  selectedTeamForEmail: Teams | null;
  showNotifications: boolean;
  showActivityLog: boolean;
  showQuickStats: boolean;
  showSearchPanel: boolean;
  showRecentActivity: boolean;
  showTopDonors: boolean;
  showGoalTracker: boolean;
  showPerformanceMetrics: boolean;
}

interface DataState {
  campaign: CampaignDetails | null;
  donations: Donations[];
  matchers: Matchers[];
  teams: Teams[];
  galleryImages: GalleryImages[];
}

export default function AdminDashboard() {
  // UI State
  const [ui, setUI] = useState<UIState>({
    loading: true,
    saving: false,
    error: null,
    successMessage: null,
    showNewMatcher: false,
    showNewTeam: false,
    showNewGalleryImage: false,
    editingMatcherId: null,
    editingTeamId: null,
    editingGalleryImageId: null,
    uploadProgress: 0,
    showVideoEditor: false,
    showExportModal: false,
    showAnalyticsModal: false,
    showBulkActions: false,
    showEmailSender: false,
    selectedTeamForEmail: null,
    showNotifications: false,
    showActivityLog: false,
    showQuickStats: false,
    showSearchPanel: false,
    showRecentActivity: false,
    showTopDonors: false,
    showGoalTracker: false,
    showPerformanceMetrics: false,
  });

  // Data State
  const [data, setData] = useState<DataState>({
    campaign: null,
    donations: [],
    matchers: [],
    teams: [],
    galleryImages: [],
  });

  // Campaign Form State
  const [campaignForm, setCampaignForm] = useState<FormState>({
    campaignTitle: '',
    campaignSlug: '',
    fundraisingGoal: '',
    bonusGoal: '',
    bonusGoalDescription: '',
    projectDescription: '',
    promotionalText: '',
    mainCampaignImage: '',
    campaignVideo: '',
    homepageVideo: '',
    videos: '',
    campaignStartDate: '',
    campaignEndDate: '',
    campaignStatus: 'draft',
  });

  // Matcher Form State
  const [matcherForm, setMatcherForm] = useState<MatcherFormState>({
    matcherName: '',
    matchingAmount: '',
    matchingPercentage: '',
    matcherStatus: 'active',
    contactEmail: '',
    matchingLimit: '',
  });

  // Team Form State
  const [teamForm, setTeamForm] = useState<TeamFormState>({
    teamName: '',
    teamGoal: '',
    teamDescription: '',
    memberCount: '',
    teamLogo: '',
    teamId: '',
    teamPassword: '',
  });

  // Gallery Form State
  const [galleryForm, setGalleryForm] = useState<GalleryFormState>({
    title: '',
    image: '',
    altText: '',
    width: '',
    height: '',
    description: '',
    displayOrder: '',
  });

  // Team donations filter state
  const [selectedTeamForDonations, setSelectedTeamForDonations] = useState<string>('');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [amountFilter, setAmountFilter] = useState<string>('');

  // Helper function to generate team ID
  const generateTeamId = () => {
    const id = Math.floor(Math.random() * 1000000).toString();
    setTeamForm(prev => ({ ...prev, teamId: id }));
  };

  // Helper function to generate team password
  const generateTeamPassword = () => {
    const password = Math.random().toString(36).substring(2, 12);
    setTeamForm(prev => ({ ...prev, teamPassword: password }));
  };

  // Helper function to copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setUI(prev => ({ 
        ...prev, 
        successMessage: `${label} copied to clipboard!` 
      }));
      setTimeout(() => {
        setUI(prev => ({ ...prev, successMessage: null }));
      }, 2000);
    }).catch(err => {
      setUI(prev => ({ 
        ...prev, 
        error: `Failed to copy ${label}` 
      }));
      console.error('Error copying to clipboard:', err);
    });
  };

  // Download website code as ZIP
  const handleDownloadCode = async () => {
    try {
      setUI(prev => ({ ...prev, saving: true, error: null }));

      // Create a comprehensive code package
      const codePackage = {
        projectName: data.campaign?.campaignTitle || 'Fundraising Campaign',
        exportDate: new Date().toISOString(),
        campaignData: {
          title: data.campaign?.campaignTitle,
          goal: data.campaign?.fundraisingGoal,
          description: data.campaign?.projectDescription,
          status: data.campaign?.status,
        },
        statistics: {
          totalDonations: data.donations.length,
          totalRaised: data.donations.reduce((sum, d) => sum + (d.amount || 0), 0),
          totalTeams: data.teams.length,
          totalMatchers: data.matchers.length,
        },
        sourceFiles: {
          components: 'src/components/',
          pages: 'src/components/pages/',
          entities: 'src/entities/',
          styles: 'src/styles/',
          services: 'src/services/',
        },
        documentation: `
# ${data.campaign?.campaignTitle || 'Fundraising Campaign'} - Code Export

## Project Overview
This is a complete fundraising campaign management system built with React, TypeScript, and Tailwind CSS.

## Campaign Information
- **Title**: ${data.campaign?.campaignTitle || 'N/A'}
- **Goal**: £${data.campaign?.fundraisingGoal?.toLocaleString() || '0'}
- **Status**: ${data.campaign?.status || 'N/A'}
- **Description**: ${data.campaign?.projectDescription || 'N/A'}

## Current Statistics
- **Total Donations**: ${data.donations.length}
- **Total Raised**: £${data.donations.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}
- **Active Teams**: ${data.teams.length}
- **Matchers**: ${data.matchers.length}

## Project Structure
\`\`\`
src/
├── components/
│   ├── pages/          # Page components
│   ├── ui/             # UI components
│   └── Router.tsx      # Route configuration
├── entities/           # TypeScript types
├── services/           # Business logic
├── stores/             # State management (Zustand)
└── styles/             # Global styles
\`\`\`

## Key Features
- Campaign management dashboard
- Donation tracking and analytics
- Team management system
- Matcher fund coordination
- Gallery image management
- Video upload and playback
- Real-time statistics
- Export data to CSV
- Advanced filtering and search
- Responsive design

## Technologies Used
- React 18+
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- React Router (navigation)
- Zustand (state management)
- shadcn/ui (component library)
- Lucide React (icons)

## Getting Started

### Installation
\`\`\`bash
npm install
\`\`\`

### Development
\`\`\`bash
npm run dev
\`\`\`

### Build
\`\`\`bash
npm run build
\`\`\`

## Admin Panel Features
- Campaign configuration
- Donation management
- Team administration
- Matcher coordination
- Gallery management
- Analytics dashboard
- Bulk actions
- Data export
- Video management

## Data Management
All data is stored in Wix CMS collections:
- **campaigndetails**: Campaign information
- **donations**: Donation records
- **teams**: Team information
- **matchers**: Matching fund details
- **galleryimages**: Campaign images
- **donationtiers**: Donation tier options

## Export Information
- **Export Date**: ${new Date().toLocaleDateString()}
- **Campaign**: ${data.campaign?.campaignTitle || 'N/A'}
- **Total Records**: ${data.donations.length + data.teams.length + data.matchers.length + data.galleryImages.length}

## Support
For questions or issues, please contact the development team.
        `,
      };

      // Create JSON content
      const jsonContent = JSON.stringify(codePackage, null, 2);

      // Create CSV exports
      const donationsCSV = 'Donor Name,Email,Amount,Date,Team,Status,Message\n' +
        data.donations.map(d => {
          const team = data.teams.find(t => t._id === d.teamId);
          return `"${d.donorName || 'Anonymous'}","${d.donorEmail}","${d.amount}","${d.donationDate}","${team?.teamName || 'Individual'}","${d.status}","${d.donorMessage || ''}"`;
        }).join('\n');

      const teamsCSV = 'Team Name,Members,Goal,Description\n' +
        data.teams.map(t => `"${t.teamName}","${t.memberCount}","${t.fundraisingGoal}","${t.teamDescription}"`).join('\n');

      const matchersCSV = 'Matcher Name,Amount,Percentage,Status,Email\n' +
        data.matchers.map(m => `"${m.matcherName}","${m.matchingAmount}","${m.matchingPercentage}%","${m.status}","${m.contactEmail}"`).join('\n');

      // Create a text file with all exports
      const allExports = `
PROJECT EXPORT - ${data.campaign?.campaignTitle || 'Fundraising Campaign'}
Generated: ${new Date().toLocaleString()}

=== CAMPAIGN CONFIGURATION ===
${JSON.stringify(codePackage.campaignData, null, 2)}

=== STATISTICS ===
${JSON.stringify(codePackage.statistics, null, 2)}

=== DONATIONS DATA ===
${donationsCSV}

=== TEAMS DATA ===
${teamsCSV}

=== MATCHERS DATA ===
${matchersCSV}

=== PROJECT STRUCTURE ===
${codePackage.sourceFiles}

=== DOCUMENTATION ===
${codePackage.documentation}
      `;

      // Create multiple download files
      const files = [
        { name: 'project-export.json', content: jsonContent, type: 'application/json' },
        { name: 'README.md', content: codePackage.documentation, type: 'text/markdown' },
        { name: 'data-export.txt', content: allExports, type: 'text/plain' },
        { name: 'donations.csv', content: donationsCSV, type: 'text/csv' },
        { name: 'teams.csv', content: teamsCSV, type: 'text/csv' },
        { name: 'matchers.csv', content: matchersCSV, type: 'text/csv' },
      ];

      // Download each file
      files.forEach(file => {
        const element = document.createElement('a');
        element.setAttribute('href', `data:${file.type};charset=utf-8,${encodeURIComponent(file.content)}`);
        element.setAttribute('download', file.name);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      });

      setUI(prev => ({ 
        ...prev, 
        successMessage: `✅ Downloaded 6 files: project export, documentation, and data exports!` 
      }));
      
      setTimeout(() => {
        setUI(prev => ({ ...prev, successMessage: null }));
      }, 4000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error downloading code';
      setUI(prev => ({ 
        ...prev, 
        error: `Failed to download code: ${errorMsg}` 
      }));
      console.error('Error downloading code:', error);
    } finally {
      setUI(prev => ({ ...prev, saving: false }));
    }
  };

  // Helper function to toggle campaign live status
  const handleToggleCampaignLive = async () => {
    if (!data.campaign?._id) {
      setUI(prev => ({ 
        ...prev, 
        error: 'Campaign not found' 
      }));
      return;
    }

    const isCurrentlyLive = data.campaign.status === 'live';
    const newStatus = isCurrentlyLive ? 'draft' : 'live';
    const confirmMessage = isCurrentlyLive 
      ? 'Are you sure you want to take this campaign offline? It will no longer accept donations.'
      : 'Are you sure you want to go live with this campaign? It will start accepting donations immediately.';

    if (!confirm(confirmMessage)) return;

    try {
      setUI(prev => ({ ...prev, saving: true, error: null }));

      await BaseCrudService.update('campaigndetails', {
        _id: data.campaign._id,
        status: newStatus,
      });

      setUI(prev => ({ 
        ...prev, 
        successMessage: `Campaign is now ${newStatus === 'live' ? 'LIVE' : 'OFFLINE'}!` 
      }));
      
      setTimeout(() => {
        setUI(prev => ({ ...prev, successMessage: null }));
      }, 3000);

      await loadAllData();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error updating campaign status';
      setUI(prev => ({ 
        ...prev, 
        error: `Failed to update campaign status: ${errorMsg}` 
      }));
      console.error('Error updating campaign status:', error);
    } finally {
      setUI(prev => ({ ...prev, saving: false }));
    }
  };

  // Export data as CSV
  const handleExportData = (dataType: 'donations' | 'teams' | 'matchers') => {
    let csvContent = '';
    let filename = '';

    if (dataType === 'donations') {
      csvContent = 'Donor Name,Email,Amount,Date,Team,Status,Message\n';
      data.donations.forEach(d => {
        const team = data.teams.find(t => t._id === d.teamId);
        csvContent += `"${d.donorName || 'Anonymous'}","${d.donorEmail}","${d.amount}","${d.donationDate}","${team?.teamName || 'Individual'}","${d.status}","${d.donorMessage || ''}"\n`;
      });
      filename = 'donations.csv';
    } else if (dataType === 'teams') {
      csvContent = 'Team Name,Members,Goal,Description\n';
      data.teams.forEach(t => {
        csvContent += `"${t.teamName}","${t.memberCount}","${t.fundraisingGoal}","${t.teamDescription}"\n`;
      });
      filename = 'teams.csv';
    } else if (dataType === 'matchers') {
      csvContent = 'Matcher Name,Amount,Percentage,Status,Email\n';
      data.matchers.forEach(m => {
        csvContent += `"${m.matcherName}","${m.matchingAmount}","${m.matchingPercentage}%","${m.status}","${m.contactEmail}"\n`;
      });
      filename = 'matchers.csv';
    }

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setUI(prev => ({ 
      ...prev, 
      successMessage: `${dataType} exported successfully!` 
    }));
    setTimeout(() => {
      setUI(prev => ({ ...prev, successMessage: null }));
    }, 3000);
  };

  // Calculate advanced analytics - only for the current campaign
  const getAnalytics = () => {
    // Note: campaignId doesn't exist in Donations type, showing all donations
    const campaignDonations = data.donations;
    const totalDonations = campaignDonations.length;
    const totalRaised = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const averageDonation = totalDonations > 0 ? totalRaised / totalDonations : 0;
    const completedDonations = campaignDonations.filter(d => d.status === 'completed').length;
    const completionRate = totalDonations > 0 ? (completedDonations / totalDonations) * 100 : 0;
    const topDonor = campaignDonations.length > 0 
      ? campaignDonations.reduce((max, d) => (d.amount || 0) > (max.amount || 0) ? d : max)
      : null;
    const totalTeams = data.teams.length;
    const totalMatchers = data.matchers.length;
    const activeMatchers = data.matchers.filter(m => m.status === 'active').length;

    return {
      totalDonations,
      totalRaised,
      averageDonation,
      completedDonations,
      completionRate,
      topDonor,
      totalTeams,
      totalMatchers,
      activeMatchers,
    };
  };

  // Bulk action: Mark all donations as completed
  const handleMarkAllDonationsCompleted = async () => {
    if (!confirm('Are you sure you want to mark all donations as completed? This action cannot be undone.')) return;

    try {
      setUI(prev => ({ ...prev, saving: true, error: null }));
      
      const updatePromises = data.donations.map(donation => 
        BaseCrudService.update('donations', {
          ...donation,
          status: 'completed'
        })
      );

      await Promise.all(updatePromises);

      setUI(prev => ({ 
        ...prev, 
        successMessage: `Successfully marked ${data.donations.length} donations as completed!` 
      }));
      
      setTimeout(() => {
        setUI(prev => ({ ...prev, successMessage: null }));
      }, 3000);

      await loadAllData();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error updating donations';
      setUI(prev => ({ 
        ...prev, 
        error: `Failed to mark donations as completed: ${errorMsg}` 
      }));
      console.error('Error marking donations as completed:', error);
    } finally {
      setUI(prev => ({ ...prev, saving: false }));
    }
  };

  // Bulk action: Activate all teams
  const handleActivateAllTeams = async () => {
    if (!confirm('Are you sure you want to activate all teams? This action cannot be undone.')) return;

    try {
      setUI(prev => ({ ...prev, saving: true, error: null }));
      
      const updatePromises = data.teams.map(team => 
        BaseCrudService.update('teams', {
          ...team,
          status: 'active'
        })
      );

      await Promise.all(updatePromises);

      setUI(prev => ({ 
        ...prev, 
        successMessage: `Successfully activated ${data.teams.length} teams!` 
      }));
      
      setTimeout(() => {
        setUI(prev => ({ ...prev, successMessage: null }));
      }, 3000);

      await loadAllData();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error updating teams';
      setUI(prev => ({ 
        ...prev, 
        error: `Failed to activate teams: ${errorMsg}` 
      }));
      console.error('Error activating teams:', error);
    } finally {
      setUI(prev => ({ ...prev, saving: false }));
    }
  };

  // Bulk action: Send email to all donors
  const handleSendEmailToDonors = async () => {
    if (!confirm(`Are you sure you want to send an email to all ${data.donations.length} donors?`)) return;

    try {
      setUI(prev => ({ ...prev, saving: true, error: null }));
      
      // Collect all unique donor emails
      const donorEmails = [...new Set(data.donations.map(d => d.donorEmail).filter(Boolean))];
      
      // Create a mailto link with all emails
      const emailSubject = encodeURIComponent('Thank You for Your Donation!');
      const emailBody = encodeURIComponent('Thank you for your generous donation to our campaign. Your support means the world to us!');
      
      // For bulk emails, we'll show a summary instead of opening mailto
      setUI(prev => ({ 
        ...prev, 
        successMessage: `Email ready to send to ${donorEmails.length} donors. Copy the list below to your email service.` 
      }));

      // Copy emails to clipboard
      navigator.clipboard.writeText(donorEmails.join(', ')).then(() => {
        setUI(prev => ({ 
          ...prev, 
          successMessage: `${donorEmails.length} donor emails copied to clipboard!` 
        }));
        setTimeout(() => {
          setUI(prev => ({ ...prev, successMessage: null }));
        }, 3000);
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error preparing emails';
      setUI(prev => ({ 
        ...prev, 
        error: `Failed to prepare emails: ${errorMsg}` 
      }));
      console.error('Error preparing emails:', error);
    } finally {
      setUI(prev => ({ ...prev, saving: false }));
    }
  };

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Load all data from database
  const loadAllData = async () => {
    try {
      setUI(prev => ({ ...prev, loading: true, error: null }));
      
      const [campaignRes, donationsRes, matchersRes, teamsRes, galleryRes] = await Promise.all([
        BaseCrudService.getAll<CampaignDetails>('campaigndetails'),
        BaseCrudService.getAll<Donations>('donations'),
        BaseCrudService.getAll<Matchers>('matchers'),
        BaseCrudService.getAll<Teams>('teams'),
        BaseCrudService.getAll<GalleryImages>('galleryimages'),
      ]);

      const campaign = campaignRes.items?.[0] || null;
      
      setData({
        campaign,
        donations: donationsRes.items || [],
        matchers: matchersRes.items || [],
        teams: teamsRes.items || [],
        galleryImages: galleryRes.items || [],
      });

      // Load campaign form if exists
      if (campaign) {
        setCampaignForm({
          campaignTitle: campaign.campaignTitle || '',
          campaignSlug: '', // campaignSlug doesn't exist in CampaignDetails type
          fundraisingGoal: campaign.fundraisingGoal?.toString() || '',
          bonusGoal: campaign.bonusGoal?.toString() || '',
          bonusGoalDescription: campaign.bonusGoalDescription || '',
          projectDescription: campaign.projectDescription || '',
          promotionalText: campaign.promotionalText || '',
          mainCampaignImage: campaign.mainCampaignImage || '',
          campaignVideo: campaign.campaignVideo || '',
          homepageVideo: campaign.homepageVideo || '',
          videos: campaign.video || '',
          campaignStartDate: campaign.campaignStartDate 
            ? new Date(campaign.campaignStartDate).toISOString().split('T')[0] 
            : '',
          campaignEndDate: campaign.campaignEndDate 
            ? new Date(campaign.campaignEndDate).toISOString().split('T')[0] 
            : '',
          campaignStatus: campaign.status || 'draft',
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load data';
      setUI(prev => ({ 
        ...prev, 
        error: `Failed to load campaign data: ${errorMsg}` 
      }));
      console.error('Error loading data:', error);
    } finally {
      setUI(prev => ({ ...prev, loading: false }));
    }
  };

  // Save campaign
  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!campaignForm.campaignTitle || !campaignForm.fundraisingGoal) {
      setUI(prev => ({ 
        ...prev, 
        error: 'Campaign title and fundraising goal are required' 
      }));
      return;
    }

    try {
      setUI(prev => ({ ...prev, saving: true, error: null }));

      const videoUrl = campaignForm.campaignVideo;

      const campaignData: CampaignDetails = {
        _id: data.campaign?._id || crypto.randomUUID(),
        campaignTitle: campaignForm.campaignTitle,
        // campaignSlug: campaignForm.campaignSlug || '', // Property doesn't exist in CampaignDetails type
        fundraisingGoal: parseFloat(campaignForm.fundraisingGoal),
        bonusGoal: campaignForm.bonusGoal ? parseFloat(campaignForm.bonusGoal) : 0,
        bonusGoalDescription: campaignForm.bonusGoalDescription || '',
        projectDescription: campaignForm.projectDescription || '',
        promotionalText: campaignForm.promotionalText || '',
        mainCampaignImage: campaignForm.mainCampaignImage || '',
        campaignVideo: videoUrl || '',
        homepageVideo: campaignForm.homepageVideo || '',
        video: campaignForm.videos || '',
        campaignStartDate: campaignForm.campaignStartDate 
          ? new Date(campaignForm.campaignStartDate).toISOString() 
          : '',
        campaignEndDate: campaignForm.campaignEndDate 
          ? new Date(campaignForm.campaignEndDate).toISOString() 
          : '',
        status: campaignForm.campaignStatus || 'draft',
      };

      if (data.campaign?._id) {
        await BaseCrudService.update('campaigndetails', campaignData);
      } else {
        await BaseCrudService.create('campaigndetails', campaignData);
      }

      setUI(prev => ({ 
        ...prev, 
        successMessage: 'Campaign saved successfully!' 
      }));
      
      setTimeout(() => {
        setUI(prev => ({ ...prev, successMessage: null }));
      }, 3000);

      await loadAllData();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error saving campaign';
      setUI(prev => ({ 
        ...prev, 
        error: `Failed to save campaign: ${errorMsg}` 
      }));
      console.error('Error saving campaign:', error);
    } finally {
      setUI(prev => ({ ...prev, saving: false }));
    }
  };

  // Add/Update matcher
  const handleSaveMatcher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!matcherForm.matcherName || !matcherForm.matchingAmount || 
        !matcherForm.matchingPercentage || !matcherForm.contactEmail) {
      setUI(prev => ({ 
        ...prev, 
        error: 'All matcher fields are required' 
      }));
      return;
    }

    try {
      setUI(prev => ({ ...prev, saving: true, error: null }));

      const matcherData: Matchers = {
        _id: ui.editingMatcherId || crypto.randomUUID(),
        matcherName: matcherForm.matcherName,
        matchingAmount: parseFloat(matcherForm.matchingAmount),
        matchingPercentage: parseFloat(matcherForm.matchingPercentage),
        status: matcherForm.matcherStatus,
        contactEmail: matcherForm.contactEmail,
        matchingLimit: matcherForm.matchingLimit 
          ? parseFloat(matcherForm.matchingLimit) 
          : undefined,
      };

      if (ui.editingMatcherId) {
        await BaseCrudService.update('matchers', matcherData);
        setUI(prev => ({ 
          ...prev, 
          successMessage: 'Matcher updated successfully!' 
        }));
      } else {
        await BaseCrudService.create('matchers', matcherData);
        setUI(prev => ({ 
          ...prev, 
          successMessage: 'Matcher added successfully!' 
        }));
      }

      resetMatcherForm();
      
      setTimeout(() => {
        setUI(prev => ({ ...prev, successMessage: null }));
      }, 3000);

      await loadAllData();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error saving matcher';
      setUI(prev => ({ 
        ...prev, 
        error: `Failed to save matcher: ${errorMsg}` 
      }));
      console.error('Error saving matcher:', error);
    } finally {
      setUI(prev => ({ ...prev, saving: false }));
    }
  };

  // Delete matcher
  const handleDeleteMatcher = async (matcherId: string) => {
    if (!confirm('Are you sure you want to delete this matcher?')) return;

    try {
      setUI(prev => ({ ...prev, error: null }));
      await BaseCrudService.delete('matchers', matcherId);
      setUI(prev => ({ 
        ...prev, 
        successMessage: 'Matcher deleted successfully!' 
      }));
      
      setTimeout(() => {
        setUI(prev => ({ ...prev, successMessage: null }));
      }, 3000);

      await loadAllData();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error deleting matcher';
      setUI(prev => ({ 
        ...prev, 
        error: `Failed to delete matcher: ${errorMsg}` 
      }));
      console.error('Error deleting matcher:', error);
    }
  };

  // Edit matcher
  const handleEditMatcher = (matcher: Matchers) => {
    setMatcherForm({
      matcherName: matcher.matcherName || '',
      matchingAmount: matcher.matchingAmount?.toString() || '',
      matchingPercentage: matcher.matchingPercentage?.toString() || '',
      matcherStatus: matcher.status || 'active',
      contactEmail: matcher.contactEmail || '',
      matchingLimit: matcher.matchingLimit?.toString() || '',
    });
    setUI(prev => ({ 
      ...prev, 
      showNewMatcher: true, 
      editingMatcherId: matcher._id,
      error: null 
    }));
  };

  // Reset matcher form
  const resetMatcherForm = () => {
    setMatcherForm({
      matcherName: '',
      matchingAmount: '',
      matchingPercentage: '',
      matcherStatus: 'active',
      contactEmail: '',
      matchingLimit: '',
    });
    setUI(prev => ({ 
      ...prev, 
      showNewMatcher: false, 
      editingMatcherId: null,
      error: null 
    }));
  };

  // Add/Update team
  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamForm.teamName || !teamForm.teamGoal || 
        !teamForm.teamDescription || !teamForm.memberCount ||
        !teamForm.teamId || !teamForm.teamPassword) {
      setUI(prev => ({ 
        ...prev, 
        error: 'All team fields including ID and Password are required' 
      }));
      return;
    }

    try {
      setUI(prev => ({ ...prev, saving: true, error: null }));

      const teamData: Teams = {
        _id: ui.editingTeamId || crypto.randomUUID(),
        teamName: teamForm.teamName,
        fundraisingGoal: parseFloat(teamForm.teamGoal),
        teamDescription: teamForm.teamDescription,
        memberCount: parseInt(teamForm.memberCount),
        teamLogo: teamForm.teamLogo,
        teamId: parseInt(teamForm.teamId),
        teamPassword: teamForm.teamPassword,
      };

      if (ui.editingTeamId) {
        await BaseCrudService.update('teams', teamData);
        setUI(prev => ({ 
          ...prev, 
          successMessage: 'Team updated successfully!' 
        }));
      } else {
        await BaseCrudService.create('teams', teamData);
        setUI(prev => ({ 
          ...prev, 
          successMessage: 'Team added successfully!' 
        }));
      }

      resetTeamForm();
      
      setTimeout(() => {
        setUI(prev => ({ ...prev, successMessage: null }));
      }, 3000);

      await loadAllData();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error saving team';
      setUI(prev => ({ 
        ...prev, 
        error: `Failed to save team: ${errorMsg}` 
      }));
      console.error('Error saving team:', error);
    } finally {
      setUI(prev => ({ ...prev, saving: false }));
    }
  };

  // Delete team
  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      setUI(prev => ({ ...prev, error: null }));
      await BaseCrudService.delete('teams', teamId);
      setUI(prev => ({ 
        ...prev, 
        successMessage: 'Team deleted successfully!' 
      }));
      
      setTimeout(() => {
        setUI(prev => ({ ...prev, successMessage: null }));
      }, 3000);

      await loadAllData();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error deleting team';
      setUI(prev => ({ 
        ...prev, 
        error: `Failed to delete team: ${errorMsg}` 
      }));
      console.error('Error deleting team:', error);
    }
  };

  // Edit team
  const handleEditTeam = (team: Teams) => {
    setTeamForm({
      teamName: team.teamName || '',
      teamGoal: team.fundraisingGoal?.toString() || '',
      teamDescription: team.teamDescription || '',
      memberCount: team.memberCount?.toString() || '',
      teamLogo: team.teamLogo || '',
      teamId: team.teamId?.toString() || '',
      teamPassword: team.teamPassword || '',
    });
    setUI(prev => ({ 
      ...prev, 
      showNewTeam: true, 
      editingTeamId: team._id,
      error: null 
    }));
  };

  // Reset team form
  const resetTeamForm = () => {
    setTeamForm({
      teamName: '',
      teamGoal: '',
      teamDescription: '',
      memberCount: '',
      teamLogo: '',
      teamId: '',
      teamPassword: '',
    });
    setUI(prev => ({ 
      ...prev, 
      showNewTeam: false, 
      editingTeamId: null,
      error: null 
    }));
  };

  // Add/Update gallery image
  const handleSaveGalleryImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!galleryForm.title || !galleryForm.image || !galleryForm.altText) {
      setUI(prev => ({ 
        ...prev, 
        error: 'Title, image, and alt text are required' 
      }));
      return;
    }

    try {
      setUI(prev => ({ ...prev, saving: true, error: null }));

      const imageData: GalleryImages = {
        _id: ui.editingGalleryImageId || crypto.randomUUID(),
        title: galleryForm.title,
        image: galleryForm.image,
        altText: galleryForm.altText,
        width: galleryForm.width ? parseInt(galleryForm.width) : undefined,
        height: galleryForm.height ? parseInt(galleryForm.height) : undefined,
        description: galleryForm.description,
        displayOrder: galleryForm.displayOrder ? parseInt(galleryForm.displayOrder) : undefined,
      };

      if (ui.editingGalleryImageId) {
        await BaseCrudService.update('galleryimages', imageData);
        setUI(prev => ({ 
          ...prev, 
          successMessage: 'Gallery image updated successfully!' 
        }));
      } else {
        await BaseCrudService.create('galleryimages', imageData);
        setUI(prev => ({ 
          ...prev, 
          successMessage: 'Gallery image added successfully!' 
        }));
      }

      resetGalleryForm();
      
      setTimeout(() => {
        setUI(prev => ({ ...prev, successMessage: null }));
      }, 3000);

      await loadAllData();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error saving gallery image';
      setUI(prev => ({ 
        ...prev, 
        error: `Failed to save gallery image: ${errorMsg}` 
      }));
      console.error('Error saving gallery image:', error);
    } finally {
      setUI(prev => ({ ...prev, saving: false }));
    }
  };

  // Delete gallery image
  const handleDeleteGalleryImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this gallery image?')) return;

    try {
      setUI(prev => ({ ...prev, error: null }));
      await BaseCrudService.delete('galleryimages', imageId);
      setUI(prev => ({ 
        ...prev, 
        successMessage: 'Gallery image deleted successfully!' 
      }));
      
      setTimeout(() => {
        setUI(prev => ({ ...prev, successMessage: null }));
      }, 3000);

      await loadAllData();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error deleting gallery image';
      setUI(prev => ({ 
        ...prev, 
        error: `Failed to delete gallery image: ${errorMsg}` 
      }));
      console.error('Error deleting gallery image:', error);
    }
  };

  // Edit gallery image
  const handleEditGalleryImage = (image: GalleryImages) => {
    setGalleryForm({
      title: image.title || '',
      image: image.image || '',
      altText: image.altText || '',
      width: image.width?.toString() || '',
      height: image.height?.toString() || '',
      description: image.description || '',
      displayOrder: image.displayOrder?.toString() || '',
    });
    setUI(prev => ({ 
      ...prev, 
      showNewGalleryImage: true, 
      editingGalleryImageId: image._id,
      error: null 
    }));
  };

  // Reset gallery form
  const resetGalleryForm = () => {
    setGalleryForm({
      title: '',
      image: '',
      altText: '',
      width: '',
      height: '',
      description: '',
      displayOrder: '',
      uploadedFile: undefined,
    });
    setUI(prev => ({ 
      ...prev, 
      showNewGalleryImage: false, 
      editingGalleryImageId: null,
      error: null 
    }));
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a data URL for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setGalleryForm(prev => ({ 
          ...prev, 
          image: dataUrl,
          uploadedFile: file 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle video file upload
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!isValidVideoFile(file)) {
      setUI(prev => ({ 
        ...prev, 
        error: 'Invalid video format. Supported formats: MP4, WebM, OGG, MOV, AVI' 
      }));
      return;
    }

    // Validate file size
    const sizeValidation = validateVideoFileSize(file);
    if (!sizeValidation.isValid) {
      setUI(prev => ({ 
        ...prev, 
        error: sizeValidation.error || 'Video file is too large' 
      }));
      return;
    }

    try {
      setUI(prev => ({ ...prev, saving: true, error: null }));

      // Upload to Wix Media Manager
      const uploadResponse = await uploadVideoFile(file, (progress) => {
        setUI(prev => ({ ...prev, uploadProgress: progress }));
      });

      // Set the videos field with the uploaded URL
      setCampaignForm(prev => ({ 
        ...prev, 
        videos: uploadResponse.url,
        uploadedVideoFile: file 
      }));

      setUI(prev => ({ 
        ...prev, 
        successMessage: `Video uploaded successfully! URL: ${uploadResponse.url}`,
        uploadProgress: 0
      }));

      setTimeout(() => {
        setUI(prev => ({ ...prev, successMessage: null }));
      }, 5000);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error uploading video';
      setUI(prev => ({ 
        ...prev, 
        error: `Failed to upload video: ${errorMsg}`,
        uploadProgress: 0
      }));
      console.error('Error uploading video:', error);
    } finally {
      setUI(prev => ({ ...prev, saving: false }));
    }
  };

  // Calculate stats - only for the current campaign
  // Note: campaignId doesn't exist in Donations type, showing all completed donations
  const campaignDonations = data.donations.filter(d => d.status === 'completed');
  const totalRaised = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const completedDonations = campaignDonations;
  const progressPercentage = data.campaign?.fundraisingGoal 
    ? Math.min((totalRaised / data.campaign.fundraisingGoal) * 100, 100)
    : 0;

  // Loading state
  if (ui.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto mb-4" />
          <p className="font-heading text-lg text-primary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header with Gradient */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white border-b-4 border-white/20 shadow-2xl sticky top-0 z-50">
        <div className="max-w-[120rem] mx-auto px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="font-heading text-5xl font-bold tracking-tight">Admin Command Center</h1>
                  <p className="font-paragraph text-lg text-white/90 mt-1">
                    Complete campaign control & advanced analytics
                  </p>
                </div>
              </div>
              {data.campaign && (
                <div className="flex items-center gap-4 mt-3 ml-16">
                  <Badge className={`${data.campaign.status === 'live' ? 'bg-green-500' : 'bg-yellow-500'} text-white px-4 py-1.5 text-sm font-semibold`}>
                    {data.campaign.status === 'live' ? '🟢 LIVE' : '🟡 DRAFT'}
                  </Badge>
                  <span className="text-white/80 text-sm">
                    Campaign: {data.campaign.campaignTitle || 'Untitled'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button 
                  className="bg-white text-blue-600 hover:bg-white/90 rounded-xl px-6 py-3 font-semibold shadow-lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  View Campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[120rem] mx-auto px-8 py-12">
        {/* Enhanced Quick Navigation Grid */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Link to="/admin/campaigns" className="block h-full">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer h-full text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="p-3 bg-white/20 rounded-xl w-fit mb-4 backdrop-blur-sm">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-2">Campaigns</h3>
                  <p className="font-paragraph text-sm text-white/90">Manage campaign details</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Link to="/admin/campaign-dates" className="block h-full">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer h-full text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="p-3 bg-white/20 rounded-xl w-fit mb-4 backdrop-blur-sm">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-2">Schedule</h3>
                  <p className="font-paragraph text-sm text-white/90">Set campaign dates</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Link to="/admin/donations" className="block h-full">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer h-full text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="p-3 bg-white/20 rounded-xl w-fit mb-4 backdrop-blur-sm">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-2">Donations</h3>
                  <p className="font-paragraph text-sm text-white/90">Track all contributions</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Link to="/admin/matchers" className="block h-full">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer h-full text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="p-3 bg-white/20 rounded-xl w-fit mb-4 backdrop-blur-sm">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-2">Matchers</h3>
                  <p className="font-paragraph text-sm text-white/90">Manage matching funds</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Link to="/admin/analytics" className="block h-full">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer h-full text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="p-3 bg-white/20 rounded-xl w-fit mb-4 backdrop-blur-sm">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-2">Analytics</h3>
                  <p className="font-paragraph text-sm text-white/90">Campaign insights</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Link to="/admin/video-editor" className="block h-full">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer h-full text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="p-3 bg-white/20 rounded-xl w-fit mb-4 backdrop-blur-sm">
                    <Film className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-2">Video Editor</h3>
                  <p className="font-paragraph text-sm text-white/90">Edit campaign videos</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Link to="/admin/ai-editor" className="block h-full">
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer h-full text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="p-3 bg-white/20 rounded-xl w-fit mb-4 backdrop-blur-sm">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-2">AI Editor</h3>
                  <p className="font-paragraph text-sm text-white/90">AI-powered editing</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <div 
              onClick={() => setUI(prev => ({ ...prev, showAnalyticsModal: !prev.showAnalyticsModal }))}
              className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer h-full text-white relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="p-3 bg-white/20 rounded-xl w-fit mb-4 backdrop-blur-sm">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">Quick Stats</h3>
                <p className="font-paragraph text-sm text-white/90">View key metrics</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Admin Tools Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-indigo-200 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-3xl font-bold text-primary flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              Power Tools & Actions
            </h2>
            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 text-sm">
              Admin Only
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Export Data Tool */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-xl p-5 border-2 border-purple-200 cursor-pointer hover:shadow-xl transition-all"
              onClick={() => setUI(prev => ({ ...prev, showExportModal: !prev.showExportModal }))}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-heading font-bold text-primary">Export Data</h3>
              </div>
              <p className="font-paragraph text-sm text-primary/60">
                Download CSV reports for donations, teams & matchers
              </p>
            </motion.div>

            {/* Analytics Tool */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-xl p-5 border-2 border-blue-200 cursor-pointer hover:shadow-xl transition-all"
              onClick={() => setUI(prev => ({ ...prev, showAnalyticsModal: !prev.showAnalyticsModal }))}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-heading font-bold text-primary">Analytics</h3>
              </div>
              <p className="font-paragraph text-sm text-primary/60">
                View detailed campaign statistics & insights
              </p>
            </motion.div>

            {/* Bulk Actions Tool */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-xl p-5 border-2 border-green-200 cursor-pointer hover:shadow-xl transition-all"
              onClick={() => setUI(prev => ({ ...prev, showBulkActions: !prev.showBulkActions }))}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-heading font-bold text-primary">Bulk Actions</h3>
              </div>
              <p className="font-paragraph text-sm text-primary/60">
                Manage multiple items efficiently at once
              </p>
            </motion.div>

            {/* Campaign Control */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-xl p-5 border-2 border-orange-200 cursor-pointer hover:shadow-xl transition-all"
              onClick={handleToggleCampaignLive}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-lg ${data.campaign?.status === 'live' ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-green-600'}`}>
                  {data.campaign?.status === 'live' ? (
                    <X className="w-5 h-5 text-white" />
                  ) : (
                    <Zap className="w-5 h-5 text-white" />
                  )}
                </div>
                <h3 className="font-heading font-bold text-primary">
                  {data.campaign?.status === 'live' ? 'Take Offline' : 'Go Live'}
                </h3>
              </div>
              <p className="font-paragraph text-sm text-primary/60">
                {data.campaign?.status === 'live' ? 'Stop accepting donations' : 'Start accepting donations now'}
              </p>
            </motion.div>

            {/* Download Code */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-xl p-5 border-2 border-indigo-200 cursor-pointer hover:shadow-xl transition-all"
              onClick={handleDownloadCode}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-heading font-bold text-primary">
                  Download Code
                </h3>
              </div>
              <p className="font-paragraph text-sm text-primary/60">
                Export project files and data
              </p>
            </motion.div>
          </div>

          {/* Enhanced Export Modal */}
          {ui.showExportModal && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 bg-white rounded-xl border-2 border-purple-300 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-xl font-bold text-primary">Export Data</h3>
                <Button
                  onClick={() => setUI(prev => ({ ...prev, showExportModal: false }))}
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleExportData('donations')}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 h-auto py-4 flex-col gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span className="font-bold">Donations</span>
                  <span className="text-xs opacity-90">{data.donations.length} records</span>
                </Button>
                <Button
                  onClick={() => handleExportData('teams')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 h-auto py-4 flex-col gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span className="font-bold">Teams</span>
                  <span className="text-xs opacity-90">{data.teams.length} records</span>
                </Button>
                <Button
                  onClick={() => handleExportData('matchers')}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 h-auto py-4 flex-col gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span className="font-bold">Matchers</span>
                  <span className="text-xs opacity-90">{data.matchers.length} records</span>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Enhanced Analytics Modal */}
          {ui.showAnalyticsModal && (() => {
            const analytics = getAnalytics();
            return (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-white rounded-xl border-2 border-blue-300 shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-xl font-bold text-primary flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    Campaign Analytics Dashboard
                  </h3>
                  <Button
                    onClick={() => setUI(prev => ({ ...prev, showAnalyticsModal: false }))}
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg"
                  >
                    <p className="font-paragraph text-xs opacity-80 mb-1">Total Donations</p>
                    <p className="font-heading text-3xl font-bold">{analytics.totalDonations}</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg"
                  >
                    <p className="font-paragraph text-xs opacity-80 mb-1">Total Raised</p>
                    <p className="font-heading text-3xl font-bold">£{analytics.totalRaised.toLocaleString()}</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg"
                  >
                    <p className="font-paragraph text-xs opacity-80 mb-1">Average Donation</p>
                    <p className="font-heading text-3xl font-bold">£{analytics.averageDonation.toFixed(0)}</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg"
                  >
                    <p className="font-paragraph text-xs opacity-80 mb-1">Completion Rate</p>
                    <p className="font-heading text-3xl font-bold">{analytics.completionRate.toFixed(1)}%</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg"
                  >
                    <p className="font-paragraph text-xs opacity-80 mb-1">Active Teams</p>
                    <p className="font-heading text-3xl font-bold">{analytics.totalTeams}</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white shadow-lg"
                  >
                    <p className="font-paragraph text-xs opacity-80 mb-1">Active Matchers</p>
                    <p className="font-heading text-3xl font-bold">{analytics.activeMatchers}/{analytics.totalMatchers}</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-4 text-white shadow-lg"
                  >
                    <p className="font-paragraph text-xs opacity-80 mb-1">Completed</p>
                    <p className="font-heading text-3xl font-bold">{analytics.completedDonations}</p>
                  </motion.div>
                  {analytics.topDonor && (
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg"
                    >
                      <p className="font-paragraph text-xs opacity-80 mb-1">Top Donor</p>
                      <p className="font-heading text-lg font-bold truncate">{analytics.topDonor.donorName || 'Anonymous'}</p>
                      <p className="font-paragraph text-sm opacity-90">£{analytics.topDonor.amount?.toLocaleString()}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })()}

          {/* Enhanced Bulk Actions Modal */}
          {ui.showBulkActions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 bg-white rounded-xl border-2 border-green-300 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-xl font-bold text-primary flex items-center gap-2">
                  <Zap className="w-6 h-6 text-green-600" />
                  Bulk Actions
                </h3>
                <Button
                  onClick={() => setUI(prev => ({ ...prev, showBulkActions: false }))}
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Button
                    onClick={handleMarkAllDonationsCompleted}
                    disabled={ui.saving || data.donations.length === 0}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 justify-start disabled:opacity-50 disabled:cursor-not-allowed h-auto py-4 rounded-xl shadow-lg"
                  >
                    {ui.saving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        <div className="text-left">
                          <div className="font-bold">Processing...</div>
                          <div className="text-xs opacity-90">Please wait</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <div className="font-bold">Mark All Donations as Completed</div>
                          <div className="text-xs opacity-90">{data.donations.length} donations will be updated</div>
                        </div>
                      </>
                    )}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Button
                    onClick={handleSendEmailToDonors}
                    disabled={ui.saving || data.donations.length === 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 justify-start disabled:opacity-50 disabled:cursor-not-allowed h-auto py-4 rounded-xl shadow-lg"
                  >
                    {ui.saving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        <div className="text-left">
                          <div className="font-bold">Processing...</div>
                          <div className="text-xs opacity-90">Please wait</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <div className="font-bold">Send Email to All Donors</div>
                          <div className="text-xs opacity-90">{data.donations.length} donor emails will be copied</div>
                        </div>
                      </>
                    )}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Button
                    onClick={handleActivateAllTeams}
                    disabled={ui.saving || data.teams.length === 0}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 justify-start disabled:opacity-50 disabled:cursor-not-allowed h-auto py-4 rounded-xl shadow-lg"
                  >
                    {ui.saving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        <div className="text-left">
                          <div className="font-bold">Processing...</div>
                          <div className="text-xs opacity-90">Please wait</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <div className="font-bold">Activate All Teams</div>
                          <div className="text-xs opacity-90">{data.teams.length} teams will be activated</div>
                        </div>
                      </>
                    )}
                  </Button>
                </motion.div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200 space-y-2">
                  <p className="font-paragraph text-sm font-semibold text-green-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Bulk Actions Enabled
                  </p>
                  <p className="font-paragraph text-xs text-green-800">
                    These actions allow you to efficiently manage multiple items at once. Confirmations are required before execution to prevent accidental changes.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
        <AnimatePresence>
          {ui.successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-secondary/10 border border-secondary rounded-lg flex items-start gap-3"
            >
              <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-paragraph font-semibold text-secondary">
                  {ui.successMessage}
                </p>
              </div>
              <button
                onClick={() => setUI(prev => ({ ...prev, successMessage: null }))}
                className="text-secondary hover:text-secondary/70 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {ui.error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-paragraph font-semibold text-destructive">
                  Error
                </p>
                <p className="font-paragraph text-sm text-destructive/80 mt-1">
                  {ui.error}
                </p>
              </div>
              <button
                onClick={() => setUI(prev => ({ ...prev, error: null }))}
                className="text-destructive hover:text-destructive/70 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NEW ADMIN FEATURES SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 space-y-6"
        >
          {/* Quick Actions & Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Notifications Panel */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-xl border-2 border-yellow-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-600" />
                  Notifications
                </h3>
                <Button
                  onClick={() => setUI(prev => ({ ...prev, showNotifications: !prev.showNotifications }))}
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  {ui.showNotifications ? <X className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {ui.showNotifications ? (
                <div className="space-y-3">
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <p className="font-paragraph text-xs text-yellow-900 font-semibold">New Donation Alert</p>
                    <p className="font-paragraph text-xs text-yellow-700 mt-1">
                      {data.donations.length > 0 ? `Latest: £${data.donations[0]?.amount} from ${data.donations[0]?.donorName || 'Anonymous'}` : 'No donations yet'}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="font-paragraph text-xs text-blue-900 font-semibold">Campaign Status</p>
                    <p className="font-paragraph text-xs text-blue-700 mt-1">
                      {data.campaign?.status === 'live' ? '✅ Campaign is LIVE' : '⚠️ Campaign is in DRAFT mode'}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="font-paragraph text-xs text-green-900 font-semibold">Active Teams</p>
                    <p className="font-paragraph text-xs text-green-700 mt-1">
                      {data.teams.length} teams are fundraising
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Bell className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="font-paragraph text-sm text-primary/60">Click to view notifications</p>
                </div>
              )}
            </motion.div>

            {/* Recent Activity Panel */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-xl border-2 border-purple-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Recent Activity
                </h3>
                <Button
                  onClick={() => setUI(prev => ({ ...prev, showRecentActivity: !prev.showRecentActivity }))}
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  {ui.showRecentActivity ? <X className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {ui.showRecentActivity ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {data.donations.slice(0, 5).map((donation, idx) => (
                    <div key={donation._id} className="bg-purple-50 rounded-lg p-2 border border-purple-200">
                      <p className="font-paragraph text-xs text-purple-900 font-semibold">
                        💰 Donation #{idx + 1}
                      </p>
                      <p className="font-paragraph text-xs text-purple-700">
                        £{donation.amount} from {donation.donorName || 'Anonymous'}
                      </p>
                    </div>
                  ))}
                  {data.donations.length === 0 && (
                    <p className="font-paragraph text-xs text-purple-600 text-center py-4">No activity yet</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Activity className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="font-paragraph text-sm text-primary/60">Click to view activity</p>
                </div>
              )}
            </motion.div>

            {/* Top Donors Panel */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-xl border-2 border-pink-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-pink-600" />
                  Top Donors
                </h3>
                <Button
                  onClick={() => setUI(prev => ({ ...prev, showTopDonors: !prev.showTopDonors }))}
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  {ui.showTopDonors ? <X className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {ui.showTopDonors ? (
                <div className="space-y-2">
                  {data.donations
                    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
                    .slice(0, 5)
                    .map((donation, idx) => (
                      <div key={donation._id} className="bg-pink-50 rounded-lg p-2 border border-pink-200 flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                          idx === 1 ? 'bg-gray-300 text-gray-700' :
                          idx === 2 ? 'bg-orange-400 text-orange-900' :
                          'bg-pink-200 text-pink-700'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-paragraph text-xs text-pink-900 font-semibold">
                            {donation.donorName || 'Anonymous'}
                          </p>
                          <p className="font-paragraph text-xs text-pink-700">£{donation.amount?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  {data.donations.length === 0 && (
                    <p className="font-paragraph text-xs text-pink-600 text-center py-4">No donors yet</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Trophy className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                  <p className="font-paragraph text-sm text-primary/60">Click to view top donors</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Performance Metrics Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-indigo-200 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-bold text-primary flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                Performance Metrics
              </h2>
              <Button
                onClick={() => setUI(prev => ({ ...prev, showPerformanceMetrics: !prev.showPerformanceMetrics }))}
                className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white hover:from-indigo-700 hover:to-blue-800 rounded-lg"
              >
                {ui.showPerformanceMetrics ? 'Hide' : 'Show'} Metrics
              </Button>
            </div>

            {ui.showPerformanceMetrics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div className="bg-white rounded-xl p-4 border-2 border-indigo-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <p className="font-paragraph text-xs text-primary/60">Conversion Rate</p>
                  </div>
                  <p className="font-heading text-2xl font-bold text-primary">
                    {data.donations.length > 0 ? ((data.donations.filter(d => d.status === 'completed').length / data.donations.length) * 100).toFixed(1) : 0}%
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <p className="font-paragraph text-xs text-primary/60">Avg Donation</p>
                  </div>
                  <p className="font-heading text-2xl font-bold text-primary">
                    £{data.donations.length > 0 ? (data.donations.reduce((sum, d) => sum + (d.amount || 0), 0) / data.donations.length).toFixed(0) : 0}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <p className="font-paragraph text-xs text-primary/60">Team Participation</p>
                  </div>
                  <p className="font-heading text-2xl font-bold text-primary">
                    {data.teams.length > 0 ? ((data.donations.filter(d => d.teamId).length / data.donations.length) * 100).toFixed(0) : 0}%
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border-2 border-pink-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-pink-600" />
                    <p className="font-paragraph text-xs text-primary/60">Days Remaining</p>
                  </div>
                  <p className="font-heading text-2xl font-bold text-primary">
                    {data.campaign?.campaignEndDate 
                      ? Math.max(0, Math.ceil((new Date(data.campaign.campaignEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                      : '-'}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <p className="font-paragraph text-xs text-primary/60">Goal Progress</p>
                  </div>
                  <p className="font-heading text-2xl font-bold text-primary">
                    {progressPercentage.toFixed(1)}%
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border-2 border-orange-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-orange-600" />
                    <p className="font-paragraph text-xs text-primary/60">Active Matchers</p>
                  </div>
                  <p className="font-heading text-2xl font-bold text-primary">
                    {data.matchers.filter(m => m.status === 'active').length}/{data.matchers.length}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border-2 border-cyan-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-cyan-600" />
                    <p className="font-paragraph text-xs text-primary/60">Messages</p>
                  </div>
                  <p className="font-heading text-2xl font-bold text-primary">
                    {data.donations.filter(d => d.donorMessage).length}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border-2 border-yellow-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <p className="font-paragraph text-xs text-primary/60">Completion Rate</p>
                  </div>
                  <p className="font-heading text-2xl font-bold text-primary">
                    {data.donations.length > 0 ? ((data.donations.filter(d => d.status === 'completed').length / data.donations.length) * 100).toFixed(0) : 0}%
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Goal Tracker & Milestones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl p-8 shadow-xl border-2 border-green-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-bold text-primary flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <Target className="w-6 h-6 text-white" />
                </div>
                Goal Tracker & Milestones
              </h2>
              <Button
                onClick={() => setUI(prev => ({ ...prev, showGoalTracker: !prev.showGoalTracker }))}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 rounded-lg"
              >
                {ui.showGoalTracker ? 'Hide' : 'Show'} Tracker
              </Button>
            </div>

            {ui.showGoalTracker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                {/* Main Goal */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-lg font-bold text-primary">Main Fundraising Goal</h3>
                    <span className="text-sm font-semibold text-green-600">
                      £{totalRaised.toLocaleString()} / £{data.campaign?.fundraisingGoal?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      transition={{ duration: 1 }}
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                    />
                  </div>
                  <p className="font-paragraph text-sm text-primary/60">
                    {progressPercentage >= 100 ? '🎉 Goal achieved!' : `£${((data.campaign?.fundraisingGoal || 0) - totalRaised).toLocaleString()} remaining`}
                  </p>
                </div>

                {/* Bonus Goal */}
                {data.campaign?.bonusGoal && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
                        <Gift className="w-5 h-5 text-purple-600" />
                        Bonus Goal
                      </h3>
                      <span className="text-sm font-semibold text-purple-600">
                        £{totalRaised.toLocaleString()} / £{data.campaign.bonusGoal.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((totalRaised / data.campaign.bonusGoal) * 100, 100)}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                      />
                    </div>
                    {data.campaign.bonusGoalDescription && (
                      <p className="font-paragraph text-sm text-primary/60">
                        {data.campaign.bonusGoalDescription}
                      </p>
                    )}
                  </div>
                )}

                {/* Milestones */}
                <div className="space-y-3">
                  <h3 className="font-heading text-lg font-bold text-primary">Milestones</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[25, 50, 75, 100].map((milestone) => {
                      const milestoneAmount = ((data.campaign?.fundraisingGoal || 0) * milestone) / 100;
                      const achieved = totalRaised >= milestoneAmount;
                      return (
                        <div
                          key={milestone}
                          className={`rounded-xl p-4 border-2 ${
                            achieved
                              ? 'bg-green-50 border-green-300'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-heading text-lg font-bold text-primary">{milestone}%</span>
                            {achieved && <CheckCircle className="w-5 h-5 text-green-600" />}
                          </div>
                          <p className="font-paragraph text-sm text-primary/60">
                            £{milestoneAmount.toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Advanced Search & Filter Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-xl border-2 border-blue-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-bold text-primary flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Search className="w-6 h-6 text-white" />
                </div>
                Advanced Search & Filters
              </h2>
              <Button
                onClick={() => setUI(prev => ({ ...prev, showSearchPanel: !prev.showSearchPanel }))}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg"
              >
                {ui.showSearchPanel ? 'Hide' : 'Show'} Search
              </Button>
            </div>

            {ui.showSearchPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-semibold text-primary">
                      Search Donations
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/40" />
                      <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by donor name or email..."
                        className="pl-10 border-blue-200 focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-semibold text-primary">
                      Filter by Status
                    </label>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-blue-500 font-paragraph"
                    >
                      <option value="">All Statuses</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-semibold text-primary">
                      Filter by Amount
                    </label>
                    <select 
                      value={amountFilter}
                      onChange={(e) => setAmountFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-blue-500 font-paragraph"
                    >
                      <option value="">All Amounts</option>
                      <option value="0-50">£0 - £50</option>
                      <option value="50-100">£50 - £100</option>
                      <option value="100-500">£100 - £500</option>
                      <option value="500+">£500+</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => {
                      // Filters are applied automatically via state
                      setUI(prev => ({ 
                        ...prev, 
                        successMessage: 'Filters applied successfully!' 
                      }));
                      setTimeout(() => {
                        setUI(prev => ({ ...prev, successMessage: null }));
                      }, 2000);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Apply Filters
                  </Button>
                  <Button 
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('');
                      setAmountFilter('');
                      setUI(prev => ({ 
                        ...prev, 
                        successMessage: 'Filters reset!' 
                      }));
                      setTimeout(() => {
                        setUI(prev => ({ ...prev, successMessage: null }));
                      }, 2000);
                    }}
                    variant="outline" 
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="font-paragraph text-sm text-blue-900 font-semibold mb-2">
                    💡 Quick Search Tips
                  </p>
                  <ul className="space-y-1 text-xs text-blue-700">
                    <li>• Search by donor name, email, or team name</li>
                    <li>• Use filters to narrow down results by status or amount</li>
                    <li>• Export filtered results to CSV for further analysis</li>
                    <li>• Filters apply automatically as you type</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* COMPREHENSIVE ADVANCED FEATURES SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="space-y-8"
          >
            {/* Section Header */}
            <div className="text-center space-y-3">
              <h2 className="font-heading text-4xl font-bold text-primary">
                🚀 Advanced Admin Features
              </h2>
              <p className="font-paragraph text-lg text-primary/70">
                Comprehensive tools to manage, analyze, and optimize your fundraising campaign
              </p>
            </div>

            {/* Category 1: Advanced Analytics & Reporting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 rounded-2xl p-8 border-2 border-purple-200 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-primary">Advanced Analytics & Reporting</h3>
                  <p className="font-paragraph text-sm text-primary/60">Deep insights into campaign performance</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <LineChart className="w-6 h-6 text-purple-600" />
                    <h4 className="font-heading font-bold text-primary">Trend Analysis</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Track donation trends over time with interactive charts</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-pink-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <PieChart className="w-6 h-6 text-pink-600" />
                    <h4 className="font-heading font-bold text-primary">Donor Segmentation</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Analyze donor demographics and giving patterns</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-red-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-6 h-6 text-red-600" />
                    <h4 className="font-heading font-bold text-primary">Forecast Modeling</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Predict campaign outcomes based on current data</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-orange-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-6 h-6 text-orange-600" />
                    <h4 className="font-heading font-bold text-primary">Custom Reports</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Generate detailed PDF/Excel reports on demand</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-indigo-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart className="w-6 h-6 text-indigo-600" />
                    <h4 className="font-heading font-bold text-primary">Comparative Analysis</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Compare performance across teams and time periods</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-cyan-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Activity className="w-6 h-6 text-cyan-600" />
                    <h4 className="font-heading font-bold text-primary">Real-Time Dashboard</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Live updates on donations and campaign metrics</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-teal-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendDown className="w-6 h-6 text-teal-600" />
                    <h4 className="font-heading font-bold text-primary">Churn Analysis</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Identify and prevent donor drop-off patterns</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-green-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Database className="w-6 h-6 text-green-600" />
                    <h4 className="font-heading font-bold text-primary">Data Export Hub</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Export data in multiple formats (CSV, JSON, XML)</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Category 2: Campaign Management Tools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                  <Settings className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-primary">Campaign Management Tools</h3>
                  <p className="font-paragraph text-sm text-primary/60">Advanced controls for campaign optimization</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <h4 className="font-heading font-bold text-primary">Schedule Manager</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Set automated campaign start/end times and milestones</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-indigo-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-6 h-6 text-indigo-600" />
                    <h4 className="font-heading font-bold text-primary">Goal Adjustments</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Dynamically adjust fundraising goals and targets</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Layers className="w-6 h-6 text-purple-600" />
                    <h4 className="font-heading font-bold text-primary">Multi-Campaign</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Manage multiple campaigns simultaneously</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-pink-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Copy className="w-6 h-6 text-pink-600" />
                    <h4 className="font-heading font-bold text-primary">Campaign Cloning</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Duplicate successful campaigns with one click</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-cyan-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Archive className="w-6 h-6 text-cyan-600" />
                    <h4 className="font-heading font-bold text-primary">Archive System</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Archive completed campaigns for historical reference</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-teal-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Tags className="w-6 h-6 text-teal-600" />
                    <h4 className="font-heading font-bold text-primary">Tag Management</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Organize campaigns with custom tags and categories</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-green-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Bookmark className="w-6 h-6 text-green-600" />
                    <h4 className="font-heading font-bold text-primary">Templates Library</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Save and reuse campaign templates</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-yellow-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-6 h-6 text-yellow-600" />
                    <h4 className="font-heading font-bold text-primary">Version History</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Track and restore previous campaign versions</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Category 3: Donor Engagement Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-8 border-2 border-green-200 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-primary">Donor Engagement Features</h3>
                  <p className="font-paragraph text-sm text-primary/60">Build stronger relationships with supporters</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-green-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="w-6 h-6 text-green-600" />
                    <h4 className="font-heading font-bold text-primary">Email Campaigns</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Send personalized thank-you and update emails</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-emerald-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="w-6 h-6 text-emerald-600" />
                    <h4 className="font-heading font-bold text-primary">SMS Notifications</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Instant text updates for major milestones</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-teal-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="w-6 h-6 text-teal-600" />
                    <h4 className="font-heading font-bold text-primary">Donor Recognition</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Badges, certificates, and public acknowledgment</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-cyan-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Receipt className="w-6 h-6 text-cyan-600" />
                    <h4 className="font-heading font-bold text-primary">Auto Receipts</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Automated tax-deductible donation receipts</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Repeat className="w-6 h-6 text-blue-600" />
                    <h4 className="font-heading font-bold text-primary">Recurring Donors</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Manage monthly/annual recurring donations</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-indigo-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Star className="w-6 h-6 text-indigo-600" />
                    <h4 className="font-heading font-bold text-primary">VIP Program</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Special perks for top-tier donors</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Bell className="w-6 h-6 text-purple-600" />
                    <h4 className="font-heading font-bold text-primary">Smart Reminders</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Automated follow-ups for lapsed donors</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-pink-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Gift className="w-6 h-6 text-pink-600" />
                    <h4 className="font-heading font-bold text-primary">Referral System</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Reward donors who bring in new supporters</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Category 4: Team Management Enhancements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-orange-200 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-orange-600 to-yellow-600 rounded-xl">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-primary">Team Management Enhancements</h3>
                  <p className="font-paragraph text-sm text-primary/60">Empower teams with advanced tools</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-orange-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="w-6 h-6 text-orange-600" />
                    <h4 className="font-heading font-bold text-primary">Team Leaderboards</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Real-time rankings to boost competition</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-amber-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <UserCheck className="w-6 h-6 text-amber-600" />
                    <h4 className="font-heading font-bold text-primary">Member Roles</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Assign captain, co-captain, and member roles</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-yellow-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-6 h-6 text-yellow-600" />
                    <h4 className="font-heading font-bold text-primary">Team Goals</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Set individual and collective team targets</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-red-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="w-6 h-6 text-red-600" />
                    <h4 className="font-heading font-bold text-primary">Team Chat</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Internal messaging for team coordination</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-pink-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Share2 className="w-6 h-6 text-pink-600" />
                    <h4 className="font-heading font-bold text-primary">Social Sharing</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Pre-built social media posts for teams</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <FileCheck className="w-6 h-6 text-purple-600" />
                    <h4 className="font-heading font-bold text-primary">Team Reports</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Detailed performance analytics per team</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-indigo-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="w-6 h-6 text-indigo-600" />
                    <h4 className="font-heading font-bold text-primary">Team Challenges</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Create friendly competitions between teams</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Megaphone className="w-6 h-6 text-blue-600" />
                    <h4 className="font-heading font-bold text-primary">Team Updates</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Broadcast announcements to all team members</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Category 5: Communication Tools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 rounded-2xl p-8 border-2 border-cyan-200 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-primary">Communication Tools</h3>
                  <p className="font-paragraph text-sm text-primary/60">Stay connected with all stakeholders</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-cyan-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Send className="w-6 h-6 text-cyan-600" />
                    <h4 className="font-heading font-bold text-primary">Bulk Messaging</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Send messages to multiple recipients at once</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-sky-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Layout className="w-6 h-6 text-sky-600" />
                    <h4 className="font-heading font-bold text-primary">Email Templates</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Pre-designed templates for all occasions</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Bell className="w-6 h-6 text-blue-600" />
                    <h4 className="font-heading font-bold text-primary">Push Notifications</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Real-time alerts for important events</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-indigo-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="w-6 h-6 text-indigo-600" />
                    <h4 className="font-heading font-bold text-primary">Live Chat Support</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Direct messaging with donors and teams</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Megaphone className="w-6 h-6 text-purple-600" />
                    <h4 className="font-heading font-bold text-primary">Announcements</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Broadcast important campaign updates</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-pink-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="w-6 h-6 text-pink-600" />
                    <h4 className="font-heading font-bold text-primary">Social Integration</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Post updates directly to social media</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-red-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-6 h-6 text-red-600" />
                    <h4 className="font-heading font-bold text-primary">Newsletter Builder</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Create and schedule email newsletters</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-orange-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Bot className="w-6 h-6 text-orange-600" />
                    <h4 className="font-heading font-bold text-primary">Auto-Responder</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Automated responses to common inquiries</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Category 6: Financial Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 rounded-2xl p-8 border-2 border-emerald-200 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-primary">Financial Management</h3>
                  <p className="font-paragraph text-sm text-primary/60">Complete financial oversight and control</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-emerald-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="w-6 h-6 text-emerald-600" />
                    <h4 className="font-heading font-bold text-primary">Payment Gateway</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Multiple payment methods and processors</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-green-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Receipt className="w-6 h-6 text-green-600" />
                    <h4 className="font-heading font-bold text-primary">Transaction Log</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Detailed records of all financial transactions</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-lime-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Wallet className="w-6 h-6 text-lime-600" />
                    <h4 className="font-heading font-bold text-primary">Refund Manager</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Process refunds and cancellations easily</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-teal-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Percent className="w-6 h-6 text-teal-600" />
                    <h4 className="font-heading font-bold text-primary">Fee Calculator</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Calculate processing fees and net amounts</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-cyan-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <FileCheck className="w-6 h-6 text-cyan-600" />
                    <h4 className="font-heading font-bold text-primary">Tax Compliance</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Generate tax reports and documentation</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    <h4 className="font-heading font-bold text-primary">Revenue Tracking</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Monitor income streams and growth</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-indigo-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="w-6 h-6 text-indigo-600" />
                    <h4 className="font-heading font-bold text-primary">Matching Funds</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Automated matching fund calculations</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Database className="w-6 h-6 text-purple-600" />
                    <h4 className="font-heading font-bold text-primary">Financial Reports</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Comprehensive financial statements</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Category 7: Automation & Workflows */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 rounded-2xl p-8 border-2 border-violet-200 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl">
                  <Workflow className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-primary">Automation & Workflows</h3>
                  <p className="font-paragraph text-sm text-primary/60">Streamline operations with smart automation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-violet-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Bot className="w-6 h-6 text-violet-600" />
                    <h4 className="font-heading font-bold text-primary">Auto-Workflows</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Create custom automated processes</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-6 h-6 text-purple-600" />
                    <h4 className="font-heading font-bold text-primary">Trigger Actions</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Set up event-based automated actions</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-fuchsia-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-6 h-6 text-fuchsia-600" />
                    <h4 className="font-heading font-bold text-primary">Scheduled Tasks</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Automate recurring administrative tasks</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-pink-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Brain className="w-6 h-6 text-pink-600" />
                    <h4 className="font-heading font-bold text-primary">Smart Routing</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Intelligent task assignment and routing</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-rose-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Repeat className="w-6 h-6 text-rose-600" />
                    <h4 className="font-heading font-bold text-primary">Batch Processing</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Process multiple items simultaneously</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-red-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <FileCheck className="w-6 h-6 text-red-600" />
                    <h4 className="font-heading font-bold text-primary">Approval Flows</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Multi-step approval processes</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-orange-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Lightbulb className="w-6 h-6 text-orange-600" />
                    <h4 className="font-heading font-bold text-primary">AI Suggestions</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">AI-powered optimization recommendations</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-amber-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <RefreshCw className="w-6 h-6 text-amber-600" />
                    <h4 className="font-heading font-bold text-primary">Auto-Sync</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Sync data across platforms automatically</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Category 8: Security & Access Control */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 rounded-2xl p-8 border-2 border-slate-200 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-slate-600 to-gray-600 rounded-xl">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-primary">Security & Access Control</h3>
                  <p className="font-paragraph text-sm text-primary/60">Enterprise-grade security features</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Lock className="w-6 h-6 text-slate-600" />
                    <h4 className="font-heading font-bold text-primary">Role-Based Access</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Granular permission controls</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Key className="w-6 h-6 text-gray-600" />
                    <h4 className="font-heading font-bold text-primary">2FA Authentication</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Two-factor authentication for admins</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-zinc-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <UserCheck className="w-6 h-6 text-zinc-600" />
                    <h4 className="font-heading font-bold text-primary">Activity Logs</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Track all admin actions and changes</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-stone-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <UserX className="w-6 h-6 text-stone-600" />
                    <h4 className="font-heading font-bold text-primary">IP Restrictions</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Limit access by IP address</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-neutral-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-6 h-6 text-neutral-600" />
                    <h4 className="font-heading font-bold text-primary">Data Encryption</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">End-to-end encryption for sensitive data</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <FileX className="w-6 h-6 text-slate-600" />
                    <h4 className="font-heading font-bold text-primary">Backup System</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Automated daily backups</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-6 h-6 text-gray-600" />
                    <h4 className="font-heading font-bold text-primary">Session Management</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Control active admin sessions</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-zinc-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="w-6 h-6 text-zinc-600" />
                    <h4 className="font-heading font-bold text-primary">Security Alerts</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Real-time security notifications</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Category 9: Integration & Export Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-indigo-200 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-xl">
                  <Link2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-primary">Integration & Export Options</h3>
                  <p className="font-paragraph text-sm text-primary/60">Connect with external tools and platforms</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-indigo-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Code className="w-6 h-6 text-indigo-600" />
                    <h4 className="font-heading font-bold text-primary">API Access</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">RESTful API for custom integrations</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Package className="w-6 h-6 text-blue-600" />
                    <h4 className="font-heading font-bold text-primary">Webhooks</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Real-time event notifications</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-cyan-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Download className="w-6 h-6 text-cyan-600" />
                    <h4 className="font-heading font-bold text-primary">Data Export</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Export in CSV, JSON, XML formats</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-teal-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Upload className="w-6 h-6 text-teal-600" />
                    <h4 className="font-heading font-bold text-primary">Bulk Import</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Import data from spreadsheets</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-green-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="w-6 h-6 text-green-600" />
                    <h4 className="font-heading font-bold text-primary">Email Platforms</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Integrate with Mailchimp, SendGrid</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-emerald-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="w-6 h-6 text-emerald-600" />
                    <h4 className="font-heading font-bold text-primary">Payment Gateways</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Stripe, PayPal, Square integration</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-lime-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="w-6 h-6 text-lime-600" />
                    <h4 className="font-heading font-bold text-primary">Social Media</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Facebook, Twitter, LinkedIn sync</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-yellow-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Database className="w-6 h-6 text-yellow-600" />
                    <h4 className="font-heading font-bold text-primary">CRM Integration</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Salesforce, HubSpot connectivity</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Category 10: Customization & Branding */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 rounded-2xl p-8 border-2 border-rose-200 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-rose-600 to-fuchsia-600 rounded-xl">
                  <Palette className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-primary">Customization & Branding</h3>
                  <p className="font-paragraph text-sm text-primary/60">Make the platform uniquely yours</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-rose-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Palette className="w-6 h-6 text-rose-600" />
                    <h4 className="font-heading font-bold text-primary">Theme Editor</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Customize colors, fonts, and styles</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-pink-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <ImageIcon className="w-6 h-6 text-pink-600" />
                    <h4 className="font-heading font-bold text-primary">Logo Manager</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Upload and manage brand logos</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-fuchsia-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Layout className="w-6 h-6 text-fuchsia-600" />
                    <h4 className="font-heading font-bold text-primary">Page Builder</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Drag-and-drop page customization</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Code className="w-6 h-6 text-purple-600" />
                    <h4 className="font-heading font-bold text-primary">Custom CSS</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Add custom styling code</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-violet-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="w-6 h-6 text-violet-600" />
                    <h4 className="font-heading font-bold text-primary">Domain Settings</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Configure custom domain names</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-indigo-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    <h4 className="font-heading font-bold text-primary">Content Editor</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Edit all text and messaging</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Boxes className="w-6 h-6 text-blue-600" />
                    <h4 className="font-heading font-bold text-primary">Widget Library</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Add custom widgets and components</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-xl p-5 border-2 border-cyan-200 shadow-lg cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <FolderOpen className="w-6 h-6 text-cyan-600" />
                    <h4 className="font-heading font-bold text-primary">Media Library</h4>
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Centralized asset management</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Implementation Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center shadow-2xl"
            >
              <Sparkles className="w-12 h-12 mx-auto mb-4" />
              <h3 className="font-heading text-3xl font-bold mb-3">
                🎉 80+ Advanced Features Available
              </h3>
              <p className="font-paragraph text-lg mb-6 opacity-90">
                These comprehensive tools are designed to give you complete control over your fundraising campaign. 
                Each feature can be enabled and customized to match your specific needs.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Badge className="bg-white text-blue-600 px-4 py-2 text-sm font-semibold">
                  Analytics & Reporting
                </Badge>
                <Badge className="bg-white text-purple-600 px-4 py-2 text-sm font-semibold">
                  Campaign Management
                </Badge>
                <Badge className="bg-white text-green-600 px-4 py-2 text-sm font-semibold">
                  Donor Engagement
                </Badge>
                <Badge className="bg-white text-orange-600 px-4 py-2 text-sm font-semibold">
                  Team Tools
                </Badge>
                <Badge className="bg-white text-cyan-600 px-4 py-2 text-sm font-semibold">
                  Communication
                </Badge>
                <Badge className="bg-white text-emerald-600 px-4 py-2 text-sm font-semibold">
                  Financial
                </Badge>
                <Badge className="bg-white text-violet-600 px-4 py-2 text-sm font-semibold">
                  Automation
                </Badge>
                <Badge className="bg-white text-slate-600 px-4 py-2 text-sm font-semibold">
                  Security
                </Badge>
                <Badge className="bg-white text-indigo-600 px-4 py-2 text-sm font-semibold">
                  Integrations
                </Badge>
                <Badge className="bg-white text-pink-600 px-4 py-2 text-sm font-semibold">
                  Customization
                </Badge>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Video Editor Section */}
        {ui.showVideoEditor && campaignForm.videos && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-12 p-8 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-bold text-purple-900 flex items-center gap-2">
                <Film className="w-6 h-6" />
                Professional Video Editor
              </h2>
              <Button
                onClick={() => setUI(prev => ({ ...prev, showVideoEditor: false }))}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
              >
                Close
              </Button>
            </div>
            <VideoEditor
              videoUrl={campaignForm.videos}
              onClose={() => setUI(prev => ({ ...prev, showVideoEditor: false }))}
              onSave={(editedData) => {
                setUI(prev => ({
                  ...prev,
                  successMessage: `Video "${editedData.title}" edited successfully!`,
                }));
                setTimeout(() => {
                  setUI(prev => ({ ...prev, successMessage: null }));
                }, 3000);
              }}
            />
          </motion.div>
        )}

        {/* Enhanced Stats Overview with Progress Bar */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      Total Raised
                    </span>
                  </div>
                  <p className="font-heading text-4xl font-bold mb-1">
                    £{totalRaised.toLocaleString()}
                  </p>
                  <p className="text-sm text-white/80">
                    of £{data.campaign?.fundraisingGoal?.toLocaleString() || '0'} goal
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      Donors
                    </span>
                  </div>
                  <p className="font-heading text-4xl font-bold mb-1">
                    {completedDonations.length}
                  </p>
                  <p className="text-sm text-white/80">
                    Total contributors
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      Progress
                    </span>
                  </div>
                  <p className="font-heading text-4xl font-bold mb-1">
                    {progressPercentage.toFixed(1)}%
                  </p>
                  <p className="text-sm text-white/80">
                    Campaign completion
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      Teams
                    </span>
                  </div>
                  <p className="font-heading text-4xl font-bold mb-1">
                    {data.teams.length}
                  </p>
                  <p className="text-sm text-white/80">
                    Active fundraising teams
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold text-primary">Campaign Progress</h3>
              <span className="text-sm font-semibold text-primary/60">
                £{(data.campaign?.fundraisingGoal ? data.campaign.fundraisingGoal - totalRaised : 0).toLocaleString()} remaining
              </span>
            </div>
            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-end pr-4"
              >
                {progressPercentage > 10 && (
                  <span className="text-white font-bold text-sm">
                    {progressPercentage.toFixed(1)}%
                  </span>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="campaign" className="space-y-8">
          <TabsList className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 p-1.5 rounded-xl">
            <TabsTrigger 
              value="campaign" 
              className="font-paragraph data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-lg px-6 py-2.5 transition-all"
            >
              Campaign
            </TabsTrigger>
            <TabsTrigger 
              value="gallery" 
              className="font-paragraph data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white rounded-lg px-6 py-2.5 transition-all"
            >
              Gallery
            </TabsTrigger>
            <TabsTrigger 
              value="matchers" 
              className="font-paragraph data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white rounded-lg px-6 py-2.5 transition-all"
            >
              Matchers
            </TabsTrigger>
            <TabsTrigger 
              value="teams" 
              className="font-paragraph data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-orange-700 data-[state=active]:text-white rounded-lg px-6 py-2.5 transition-all"
            >
              Teams
            </TabsTrigger>
            <TabsTrigger 
              value="donations" 
              className="font-paragraph data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-pink-700 data-[state=active]:text-white rounded-lg px-6 py-2.5 transition-all"
            >
              Donations
            </TabsTrigger>
          </TabsList>

          {/* Campaign Tab */}
          <TabsContent value="campaign">
            <Card className="border-blue-200 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="font-heading text-2xl font-bold text-blue-900">
                  Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveCampaign} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-semibold text-blue-900">
                        Campaign Title *
                      </label>
                      <Input
                        type="text"
                        value={campaignForm.campaignTitle}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, campaignTitle: e.target.value }))}
                        placeholder="e.g., Building Our Future"
                        className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-semibold text-blue-900">
                        URL Slug (Custom Path)
                      </label>
                      <Input
                        type="text"
                        value={campaignForm.campaignSlug}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, campaignSlug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))}
                        placeholder="e.g., building-our-future"
                        className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                      />
                      <p className="font-paragraph text-xs text-blue-600">
                        {campaignForm.campaignSlug ? `URL: /c/${campaignForm.campaignSlug}` : 'Leave empty to use campaign ID'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-semibold text-blue-900">
                        Fundraising Goal ($) *
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={campaignForm.fundraisingGoal}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, fundraisingGoal: e.target.value }))}
                        placeholder="e.g., 500000"
                        className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-semibold text-blue-900">
                        Bonus Goal ($)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={campaignForm.bonusGoal}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, bonusGoal: e.target.value }))}
                        placeholder="e.g., 750000"
                        className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-semibold text-blue-900">
                        Bonus Goal Description
                      </label>
                      <Input
                        type="text"
                        value={campaignForm.bonusGoalDescription}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, bonusGoalDescription: e.target.value }))}
                        placeholder="e.g., Unlock additional features at this milestone"
                        className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-semibold text-blue-900">
                      Promotional Text
                    </label>
                    <Textarea
                      value={campaignForm.promotionalText}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, promotionalText: e.target.value }))}
                      placeholder="A compelling message to inspire donations..."
                      className="border-blue-200 focus:border-blue-600 focus:ring-blue-500 min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-semibold text-blue-900">
                      Project Description
                    </label>
                    <Textarea
                      value={campaignForm.projectDescription}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, projectDescription: e.target.value }))}
                      placeholder="Detailed description of the project..."
                      className="border-blue-200 focus:border-blue-600 focus:ring-blue-500 min-h-[150px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-semibold text-blue-900">
                      Homepage Video Embed URL
                    </label>
                    <Input
                      type="text"
                      value={campaignForm.homepageVideo}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, homepageVideo: e.target.value }))}
                      placeholder="https://share.zight.com/bLuPqKqG or any embed URL"
                      className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                    />
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                      <p className="font-paragraph text-sm font-semibold text-blue-900">
                        🎬 Homepage Video Embed
                      </p>
                      <div className="space-y-2">
                        <p className="font-paragraph text-xs text-blue-700">
                          <span className="font-semibold">Purpose:</span> This video is displayed on your homepage to showcase your campaign
                        </p>
                        <p className="font-paragraph text-xs text-blue-700">
                          <span className="font-semibold">Supported sources:</span> Zight, YouTube, Vimeo, or any embed URL
                        </p>
                        <p className="font-paragraph text-xs text-blue-700">
                          <span className="font-semibold">Example:</span> https://share.zight.com/bLuPqKqG
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-semibold text-blue-900">
                      Campaign Video URL or Upload
                    </label>
                    <div className="space-y-3">
                      <Input
                        type="text"
                        value={campaignForm.campaignVideo}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, campaignVideo: e.target.value }))}
                        placeholder="https://example.com/video.mp4 or https://youtube.com/watch?v=..."
                        className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,.mov,.mp4,.webm,.ogg,.avi"
                          onChange={handleVideoFileUpload}
                          className="hidden"
                          id="campaign-video-upload"
                        />
                        <label
                          htmlFor="campaign-video-upload"
                          className="block w-full px-4 py-2 border-2 border-dashed border-blue-300 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors font-paragraph text-sm text-blue-700"
                        >
                          Or click to upload a video file
                        </label>
                      </div>
                      {campaignForm.uploadedVideoFile && (
                        <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="flex-1">
                            <p className="text-sm text-green-700 font-semibold">
                              ✓ Video selected: {campaignForm.uploadedVideoFile.name}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              Size: {(campaignForm.uploadedVideoFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCampaignForm(prev => ({ ...prev, uploadedVideoFile: undefined }))}
                            className="text-green-600 hover:text-green-800 flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                      <p className="font-paragraph text-sm font-semibold text-blue-900">
                        📹 Video Upload Guidelines
                      </p>
                      <div className="space-y-2">
                        <p className="font-paragraph text-xs text-blue-700">
                          <span className="font-semibold">Maximum file size:</span> {FILE_SIZE_LIMITS.VIDEO_MAX_MB} MB
                        </p>
                        <p className="font-paragraph text-xs text-blue-700">
                          <span className="font-semibold">Supported formats:</span> MP4, WebM, OGG, MOV, AVI
                        </p>
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="font-paragraph text-xs font-semibold text-blue-900 mb-2">
                            💡 Tips for compressing videos:
                          </p>
                          <ul className="space-y-1 text-xs text-blue-700">
                            <li>• <span className="font-semibold">Reduce resolution:</span> Use 1080p or 720p instead of 4K</li>
                            <li>• <span className="font-semibold">Lower bitrate:</span> 5-8 Mbps is usually sufficient</li>
                            <li>• <span className="font-semibold">Use H.264 codec:</span> Most efficient for MP4 files</li>
                            <li>• <span className="font-semibold">Trim length:</span> Keep videos under 5 minutes</li>
                            <li>• <span className="font-semibold">Online tools:</span> Try HandBrake, FFmpeg, or CloudConvert</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-semibold text-blue-900">
                      📹 Video File (Wix Media Manager)
                    </label>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,.mov,.mp4,.webm,.ogg,.avi"
                          onChange={handleVideoFileUpload}
                          className="hidden"
                          id="wix-video-upload"
                          disabled={ui.saving}
                        />
                        <label
                          htmlFor="wix-video-upload"
                          className={`block w-full px-4 py-3 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors font-paragraph text-sm ${
                            ui.saving
                              ? 'border-blue-200 bg-blue-50 text-blue-500 cursor-not-allowed'
                              : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50 text-blue-700'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Upload className="w-4 h-4" />
                            {ui.saving ? 'Uploading...' : 'Click to upload video to Wix Media Manager'}
                          </div>
                        </label>
                      </div>

                      {ui.uploadProgress > 0 && ui.uploadProgress < 100 && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="font-paragraph text-xs text-blue-700">Uploading to Wix Media Manager...</p>
                            <p className="font-paragraph text-xs font-semibold text-blue-900">{Math.round(ui.uploadProgress)}%</p>
                          </div>
                          <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${ui.uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {campaignForm.uploadedVideoFile && (
                        <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="flex-1">
                            <p className="text-sm text-green-700 font-semibold">
                              ✓ Video uploaded: {campaignForm.uploadedVideoFile.name}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              Size: {(campaignForm.uploadedVideoFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                            {campaignForm.videos && (
                              <p className="text-xs text-green-600 mt-1 break-all">
                                URL: {campaignForm.videos}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setCampaignForm(prev => ({ ...prev, uploadedVideoFile: undefined, videos: '' }))}
                            className="text-green-600 hover:text-green-800 flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                      <p className="font-paragraph text-sm font-semibold text-green-900">
                        ✨ Automatic Upload Feature
                      </p>
                      <div className="space-y-2">
                        <p className="font-paragraph text-xs text-green-800">
                          <span className="font-semibold">How it works:</span>
                        </p>
                        <ul className="space-y-1 text-xs text-green-700 ml-3">
                          <li>• Select a video file from your computer</li>
                          <li>• The video automatically uploads to Wix Media Manager</li>
                          <li>• The file URL is automatically saved to the 'videos' field</li>
                          <li>• Click "Save Campaign" to finalize</li>
                          <li>• Video displays on your homepage immediately!</li>
                        </ul>
                        <p className="font-paragraph text-xs text-green-700 mt-3">
                          <span className="font-semibold">Supported formats:</span> MP4, WebM, OGG, MOV, AVI (Max {FILE_SIZE_LIMITS.VIDEO_MAX_MB} MB)
                        </p>
                      </div>
                    </div>

                    {/* Video Preview Section */}
                    {campaignForm.videos && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 pt-4 border-t border-blue-200"
                      >
                        <div className="flex items-center justify-between">
                          <label className="font-paragraph text-sm font-semibold text-blue-900">
                            📺 Video Preview
                          </label>
                          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                            Interactive Player
                          </span>
                        </div>
                        <VideoPlayer 
                          src={campaignForm.videos}
                          title={campaignForm.campaignTitle || 'Campaign Video'}
                          className="shadow-lg border border-blue-200"
                        />
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <p className="font-paragraph text-xs text-blue-700">
                            <span className="font-semibold">💡 Tip:</span> Use the player controls to preview your video before saving. You can play, pause, adjust volume, and go fullscreen!
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-semibold text-blue-900">
                      Main Campaign Image URL
                    </label>
                    <Input
                      type="text"
                      value={campaignForm.mainCampaignImage}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, mainCampaignImage: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                      className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-semibold text-blue-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Campaign Start Date
                      </label>
                      <Input
                        type="date"
                        value={campaignForm.campaignStartDate}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, campaignStartDate: e.target.value }))}
                        className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-semibold text-blue-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Campaign End Date
                      </label>
                      <Input
                        type="date"
                        value={campaignForm.campaignEndDate}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, campaignEndDate: e.target.value }))}
                        className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 flex-wrap">
                    <Button
                      type="submit"
                      disabled={ui.saving}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg px-8 py-2 font-semibold shadow-lg"
                    >
                      {ui.saving ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <div className="flex-1">
                            <div className="text-sm font-semibold">Saving...</div>
                            {ui.uploadProgress > 0 && ui.uploadProgress < 100 && (
                              <div className="mt-1 w-32 h-2 bg-blue-400 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-white transition-all duration-300"
                                  style={{ width: `${ui.uploadProgress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Campaign
                        </>
                      )}
                    </Button>

                    {data.campaign && data.campaign.status !== 'live' && (
                      <Button
                        type="button"
                        onClick={handleToggleCampaignLive}
                        disabled={ui.saving}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 rounded-lg px-8 py-2 font-semibold shadow-lg flex items-center gap-2"
                      >
                        {ui.saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Going Live...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            Go Live & Accept Donations
                          </>
                        )}
                      </Button>
                    )}

                    {data.campaign && data.campaign.status === 'live' && (
                      <Button
                        type="button"
                        onClick={handleToggleCampaignLive}
                        disabled={ui.saving}
                        className="bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 rounded-lg px-8 py-2 font-semibold shadow-lg flex items-center gap-2"
                      >
                        {ui.saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Taking Offline...
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4" />
                            Take Offline
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <Card className="border-blue-200 bg-white shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="font-heading text-2xl font-bold text-blue-900 flex items-center gap-2">
                    <ImageIcon className="w-6 h-6" />
                    Manage Gallery Images
                  </CardTitle>
                  <Button
                    onClick={() => {
                      if (ui.showNewGalleryImage) {
                        resetGalleryForm();
                      } else {
                        setUI(prev => ({ ...prev, showNewGalleryImage: true }));
                      }
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Image
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {ui.showNewGalleryImage && (
                  <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSaveGalleryImage}
                    className="space-y-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-200"
                  >
                    <h3 className="font-heading text-lg font-bold text-blue-900">
                      {ui.editingGalleryImageId ? 'Edit Gallery Image' : 'New Gallery Image'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-blue-900">
                          Title *
                        </label>
                        <Input
                          type="text"
                          value={galleryForm.title}
                          onChange={(e) => setGalleryForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Main Entrance"
                          className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-blue-900">
                          Display Order
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={galleryForm.displayOrder}
                          onChange={(e) => setGalleryForm(prev => ({ ...prev, displayOrder: e.target.value }))}
                          placeholder="1"
                          className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-semibold text-blue-900">
                        Image URL or Upload *
                      </label>
                      <div className="space-y-3">
                        <Input
                          type="text"
                          value={galleryForm.image}
                          onChange={(e) => setGalleryForm(prev => ({ ...prev, image: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                          className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                        />
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="gallery-file-upload"
                          />
                          <label
                            htmlFor="gallery-file-upload"
                            className="block w-full px-4 py-2 border-2 border-dashed border-blue-300 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors font-paragraph text-sm text-blue-700"
                          >
                            Or click to upload an image
                          </label>
                        </div>
                        {galleryForm.uploadedFile && (
                          <p className="text-sm text-green-600 font-semibold">
                            ✓ File selected: {galleryForm.uploadedFile.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-semibold text-blue-900">
                        Alt Text *
                      </label>
                      <Input
                        type="text"
                        value={galleryForm.altText}
                        onChange={(e) => setGalleryForm(prev => ({ ...prev, altText: e.target.value }))}
                        placeholder="Descriptive text for accessibility"
                        className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-blue-900">
                          Width (px)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={galleryForm.width}
                          onChange={(e) => setGalleryForm(prev => ({ ...prev, width: e.target.value }))}
                          placeholder="400"
                          className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-blue-900">
                          Height (px)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={galleryForm.height}
                          onChange={(e) => setGalleryForm(prev => ({ ...prev, height: e.target.value }))}
                          placeholder="500"
                          className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-semibold text-blue-900">
                        Description
                      </label>
                      <Textarea
                        value={galleryForm.description}
                        onChange={(e) => setGalleryForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Additional details about the image..."
                        className="border-blue-200 focus:border-blue-600 focus:ring-blue-500 min-h-[100px]"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={ui.saving}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-lg"
                      >
                        {ui.saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            {ui.editingGalleryImageId ? 'Update' : 'Add'} Image
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        onClick={resetGalleryForm}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.form>
                )}

                {data.galleryImages.length === 0 ? (
                  <p className="font-paragraph text-center text-blue-600/60 py-8">
                    No gallery images yet. Add one to get started!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.galleryImages.map((image) => (
                      <motion.div
                        key={image._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-blue-50 rounded-lg overflow-hidden border border-blue-200 space-y-4"
                      >
                        {image.image && (
                          <div className="w-full h-40 overflow-hidden bg-white">
                            <Image 
                              src={image.image} 
                              alt={image.altText || image.title || 'Gallery image'} 
                              className="w-full h-full object-cover" 
                              width={300} 
                            />
                          </div>
                        )}
                        <div className="p-4 space-y-2">
                          <h4 className="font-heading text-lg font-bold text-blue-900">
                            {image.title}
                          </h4>
                          <p className="font-paragraph text-sm text-blue-700">
                            {image.altText}
                          </p>
                          {image.description && (
                            <p className="font-paragraph text-xs text-blue-600/70">
                              {image.description}
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                            {image.width && (
                              <div className="bg-white rounded p-2">
                                <p className="text-blue-600/60">Width</p>
                                <p className="font-bold text-blue-900">{image.width}px</p>
                              </div>
                            )}
                            {image.height && (
                              <div className="bg-white rounded p-2">
                                <p className="text-blue-600/60">Height</p>
                                <p className="font-bold text-blue-900">{image.height}px</p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button
                              onClick={() => handleEditGalleryImage(image)}
                              variant="outline"
                              size="sm"
                              className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteGalleryImage(image._id)}
                              variant="outline"
                              size="sm"
                              className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="matchers">
            <Card className="border-blue-200 bg-white shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="font-heading text-2xl font-bold text-blue-900">
                    Manage Matchers
                  </CardTitle>
                  <Button
                    onClick={() => {
                      if (ui.showNewMatcher) {
                        resetMatcherForm();
                      } else {
                        setUI(prev => ({ ...prev, showNewMatcher: true }));
                      }
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Matcher
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {ui.showNewMatcher && (
                  <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSaveMatcher}
                    className="space-y-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-200"
                  >
                    <h3 className="font-heading text-lg font-bold text-blue-900">
                      {ui.editingMatcherId ? 'Edit Matcher' : 'New Matcher'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-blue-900">
                          Matcher Name *
                        </label>
                        <Input
                          type="text"
                          value={matcherForm.matcherName}
                          onChange={(e) => setMatcherForm(prev => ({ ...prev, matcherName: e.target.value }))}
                          placeholder="Company or Organization"
                          className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-blue-900">
                          Contact Email *
                        </label>
                        <Input
                          type="email"
                          value={matcherForm.contactEmail}
                          onChange={(e) => setMatcherForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                          placeholder="contact@example.com"
                          className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-blue-900">
                          Matching Amount ($) *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={matcherForm.matchingAmount}
                          onChange={(e) => setMatcherForm(prev => ({ ...prev, matchingAmount: e.target.value }))}
                          placeholder="50000"
                          className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-blue-900">
                          Matching Percentage (%) *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={matcherForm.matchingPercentage}
                          onChange={(e) => setMatcherForm(prev => ({ ...prev, matchingPercentage: e.target.value }))}
                          placeholder="100"
                          className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-blue-900">
                          Matching Limit ($)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={matcherForm.matchingLimit}
                          onChange={(e) => setMatcherForm(prev => ({ ...prev, matchingLimit: e.target.value }))}
                          placeholder="100000"
                          className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-blue-900">
                          Status
                        </label>
                        <select
                          value={matcherForm.matcherStatus}
                          onChange={(e) => setMatcherForm(prev => ({ ...prev, matcherStatus: e.target.value }))}
                          className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-blue-500 font-paragraph"
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={ui.saving}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-lg"
                      >
                        {ui.saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            {ui.editingMatcherId ? 'Update' : 'Add'} Matcher
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        onClick={resetMatcherForm}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.form>
                )}

                {data.matchers.length === 0 ? (
                  <p className="font-paragraph text-center text-blue-600/60 py-8">
                    No matchers yet. Add one to boost donations!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {data.matchers.map((matcher) => (
                      <motion.div
                        key={matcher._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-blue-50 rounded-lg p-6 border border-blue-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-heading text-lg font-bold text-blue-900">
                              {matcher.matcherName}
                            </h4>
                            <p className="font-paragraph text-sm text-blue-700 mt-1">
                              {matcher.contactEmail}
                            </p>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                              <div>
                                <p className="font-paragraph text-xs text-blue-600/60">Amount</p>
                                <p className="font-heading font-bold text-blue-900">
                                  £{matcher.matchingAmount?.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="font-paragraph text-xs text-blue-600/60">Rate</p>
                                <p className="font-heading font-bold text-blue-900">
                                  {matcher.matchingPercentage}%
                                </p>
                              </div>
                              <div>
                                <p className="font-paragraph text-xs text-blue-600/60">Status</p>
                                <p className="font-paragraph text-sm font-semibold text-blue-900">
                                  {matcher.status}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              onClick={() => handleEditMatcher(matcher)}
                              variant="outline"
                              size="sm"
                              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteMatcher(matcher._id)}
                              variant="outline"
                              size="sm"
                              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams">
            <Card className="border-blue-200 bg-white shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="font-heading text-2xl font-bold text-blue-900">
                    Manage Teams
                  </CardTitle>
                  <Button
                    onClick={() => {
                      if (ui.showNewTeam) {
                        resetTeamForm();
                      } else {
                        setUI(prev => ({ ...prev, showNewTeam: true }));
                      }
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Team
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {ui.showNewTeam && (
                  <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSaveTeam}
                    className="space-y-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-200"
                  >
                    <h3 className="font-heading text-lg font-bold text-blue-900">
                      {ui.editingTeamId ? 'Edit Team' : 'New Team'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-blue-900">
                          Team Name *
                        </label>
                        <Input
                          type="text"
                          value={teamForm.teamName}
                          onChange={(e) => setTeamForm(prev => ({ ...prev, teamName: e.target.value }))}
                          placeholder="Team Name"
                          className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-blue-900">
                          Fundraising Goal ($) *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={teamForm.teamGoal}
                          onChange={(e) => setTeamForm(prev => ({ ...prev, teamGoal: e.target.value }))}
                          placeholder="50000"
                          className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-blue-900">
                          Number of Members *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={teamForm.memberCount}
                          onChange={(e) => setTeamForm(prev => ({ ...prev, memberCount: e.target.value }))}
                          placeholder="10"
                          className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-blue-900">
                          Team Logo URL
                        </label>
                        <Input
                          type="text"
                          value={teamForm.teamLogo}
                          onChange={(e) => setTeamForm(prev => ({ ...prev, teamLogo: e.target.value }))}
                          placeholder="https://example.com/logo.jpg"
                          className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-blue-900">
                          Team ID *
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            value={teamForm.teamId}
                            readOnly
                            placeholder="Auto-generated"
                            className="border-blue-200 focus:border-blue-600 focus:ring-blue-500 bg-blue-50"
                          />
                          <Button
                            type="button"
                            onClick={generateTeamId}
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                          >
                            Generate
                          </Button>
                          <Button
                            type="button"
                            onClick={() => copyToClipboard(teamForm.teamId, 'Team ID')}
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-blue-900">
                          Team Password *
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            value={teamForm.teamPassword}
                            readOnly
                            placeholder="Auto-generated"
                            className="border-blue-200 focus:border-blue-600 focus:ring-blue-500 bg-blue-50"
                          />
                          <Button
                            type="button"
                            onClick={generateTeamPassword}
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                          >
                            Generate
                          </Button>
                          <Button
                            type="button"
                            onClick={() => copyToClipboard(teamForm.teamPassword, 'Password')}
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-semibold text-blue-900">
                        Team Description *
                      </label>
                      <Textarea
                        value={teamForm.teamDescription}
                        onChange={(e) => setTeamForm(prev => ({ ...prev, teamDescription: e.target.value }))}
                        placeholder="Describe the team and its mission..."
                        className="border-blue-200 focus:border-blue-600 focus:ring-blue-500 min-h-[100px]"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={ui.saving}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-lg"
                      >
                        {ui.saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            {ui.editingTeamId ? 'Update' : 'Add'} Team
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        onClick={resetTeamForm}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.form>
                )}

                {data.teams.length === 0 ? (
                  <p className="font-paragraph text-center text-blue-600/60 py-8">
                    No teams yet. Create one to encourage group fundraising!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.teams.map((team) => {
                      const teamDonations = data.donations.filter(d => d.teamId === team._id);
                      const teamTotal = teamDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

                      return (
                        <motion.div
                          key={team._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-blue-50 rounded-lg p-6 border border-blue-200 space-y-4"
                        >
                          {team.teamLogo && (
                            <div className="w-full h-32 rounded-lg overflow-hidden bg-white">
                              <Image 
                                src={team.teamLogo} 
                                alt={team.teamName || 'Team logo'} 
                                className="w-full h-full object-cover" 
                                width={400} 
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="font-heading text-lg font-bold text-blue-900">
                              {team.teamName}
                            </h4>
                            <p className="font-paragraph text-sm text-blue-700 mt-1">
                              {team.teamDescription}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="bg-white rounded p-2">
                              <p className="font-paragraph text-xs text-blue-600/60">Members</p>
                              <p className="font-heading font-bold text-blue-900">{team.memberCount}</p>
                            </div>
                            <div className="bg-white rounded p-2">
                              <p className="font-paragraph text-xs text-blue-600/60">Goal</p>
                              <p className="font-heading font-bold text-blue-900">£{(team.fundraisingGoal || 0) / 1000}k</p>
                            </div>
                            <div className="bg-white rounded p-2">
                              <p className="font-paragraph text-xs text-blue-600/60">Raised</p>
                              <p className="font-heading font-bold text-blue-900">£{(teamTotal / 1000).toFixed(1)}k</p>
                            </div>
                          </div>
                          <div className="bg-white rounded p-3 border border-blue-200 space-y-2">
                            <p className="font-paragraph text-xs text-blue-600/60 font-semibold">CREDENTIALS</p>
                            <div className="space-y-1">
                              <p className="font-paragraph text-sm text-blue-900">
                                <span className="font-semibold">ID:</span> {team.teamId}
                              </p>
                              <p className="font-paragraph text-sm text-blue-900">
                                <span className="font-semibold">Password:</span> {team.teamPassword}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setUI(prev => ({ 
                                ...prev, 
                                showEmailSender: true,
                                selectedTeamForEmail: team
                              }))}
                              variant="outline"
                              className="flex-1 border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-lg"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Email
                            </Button>
                            <Button
                              onClick={() => handleEditTeam(team)}
                              variant="outline"
                              className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteTeam(team._id)}
                              variant="outline"
                              className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations">
            <Card className="border-blue-200 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="font-heading text-2xl font-bold text-blue-900">
                  Donations Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Team Filter */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-semibold text-blue-900">
                      Filter by Team (Optional)
                    </label>
                    <select
                      value={selectedTeamForDonations}
                      onChange={(e) => setSelectedTeamForDonations(e.target.value)}
                      className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-blue-500 font-paragraph"
                    >
                      <option value="">All Donations</option>
                      {data.teams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.teamName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Donations List */}
                {(() => {
                  // Apply all filters
                  let filteredDonations = data.donations;

                  // Team filter
                  if (selectedTeamForDonations) {
                    filteredDonations = filteredDonations.filter(d => d.teamId === selectedTeamForDonations);
                  }

                  // Search filter
                  if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    filteredDonations = filteredDonations.filter(d => 
                      (d.donorName?.toLowerCase().includes(query)) ||
                      (d.donorEmail?.toLowerCase().includes(query))
                    );
                  }

                  // Status filter
                  if (statusFilter) {
                    filteredDonations = filteredDonations.filter(d => d.status === statusFilter);
                  }

                  // Amount filter
                  if (amountFilter) {
                    filteredDonations = filteredDonations.filter(d => {
                      const amount = d.amount || 0;
                      if (amountFilter === '0-50') return amount >= 0 && amount <= 50;
                      if (amountFilter === '50-100') return amount > 50 && amount <= 100;
                      if (amountFilter === '100-500') return amount > 100 && amount <= 500;
                      if (amountFilter === '500+') return amount > 500;
                      return true;
                    });
                  }
                  
                  const teamTotal = filteredDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

                  return (
                    <>
                      {selectedTeamForDonations && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="font-paragraph text-sm text-blue-700">
                            <span className="font-semibold">Team Total:</span> £{teamTotal.toLocaleString()} from {filteredDonations.length} donation{filteredDonations.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      )}

                      {filteredDonations.length === 0 ? (
                        <p className="font-paragraph text-center text-blue-600/60 py-8">
                          {selectedTeamForDonations ? 'No donations for this team yet.' : 'No donations yet. Share your campaign to start receiving support!'}
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b-2 border-blue-200">
                                <th className="font-heading text-left py-3 px-4 text-blue-900 text-sm">Donor</th>
                                <th className="font-heading text-left py-3 px-4 text-blue-900 text-sm">Email</th>
                                <th className="font-heading text-left py-3 px-4 text-blue-900 text-sm">Amount</th>
                                <th className="font-heading text-left py-3 px-4 text-blue-900 text-sm">Date</th>
                                <th className="font-heading text-left py-3 px-4 text-blue-900 text-sm">Team</th>
                                <th className="font-heading text-left py-3 px-4 text-blue-900 text-sm">Status</th>
                                <th className="font-heading text-left py-3 px-4 text-blue-900 text-sm">Message</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredDonations.map((donation) => {
                                const donationTeam = data.teams.find(t => t._id === donation.teamId);
                                return (
                                  <tr key={donation._id} className="border-b border-blue-100 hover:bg-blue-50">
                                    <td className="font-paragraph py-3 px-4 text-blue-900 text-sm">
                                      {donation.donorName || 'Anonymous'}
                                    </td>
                                    <td className="font-paragraph py-3 px-4 text-blue-700 text-sm">
                                      {donation.donorEmail}
                                    </td>
                                    <td className="font-paragraph py-3 px-4 text-blue-900 font-bold text-sm">
                                      £{donation.amount?.toLocaleString()}
                                    </td>
                                    <td className="font-paragraph py-3 px-4 text-blue-700 text-sm">
                                      {donation.donationDate 
                                        ? new Date(donation.donationDate).toLocaleDateString() 
                                        : '-'}
                                    </td>
                                    <td className="font-paragraph py-3 px-4 text-blue-700 text-sm">
                                      {donationTeam ? donationTeam.teamName : 'Individual'}
                                    </td>
                                    <td className="font-paragraph py-3 px-4 text-sm">
                                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        donation.status === 'completed' 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-blue-100 text-blue-700'
                                      }`}>
                                        {donation.status || 'pending'}
                                      </span>
                                    </td>
                                    <td className="font-paragraph py-3 px-4 text-blue-700 text-sm max-w-xs truncate">
                                      {donation.donorMessage || '-'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Email Sender Modal */}
      <AnimatePresence>
        {ui.showEmailSender && ui.selectedTeamForEmail && (
          <TeamEmailSender
            team={ui.selectedTeamForEmail}
            onClose={() => setUI(prev => ({ 
              ...prev, 
              showEmailSender: false,
              selectedTeamForEmail: null
            }))}
            onSuccess={() => {
              setUI(prev => ({ 
                ...prev, 
                successMessage: 'Email sent successfully!'
              }));
              setTimeout(() => {
                setUI(prev => ({ ...prev, successMessage: null }));
              }, 3000);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
