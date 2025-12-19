import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails, Donations } from '@/entities';
import { 
  ArrowLeft, Plus, Edit, Trash2, AlertCircle, CheckCircle, X, Loader2, 
  Zap, Calendar, DollarSign, Users, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image } from '@/components/ui/image';

interface GoLiveFormState {
  campaignTitle: string;
  fundraisingGoal: string;
  bonusGoal: string;
  bonusGoalDescription: string;
  projectDescription: string;
  promotionalText: string;
  mainCampaignImage: string;
  campaignStartDate: string;
  campaignEndDate: string;
}

interface UIState {
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  showGoLiveForm: boolean;
  editingCampaignId: string | null;
}

export default function AdminCampaignsPage() {
  const [ui, setUI] = useState<UIState>({
    loading: true,
    saving: false,
    error: null,
    successMessage: null,
    showGoLiveForm: false,
    editingCampaignId: null,
  });

  const [campaigns, setCampaigns] = useState<CampaignDetails[]>([]);
  const [donations, setDonations] = useState<Donations[]>([]);

  const [goLiveForm, setGoLiveForm] = useState<GoLiveFormState>({
    campaignTitle: '',
    fundraisingGoal: '',
    bonusGoal: '',
    bonusGoalDescription: '',
    projectDescription: '',
    promotionalText: '',
    mainCampaignImage: '',
    campaignStartDate: '',
    campaignEndDate: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setUI(prev => ({ ...prev, loading: true, error: null }));
      const [campaignRes, donationsRes] = await Promise.all([
        BaseCrudService.getAll<CampaignDetails>('campaigndetails'),
        BaseCrudService.getAll<Donations>('donations'),
      ]);

      setCampaigns(campaignRes.items || []);
      setDonations(donationsRes.items || []);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load data';
      setUI(prev => ({ 
        ...prev, 
        error: `Failed to load campaigns: ${errorMsg}` 
      }));
      console.error('Error loading data:', error);
    } finally {
      setUI(prev => ({ ...prev, loading: false }));
    }
  };

  const handleGoLive = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!goLiveForm.campaignTitle || !goLiveForm.fundraisingGoal || 
        !goLiveForm.campaignStartDate || !goLiveForm.campaignEndDate) {
      setUI(prev => ({ 
        ...prev, 
        error: 'Campaign title, fundraising goal, and dates are required' 
      }));
      return;
    }

    try {
      setUI(prev => ({ ...prev, saving: true, error: null }));

      const campaignData: CampaignDetails = {
        _id: ui.editingCampaignId || crypto.randomUUID(),
        campaignTitle: goLiveForm.campaignTitle,
        fundraisingGoal: parseFloat(goLiveForm.fundraisingGoal),
        bonusGoal: goLiveForm.bonusGoal ? parseFloat(goLiveForm.bonusGoal) : 0,
        bonusGoalDescription: goLiveForm.bonusGoalDescription || '',
        projectDescription: goLiveForm.projectDescription || '',
        promotionalText: goLiveForm.promotionalText || '',
        mainCampaignImage: goLiveForm.mainCampaignImage || '',
        campaignStartDate: new Date(goLiveForm.campaignStartDate).toISOString(),
        campaignEndDate: new Date(goLiveForm.campaignEndDate).toISOString(),
        status: 'live',
      };

      if (ui.editingCampaignId) {
        await BaseCrudService.update('campaigndetails', campaignData);
        setUI(prev => ({ 
          ...prev, 
          successMessage: 'Campaign updated and is now live!' 
        }));
      } else {
        await BaseCrudService.create('campaigndetails', campaignData);
        setUI(prev => ({ 
          ...prev, 
          successMessage: 'Campaign created and is now live!' 
        }));
      }

      resetGoLiveForm();
      
      setTimeout(() => {
        setUI(prev => ({ ...prev, successMessage: null }));
      }, 3000);

      await loadData();
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

  const handleEditCampaign = (campaign: CampaignDetails) => {
    setGoLiveForm({
      campaignTitle: campaign.campaignTitle || '',
      fundraisingGoal: campaign.fundraisingGoal?.toString() || '',
      bonusGoal: campaign.bonusGoal?.toString() || '',
      bonusGoalDescription: campaign.bonusGoalDescription || '',
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
    setUI(prev => ({ 
      ...prev, 
      showGoLiveForm: true, 
      editingCampaignId: campaign._id,
      error: null 
    }));
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      setUI(prev => ({ ...prev, error: null }));
      await BaseCrudService.delete('campaigndetails', campaignId);
      setUI(prev => ({ 
        ...prev, 
        successMessage: 'Campaign deleted successfully!' 
      }));
      
      setTimeout(() => {
        setUI(prev => ({ ...prev, successMessage: null }));
      }, 3000);

      await loadData();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error deleting campaign';
      setUI(prev => ({ 
        ...prev, 
        error: `Failed to delete campaign: ${errorMsg}` 
      }));
      console.error('Error deleting campaign:', error);
    }
  };

  const resetGoLiveForm = () => {
    setGoLiveForm({
      campaignTitle: '',
      fundraisingGoal: '',
      bonusGoal: '',
      bonusGoalDescription: '',
      projectDescription: '',
      promotionalText: '',
      mainCampaignImage: '',
      campaignStartDate: '',
      campaignEndDate: '',
    });
    setUI(prev => ({ 
      ...prev, 
      showGoLiveForm: false, 
      editingCampaignId: null,
      error: null 
    }));
  };

  const getCampaignStats = (campaign: CampaignDetails) => {
    const campaignDonations = donations.filter(d => d.status === 'completed');
    const totalRaised = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const progress = campaign.fundraisingGoal 
      ? Math.min((totalRaised / campaign.fundraisingGoal) * 100, 100)
      : 0;
    return { totalRaised, progress, donorCount: campaignDonations.length };
  };

  const isCampaignLive = (campaign: CampaignDetails) => {
    if (!campaign.campaignStartDate || !campaign.campaignEndDate) return false;
    const now = new Date();
    const start = new Date(campaign.campaignStartDate);
    const end = new Date(campaign.campaignEndDate);
    return now >= start && now <= end;
  };

  if (ui.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="font-heading text-lg text-blue-900">Loading campaigns...</p>
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
              <h1 className="font-heading text-4xl font-bold">Manage Campaigns</h1>
              <p className="font-paragraph text-base text-blue-100 mt-2">
                Create and manage multiple crowdfunding campaigns
              </p>
            </div>
            <Link to="/admin">
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

        {/* Action Button */}
        <div className="mb-12">
          <Button
            onClick={() => {
              if (ui.showGoLiveForm) {
                resetGoLiveForm();
              } else {
                setUI(prev => ({ ...prev, showGoLiveForm: true }));
              }
            }}
            className={`rounded-lg px-8 py-3 font-semibold flex items-center gap-2 transition-colors ${
              ui.showGoLiveForm
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Zap className="w-5 h-5" />
            {ui.showGoLiveForm ? 'Cancel' : '+ Create & Go Live'}
          </Button>
        </div>

        {/* Go Live Form */}
        {ui.showGoLiveForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-12 p-8 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg shadow-lg"
          >
            <h2 className="font-heading text-3xl font-bold text-green-900 mb-8 flex items-center gap-2">
              <Zap className="w-8 h-8" />
              {ui.editingCampaignId ? 'Edit Campaign' : 'Create & Go Live'}
            </h2>

            <form onSubmit={handleGoLive} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-paragraph text-sm font-semibold text-green-900">
                    Campaign Title *
                  </label>
                  <Input
                    type="text"
                    value={goLiveForm.campaignTitle}
                    onChange={(e) => setGoLiveForm(prev => ({ ...prev, campaignTitle: e.target.value }))}
                    placeholder="e.g., Building Our Future"
                    className="border-green-300 focus:border-green-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-paragraph text-sm font-semibold text-green-900">
                    Fundraising Goal (£) *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={goLiveForm.fundraisingGoal}
                    onChange={(e) => setGoLiveForm(prev => ({ ...prev, fundraisingGoal: e.target.value }))}
                    placeholder="e.g., 500000"
                    className="border-green-300 focus:border-green-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-paragraph text-sm font-semibold text-green-900">
                    Bonus Goal (£)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={goLiveForm.bonusGoal}
                    onChange={(e) => setGoLiveForm(prev => ({ ...prev, bonusGoal: e.target.value }))}
                    placeholder="e.g., 750000"
                    className="border-green-300 focus:border-green-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-paragraph text-sm font-semibold text-green-900">
                    Bonus Goal Description
                  </label>
                  <Input
                    type="text"
                    value={goLiveForm.bonusGoalDescription}
                    onChange={(e) => setGoLiveForm(prev => ({ ...prev, bonusGoalDescription: e.target.value }))}
                    placeholder="e.g., Unlock additional features"
                    className="border-green-300 focus:border-green-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-paragraph text-sm font-semibold text-green-900">
                  Project Description
                </label>
                <Textarea
                  value={goLiveForm.projectDescription}
                  onChange={(e) => setGoLiveForm(prev => ({ ...prev, projectDescription: e.target.value }))}
                  placeholder="Detailed description of the project..."
                  className="border-green-300 focus:border-green-600 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="font-paragraph text-sm font-semibold text-green-900">
                  Promotional Text
                </label>
                <Textarea
                  value={goLiveForm.promotionalText}
                  onChange={(e) => setGoLiveForm(prev => ({ ...prev, promotionalText: e.target.value }))}
                  placeholder="A compelling message to inspire donations..."
                  className="border-green-300 focus:border-green-600 min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <label className="font-paragraph text-sm font-semibold text-green-900">
                  Main Campaign Image URL
                </label>
                <Input
                  type="text"
                  value={goLiveForm.mainCampaignImage}
                  onChange={(e) => setGoLiveForm(prev => ({ ...prev, mainCampaignImage: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="border-green-300 focus:border-green-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-paragraph text-sm font-semibold text-green-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Campaign Start Date *
                  </label>
                  <Input
                    type="date"
                    value={goLiveForm.campaignStartDate}
                    onChange={(e) => setGoLiveForm(prev => ({ ...prev, campaignStartDate: e.target.value }))}
                    className="border-green-300 focus:border-green-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-paragraph text-sm font-semibold text-green-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Campaign End Date *
                  </label>
                  <Input
                    type="date"
                    value={goLiveForm.campaignEndDate}
                    onChange={(e) => setGoLiveForm(prev => ({ ...prev, campaignEndDate: e.target.value }))}
                    className="border-green-300 focus:border-green-600"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={ui.saving}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 rounded-lg px-8 py-3 font-semibold shadow-lg"
                >
                  {ui.saving ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      {ui.editingCampaignId ? 'Update Campaign' : 'Create & Go Live'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={resetGoLiveForm}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-lg px-8 py-3 font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Campaigns List */}
        <div>
          <h2 className="font-heading text-3xl font-bold text-blue-900 mb-8">
            All Campaigns ({campaigns.length})
          </h2>

          {campaigns.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white rounded-lg border-2 border-blue-200"
            >
              <AlertCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="font-heading text-2xl font-bold text-blue-900 mb-2">No Campaigns Yet</h3>
              <p className="font-paragraph text-lg text-blue-700 mb-6">
                Create your first campaign by clicking the "Create & Go Live" button above.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {campaigns.map((campaign, index) => {
                const stats = getCampaignStats(campaign);
                const isLive = isCampaignLive(campaign);

                return (
                  <motion.div
                    key={campaign._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`rounded-lg overflow-hidden shadow-lg border-2 ${
                      isLive ? 'border-green-300 bg-white' : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    {/* Campaign Image */}
                    {campaign.mainCampaignImage && (
                      <div className="relative h-48 overflow-hidden bg-blue-100">
                        <Image
                          src={campaign.mainCampaignImage}
                          alt={campaign.campaignTitle || 'Campaign'}
                          className="w-full h-full object-cover"
                          width={600}
                        />
                        {isLive && (
                          <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
                            LIVE
                          </div>
                        )}
                      </div>
                    )}

                    {/* Campaign Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-heading text-2xl font-bold text-blue-900 mb-1">
                          {campaign.campaignTitle}
                        </h3>
                        <p className="font-paragraph text-sm text-blue-700 line-clamp-2">
                          {campaign.projectDescription}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white rounded-lg p-3 text-center border border-blue-200">
                          <p className="font-paragraph text-xs text-blue-600 uppercase mb-1">Raised</p>
                          <p className="font-heading font-bold text-blue-900">
                            £{stats.totalRaised.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center border border-blue-200">
                          <p className="font-paragraph text-xs text-blue-600 uppercase mb-1">Goal</p>
                          <p className="font-heading font-bold text-blue-900">
                            £{campaign.fundraisingGoal?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center border border-blue-200">
                          <p className="font-paragraph text-xs text-blue-600 uppercase mb-1">Donors</p>
                          <p className="font-heading font-bold text-blue-900">
                            {stats.donorCount}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-paragraph text-sm text-blue-700">Progress</span>
                          <span className="font-heading font-bold text-blue-900">
                            {stats.progress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.progress}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 h-full rounded-full"
                          />
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="font-paragraph text-xs text-blue-600 uppercase mb-2">Campaign Period</p>
                        <div className="flex items-center justify-between">
                          <span className="font-paragraph text-sm text-blue-900">
                            {campaign.campaignStartDate 
                              ? new Date(campaign.campaignStartDate).toLocaleDateString()
                              : 'TBA'}
                          </span>
                          <span className="font-paragraph text-xs text-blue-600">to</span>
                          <span className="font-paragraph text-sm text-blue-900">
                            {campaign.campaignEndDate 
                              ? new Date(campaign.campaignEndDate).toLocaleDateString()
                              : 'TBA'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() => handleEditCampaign(campaign)}
                          variant="outline"
                          className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteCampaign(campaign._id)}
                          variant="outline"
                          className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
