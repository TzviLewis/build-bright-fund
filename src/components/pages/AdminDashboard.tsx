import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails, Donations, Matchers, Teams, GalleryImages } from '@/entities';
import { 
  ArrowLeft, Save, DollarSign, Users, TrendingUp, Calendar, 
  Trash2, Plus, Edit, AlertCircle, CheckCircle, X, Loader2, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image } from '@/components/ui/image';
import DonationWidget from '@/components/DonationWidget';
import { FILE_SIZE_LIMITS } from '@/lib/media-upload';

interface FormState {
  campaignTitle: string;
  fundraisingGoal: string;
  bonusGoal: string;
  bonusGoalDescription: string;
  projectDescription: string;
  promotionalText: string;
  mainCampaignImage: string;
  campaignVideo: string;
  campaignStartDate: string;
  campaignEndDate: string;
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
    fundraisingGoal: '',
    bonusGoal: '',
    bonusGoalDescription: '',
    projectDescription: '',
    promotionalText: '',
    mainCampaignImage: '',
    campaignVideo: '',
    campaignStartDate: '',
    campaignEndDate: '',
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
          fundraisingGoal: campaign.fundraisingGoal?.toString() || '',
          bonusGoal: campaign.bonusGoal?.toString() || '',
          bonusGoalDescription: campaign.bonusGoalDescription || '',
          projectDescription: campaign.projectDescription || '',
          promotionalText: campaign.promotionalText || '',
          mainCampaignImage: campaign.mainCampaignImage || '',
          campaignVideo: campaign.campaignVideo || '',
          campaignStartDate: campaign.campaignStartDate 
            ? new Date(campaign.campaignStartDate).toISOString().split('T')[0] 
            : '',
          campaignEndDate: campaign.campaignEndDate 
            ? new Date(campaign.campaignEndDate).toISOString().split('T')[0] 
            : '',
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
        fundraisingGoal: parseFloat(campaignForm.fundraisingGoal),
        bonusGoal: campaignForm.bonusGoal ? parseFloat(campaignForm.bonusGoal) : 0,
        bonusGoalDescription: campaignForm.bonusGoalDescription || '',
        projectDescription: campaignForm.projectDescription || '',
        promotionalText: campaignForm.promotionalText || '',
        mainCampaignImage: campaignForm.mainCampaignImage || '',
        campaignVideo: videoUrl || '',
        campaignStartDate: campaignForm.campaignStartDate 
          ? new Date(campaignForm.campaignStartDate).toISOString() 
          : '',
        campaignEndDate: campaignForm.campaignEndDate 
          ? new Date(campaignForm.campaignEndDate).toISOString() 
          : '',
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
        !teamForm.teamDescription || !teamForm.memberCount) {
      setUI(prev => ({ 
        ...prev, 
        error: 'All team fields are required' 
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
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a data URL for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCampaignForm(prev => ({ 
          ...prev, 
          campaignVideo: dataUrl,
          uploadedVideoFile: file 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate stats
  const totalRaised = data.donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const completedDonations = data.donations.filter(d => d.status === 'completed');
  const progressPercentage = data.campaign?.fundraisingGoal 
    ? Math.min((totalRaised / data.campaign.fundraisingGoal) * 100, 100)
    : 0;

  // Loading state
  if (ui.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="font-heading text-lg text-blue-900">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white border-b-4 border-blue-600 shadow-lg">
        <div className="max-w-[120rem] mx-auto px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-heading text-4xl font-bold">Admin Dashboard</h1>
              <p className="font-paragraph text-base text-blue-100 mt-2">
                Campaign management & analytics
              </p>
            </div>
            <Link to="/">
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-900 rounded-lg px-6 py-2 font-semibold"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[120rem] mx-auto px-8 py-12">
        {/* Global Alerts */}
        <AnimatePresence>
          {ui.successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 border-2 border-green-400 rounded-lg flex items-start gap-3"
            >
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-paragraph font-semibold text-green-700">
                  {ui.successMessage}
                </p>
              </div>
              <button
                onClick={() => setUI(prev => ({ ...prev, successMessage: null }))}
                className="text-green-600 hover:text-green-700 flex-shrink-0"
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
              className="mb-6 p-4 bg-red-50 border-2 border-red-400 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-paragraph font-semibold text-red-700">
                  Error
                </p>
                <p className="font-paragraph text-sm text-red-600/80 mt-1">
                  {ui.error}
                </p>
              </div>
              <button
                onClick={() => setUI(prev => ({ ...prev, error: null }))}
                className="text-red-600 hover:text-red-700 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-blue-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm font-semibold text-blue-700 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Total Raised
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-3xl font-bold text-blue-900">
                  £{totalRaised.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-blue-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm font-semibold text-blue-700 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Total Donors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-3xl font-bold text-blue-900">
                  {completedDonations.length}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-blue-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm font-semibold text-blue-700 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-3xl font-bold text-blue-900">
                  {progressPercentage.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="border-blue-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm font-semibold text-blue-700 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-3xl font-bold text-blue-900">
                  £{data.campaign?.fundraisingGoal?.toLocaleString() || '0'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="campaign" className="space-y-8">
          <TabsList className="bg-blue-100 border border-blue-300">
            <TabsTrigger value="campaign" className="font-paragraph data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Campaign
            </TabsTrigger>
            <TabsTrigger value="gallery" className="font-paragraph data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Gallery
            </TabsTrigger>
            <TabsTrigger value="matchers" className="font-paragraph data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Matchers
            </TabsTrigger>
            <TabsTrigger value="teams" className="font-paragraph data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Teams
            </TabsTrigger>
            <TabsTrigger value="donations" className="font-paragraph data-[state=active]:bg-blue-600 data-[state=active]:text-white">
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

                  <Button
                    type="submit"
                    disabled={ui.saving}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg px-8 py-2 font-semibold w-full md:w-auto shadow-lg"
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
                          <div className="flex gap-2">
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
                  const filteredDonations = selectedTeamForDonations 
                    ? data.donations.filter(d => d.teamId === selectedTeamForDonations)
                    : data.donations;
                  
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
    </div>
  );
}
