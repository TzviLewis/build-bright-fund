import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails, Donations, Matchers, Teams } from '@/entities';
import { 
  ArrowLeft, Save, DollarSign, Users, TrendingUp, Calendar, 
  Trash2, Plus, Edit, AlertCircle, CheckCircle, X, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image } from '@/components/ui/image';
import DonationWidget from '@/components/DonationWidget';

interface FormState {
  campaignTitle: string;
  fundraisingGoal: string;
  projectDescription: string;
  promotionalText: string;
  mainCampaignImage: string;
  campaignStartDate: string;
  campaignEndDate: string;
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

interface UIState {
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  showNewMatcher: boolean;
  showNewTeam: boolean;
  editingMatcherId: string | null;
  editingTeamId: string | null;
}

interface DataState {
  campaign: CampaignDetails | null;
  donations: Donations[];
  matchers: Matchers[];
  teams: Teams[];
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
    editingMatcherId: null,
    editingTeamId: null,
  });

  // Data State
  const [data, setData] = useState<DataState>({
    campaign: null,
    donations: [],
    matchers: [],
    teams: [],
  });

  // Campaign Form State
  const [campaignForm, setCampaignForm] = useState<FormState>({
    campaignTitle: '',
    fundraisingGoal: '',
    projectDescription: '',
    promotionalText: '',
    mainCampaignImage: '',
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

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Load all data from database
  const loadAllData = async () => {
    try {
      setUI(prev => ({ ...prev, loading: true, error: null }));
      
      const [campaignRes, donationsRes, matchersRes, teamsRes] = await Promise.all([
        BaseCrudService.getAll<CampaignDetails>('campaigndetails'),
        BaseCrudService.getAll<Donations>('donations'),
        BaseCrudService.getAll<Matchers>('matchers'),
        BaseCrudService.getAll<Teams>('teams'),
      ]);

      const campaign = campaignRes.items?.[0] || null;
      
      setData({
        campaign,
        donations: donationsRes.items || [],
        matchers: matchersRes.items || [],
        teams: teamsRes.items || [],
      });

      // Load campaign form if exists
      if (campaign) {
        setCampaignForm({
          campaignTitle: campaign.campaignTitle || '',
          fundraisingGoal: campaign.fundraisingGoal?.toString() || '',
          projectDescription: campaign.projectDescription || '',
          promotionalText: campaign.promotionalText || '',
          mainCampaignImage: campaign.mainCampaignImage || '',
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

      const campaignData: CampaignDetails = {
        _id: data.campaign?._id || crypto.randomUUID(),
        campaignTitle: campaignForm.campaignTitle,
        fundraisingGoal: parseFloat(campaignForm.fundraisingGoal),
        projectDescription: campaignForm.projectDescription,
        promotionalText: campaignForm.promotionalText,
        mainCampaignImage: campaignForm.mainCampaignImage,
        campaignStartDate: campaignForm.campaignStartDate 
          ? new Date(campaignForm.campaignStartDate).toISOString() 
          : undefined,
        campaignEndDate: campaignForm.campaignEndDate 
          ? new Date(campaignForm.campaignEndDate).toISOString() 
          : undefined,
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

  // Calculate stats
  const totalRaised = data.donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const completedDonations = data.donations.filter(d => d.status === 'completed');
  const progressPercentage = data.campaign?.fundraisingGoal 
    ? Math.min((totalRaised / data.campaign.fundraisingGoal) * 100, 100)
    : 0;

  // Loading state
  if (ui.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="font-heading text-lg text-primary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground border-b-4 border-secondary">
        <div className="max-w-[120rem] mx-auto px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-heading text-4xl font-bold">Campaign Admin</h1>
              <p className="font-paragraph text-base text-primary-foreground/80 mt-2">
                Manage your fundraising campaign, teams, and donors
              </p>
            </div>
            <Link to="/">
              <Button 
                variant="outline" 
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary rounded-lg px-6 py-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaign
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
              className="mb-6 p-4 bg-secondary/10 border-2 border-secondary rounded-lg flex items-start gap-3"
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
              className="mb-6 p-4 bg-destructive/10 border-2 border-destructive rounded-lg flex items-start gap-3"
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-primary/20 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm font-semibold text-primary/70 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Total Raised
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-3xl font-bold text-secondary">
                  ${totalRaised.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-primary/20 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm font-semibold text-primary/70 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Total Donors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-3xl font-bold text-primary">
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
            <Card className="border-primary/20 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm font-semibold text-primary/70 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-3xl font-bold text-primary">
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
            <Card className="border-primary/20 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm font-semibold text-primary/70 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-3xl font-bold text-primary">
                  ${data.campaign?.fundraisingGoal?.toLocaleString() || '0'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="campaign" className="space-y-8">
          <TabsList className="bg-primary/10 border border-primary/20">
            <TabsTrigger value="campaign" className="font-paragraph data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Campaign
            </TabsTrigger>
            <TabsTrigger value="matchers" className="font-paragraph data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Matchers
            </TabsTrigger>
            <TabsTrigger value="teams" className="font-paragraph data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Teams
            </TabsTrigger>
            <TabsTrigger value="donations" className="font-paragraph data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Donations
            </TabsTrigger>
          </TabsList>

          {/* Campaign Tab */}
          <TabsContent value="campaign">
            <Card className="border-primary/20 bg-white">
              <CardHeader>
                <CardTitle className="font-heading text-2xl font-bold text-primary">
                  Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveCampaign} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-semibold text-primary">
                        Campaign Title *
                      </label>
                      <Input
                        type="text"
                        value={campaignForm.campaignTitle}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, campaignTitle: e.target.value }))}
                        placeholder="e.g., Building Our Future"
                        className="border-primary/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-semibold text-primary">
                        Fundraising Goal ($) *
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={campaignForm.fundraisingGoal}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, fundraisingGoal: e.target.value }))}
                        placeholder="e.g., 500000"
                        className="border-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-semibold text-primary">
                      Promotional Text
                    </label>
                    <Textarea
                      value={campaignForm.promotionalText}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, promotionalText: e.target.value }))}
                      placeholder="A compelling message to inspire donations..."
                      className="border-primary/20 min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-semibold text-primary">
                      Project Description
                    </label>
                    <Textarea
                      value={campaignForm.projectDescription}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, projectDescription: e.target.value }))}
                      placeholder="Detailed description of the project..."
                      className="border-primary/20 min-h-[150px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-semibold text-primary">
                      Main Campaign Image URL
                    </label>
                    <Input
                      type="text"
                      value={campaignForm.mainCampaignImage}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, mainCampaignImage: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                      className="border-primary/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-semibold text-primary flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Campaign Start Date
                      </label>
                      <Input
                        type="date"
                        value={campaignForm.campaignStartDate}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, campaignStartDate: e.target.value }))}
                        className="border-primary/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-semibold text-primary flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Campaign End Date
                      </label>
                      <Input
                        type="date"
                        value={campaignForm.campaignEndDate}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, campaignEndDate: e.target.value }))}
                        className="border-primary/20"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={ui.saving}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg px-8 py-2 font-semibold w-full md:w-auto"
                  >
                    {ui.saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
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

          {/* Matchers Tab */}
          <TabsContent value="matchers">
            <Card className="border-primary/20 bg-white">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="font-heading text-2xl font-bold text-primary">
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
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg"
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
                    className="space-y-6 p-6 bg-primary/5 rounded-lg border-2 border-primary/20"
                  >
                    <h3 className="font-heading text-lg font-bold text-primary">
                      {ui.editingMatcherId ? 'Edit Matcher' : 'New Matcher'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-primary">
                          Matcher Name *
                        </label>
                        <Input
                          type="text"
                          value={matcherForm.matcherName}
                          onChange={(e) => setMatcherForm(prev => ({ ...prev, matcherName: e.target.value }))}
                          placeholder="Company or Organization"
                          className="border-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-primary">
                          Contact Email *
                        </label>
                        <Input
                          type="email"
                          value={matcherForm.contactEmail}
                          onChange={(e) => setMatcherForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                          placeholder="contact@example.com"
                          className="border-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-primary">
                          Matching Amount ($) *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={matcherForm.matchingAmount}
                          onChange={(e) => setMatcherForm(prev => ({ ...prev, matchingAmount: e.target.value }))}
                          placeholder="50000"
                          className="border-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-primary">
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
                          className="border-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-primary">
                          Matching Limit ($)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={matcherForm.matchingLimit}
                          onChange={(e) => setMatcherForm(prev => ({ ...prev, matchingLimit: e.target.value }))}
                          placeholder="100000"
                          className="border-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-primary">
                          Status
                        </label>
                        <select
                          value={matcherForm.matcherStatus}
                          onChange={(e) => setMatcherForm(prev => ({ ...prev, matcherStatus: e.target.value }))}
                          className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:border-secondary focus:outline-none font-paragraph"
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
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg"
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
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.form>
                )}

                {data.matchers.length === 0 ? (
                  <p className="font-paragraph text-center text-primary/60 py-8">
                    No matchers yet. Add one to boost donations!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {data.matchers.map((matcher) => (
                      <motion.div
                        key={matcher._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-primary/5 rounded-lg p-6 border border-primary/10"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-heading text-lg font-bold text-primary">
                              {matcher.matcherName}
                            </h4>
                            <p className="font-paragraph text-sm text-primary/70 mt-1">
                              {matcher.contactEmail}
                            </p>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                              <div>
                                <p className="font-paragraph text-xs text-primary/60">Amount</p>
                                <p className="font-heading font-bold text-secondary">
                                  ${matcher.matchingAmount?.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="font-paragraph text-xs text-primary/60">Rate</p>
                                <p className="font-heading font-bold text-primary">
                                  {matcher.matchingPercentage}%
                                </p>
                              </div>
                              <div>
                                <p className="font-paragraph text-xs text-primary/60">Status</p>
                                <p className="font-paragraph text-sm font-semibold text-primary">
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
                              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteMatcher(matcher._id)}
                              variant="outline"
                              size="sm"
                              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-lg"
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
            <Card className="border-primary/20 bg-white">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="font-heading text-2xl font-bold text-primary">
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
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg"
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
                    className="space-y-6 p-6 bg-primary/5 rounded-lg border-2 border-primary/20"
                  >
                    <h3 className="font-heading text-lg font-bold text-primary">
                      {ui.editingTeamId ? 'Edit Team' : 'New Team'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-primary">
                          Team Name *
                        </label>
                        <Input
                          type="text"
                          value={teamForm.teamName}
                          onChange={(e) => setTeamForm(prev => ({ ...prev, teamName: e.target.value }))}
                          placeholder="Team Name"
                          className="border-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-primary">
                          Fundraising Goal ($) *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={teamForm.teamGoal}
                          onChange={(e) => setTeamForm(prev => ({ ...prev, teamGoal: e.target.value }))}
                          placeholder="50000"
                          className="border-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-primary">
                          Number of Members *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={teamForm.memberCount}
                          onChange={(e) => setTeamForm(prev => ({ ...prev, memberCount: e.target.value }))}
                          placeholder="10"
                          className="border-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-sm font-semibold text-primary">
                          Team Logo URL
                        </label>
                        <Input
                          type="text"
                          value={teamForm.teamLogo}
                          onChange={(e) => setTeamForm(prev => ({ ...prev, teamLogo: e.target.value }))}
                          placeholder="https://example.com/logo.jpg"
                          className="border-primary/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-semibold text-primary">
                        Team Description *
                      </label>
                      <Textarea
                        value={teamForm.teamDescription}
                        onChange={(e) => setTeamForm(prev => ({ ...prev, teamDescription: e.target.value }))}
                        placeholder="Describe the team and its mission..."
                        className="border-primary/20 min-h-[100px]"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={ui.saving}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg"
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
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.form>
                )}

                {data.teams.length === 0 ? (
                  <p className="font-paragraph text-center text-primary/60 py-8">
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
                          className="bg-primary/5 rounded-lg p-6 border border-primary/10 space-y-4"
                        >
                          {team.teamLogo && (
                            <div className="w-full h-32 rounded-lg overflow-hidden bg-background">
                              <Image 
                                src={team.teamLogo} 
                                alt={team.teamName || 'Team logo'} 
                                className="w-full h-full object-cover" 
                                width={400} 
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="font-heading text-lg font-bold text-primary">
                              {team.teamName}
                            </h4>
                            <p className="font-paragraph text-sm text-primary/70 mt-1">
                              {team.teamDescription}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="bg-background rounded p-2">
                              <p className="font-paragraph text-xs text-primary/60">Members</p>
                              <p className="font-heading font-bold text-primary">{team.memberCount}</p>
                            </div>
                            <div className="bg-background rounded p-2">
                              <p className="font-paragraph text-xs text-primary/60">Goal</p>
                              <p className="font-heading font-bold text-primary">${(team.fundraisingGoal || 0) / 1000}k</p>
                            </div>
                            <div className="bg-background rounded p-2">
                              <p className="font-paragraph text-xs text-primary/60">Raised</p>
                              <p className="font-heading font-bold text-secondary">${(teamTotal / 1000).toFixed(1)}k</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEditTeam(team)}
                              variant="outline"
                              className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteTeam(team._id)}
                              variant="outline"
                              className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-lg"
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
            <Card className="border-primary/20 bg-white">
              <CardHeader>
                <CardTitle className="font-heading text-2xl font-bold text-primary">
                  All Donations ({data.donations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.donations.length === 0 ? (
                  <p className="font-paragraph text-center text-primary/60 py-8">
                    No donations yet. Share your campaign to start receiving support!
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-primary/20">
                          <th className="font-heading text-left py-3 px-4 text-primary text-sm">Donor</th>
                          <th className="font-heading text-left py-3 px-4 text-primary text-sm">Email</th>
                          <th className="font-heading text-left py-3 px-4 text-primary text-sm">Amount</th>
                          <th className="font-heading text-left py-3 px-4 text-primary text-sm">Date</th>
                          <th className="font-heading text-left py-3 px-4 text-primary text-sm">Status</th>
                          <th className="font-heading text-left py-3 px-4 text-primary text-sm">Message</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.donations.map((donation) => (
                          <tr key={donation._id} className="border-b border-primary/10 hover:bg-primary/5">
                            <td className="font-paragraph py-3 px-4 text-primary text-sm">
                              {donation.donorName || 'Anonymous'}
                            </td>
                            <td className="font-paragraph py-3 px-4 text-primary/70 text-sm">
                              {donation.donorEmail}
                            </td>
                            <td className="font-paragraph py-3 px-4 text-secondary font-bold text-sm">
                              ${donation.amount?.toLocaleString()}
                            </td>
                            <td className="font-paragraph py-3 px-4 text-primary/70 text-sm">
                              {donation.donationDate 
                                ? new Date(donation.donationDate).toLocaleDateString() 
                                : '-'}
                            </td>
                            <td className="font-paragraph py-3 px-4 text-sm">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                donation.status === 'completed' 
                                  ? 'bg-secondary/10 text-secondary' 
                                  : 'bg-primary/10 text-primary'
                              }`}>
                                {donation.status || 'pending'}
                              </span>
                            </td>
                            <td className="font-paragraph py-3 px-4 text-primary/70 text-sm max-w-xs truncate">
                              {donation.donorMessage || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
