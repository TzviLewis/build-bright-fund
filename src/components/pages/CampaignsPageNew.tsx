import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails, Donations, Teams, Matchers } from '@/entities';
import { ArrowRight, Calendar, DollarSign, Users, TrendingUp, AlertCircle, Loader2, ChevronDown, Zap, Target, Heart, Sparkles, TrendingUpIcon, Brain, Bell, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import CircularCountdownTimer from '@/components/CircularCountdownTimer';
import { aiService, type CampaignInsight, type CampaignAlert, type CampaignRecommendation } from '@/services/aiService';
import AdvancedFilters from '@/components/AdvancedFilters';
import DonationCalculator from '@/components/DonationCalculator';
import CampaignComparisonTool from '@/components/CampaignComparisonTool';
import Leaderboards from '@/components/Leaderboards';
import ImpactTracker from '@/components/ImpactTracker';
import CampaignReviews from '@/components/CampaignReviews';
import LiveChat from '@/components/LiveChat';
import { useFilterStore } from '@/stores/filterStore';
import { useFavoritesStore } from '@/stores/favoritesStore';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignDetails[]>([]);
  const [donations, setDonations] = useState<Donations[]>([]);
  const [teams, setTeams] = useState<Teams[]>([]);
  const [matchers, setMatchers] = useState<Matchers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [teamSortFilter, setTeamSortFilter] = useState<'highest' | 'lowest' | 'name' | 'progress'>('highest');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'comparison' | 'leaderboards' | 'impact'>('campaigns');
  const [selectedCampaignForImpact, setSelectedCampaignForImpact] = useState<CampaignDetails | null>(null);
  
  // AI-powered features
  const [campaignInsights, setCampaignInsights] = useState<Map<string, CampaignInsight>>(new Map());
  const [recommendations, setRecommendations] = useState<CampaignRecommendation[]>([]);
  const [alerts, setAlerts] = useState<CampaignAlert[]>([]);
  const [trendingCampaigns, setTrendingCampaigns] = useState<CampaignDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CampaignDetails[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Store hooks
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const filterStore = useFilterStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load campaigns with error handling
      let campaignsData: CampaignDetails[] = [];
      let donationsData: Donations[] = [];
      let teamsData: Teams[] = [];
      let matchersData: Matchers[] = [];

      try {
        const campaignRes = await BaseCrudService.getAll<CampaignDetails>('campaigndetails');
        campaignsData = campaignRes?.items || [];
      } catch (campaignErr) {
        console.error('Error loading campaigns:', campaignErr);
        // Continue with empty campaigns array
        campaignsData = [];
      }

      try {
        const donationsRes = await BaseCrudService.getAll<Donations>('donations', [], { limit: 1000 });
        donationsData = donationsRes?.items || [];
      } catch (donationErr) {
        console.error('Error loading donations:', donationErr);
        donationsData = [];
      }

      try {
        const teamsRes = await BaseCrudService.getAll<Teams>('teams');
        teamsData = teamsRes?.items || [];
      } catch (teamsErr) {
        console.error('Error loading teams:', teamsErr);
        teamsData = [];
      }

      try {
        const matchersRes = await BaseCrudService.getAll<Matchers>('matchers');
        matchersData = matchersRes?.items?.filter(m => m.status === 'active') || [];
      } catch (matchersErr) {
        console.error('Error loading matchers:', matchersErr);
        matchersData = [];
      }

      setCampaigns(campaignsData);
      setDonations(donationsData);
      setTeams(teamsData);
      setMatchers(matchersData);

      // Generate AI insights for all campaigns (with error handling)
      try {
        const insightsMap = new Map<string, CampaignInsight>();
        campaignsData.forEach(campaign => {
          const insight = aiService.analyzeCampaignPerformance(campaign, donationsData, teamsData);
          insightsMap.set(campaign._id, insight);
        });
        setCampaignInsights(insightsMap);
      } catch (insightErr) {
        console.error('Error generating insights:', insightErr);
        // Continue without insights
      }

      // Generate recommendations (with error handling)
      try {
        const recs = aiService.generateRecommendations(campaignsData, donationsData);
        setRecommendations(recs);
      } catch (recErr) {
        console.error('Error generating recommendations:', recErr);
        setRecommendations([]);
      }

      // Generate alerts (with error handling)
      try {
        const campaignAlerts = aiService.generateAlerts(campaignsData, donationsData);
        setAlerts(campaignAlerts);
      } catch (alertErr) {
        console.error('Error generating alerts:', alertErr);
        setAlerts([]);
      }

      // Get trending campaigns (with error handling)
      try {
        const trending = aiService.getTrendingCampaigns(campaignsData, donationsData, 3);
        setTrendingCampaigns(trending);
      } catch (trendErr) {
        console.error('Error getting trending campaigns:', trendErr);
        setTrendingCampaigns([]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load campaigns';
      setError(`Failed to load campaigns: ${errorMsg}`);
      console.error('Error loading campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCampaignStats = (campaign: CampaignDetails) => {
    // Include donations to the campaign directly or to any team in the campaign
    const campaignDonations = donations.filter(d => {
      const isTeamDonationInCampaign = d.teamId && teams.some(t => t._id === d.teamId) && d.status === 'completed';
      const isGeneralDonation = !d.teamId && d.status === 'completed';
      return isTeamDonationInCampaign || isGeneralDonation;
    });
    const totalRaised = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const progress = campaign.fundraisingGoal 
      ? Math.min((totalRaised / campaign.fundraisingGoal) * 100, 100)
      : 0;
    return { totalRaised, progress, donorCount: campaignDonations.length };
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    if (query.trim()) {
      const results = aiService.searchCampaigns(campaigns, query);
      const matchedCampaigns = results.map(result => 
        campaigns.find(c => c._id === result.campaignId)
      ).filter(Boolean) as CampaignDetails[];
      setSearchResults(matchedCampaigns);
    } else {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const isCampaignLive = (campaign: CampaignDetails) => {
    if (!campaign.campaignStartDate || !campaign.campaignEndDate) return false;
    const now = new Date();
    const start = new Date(campaign.campaignStartDate);
    const end = new Date(campaign.campaignEndDate);
    return now >= start && now <= end;
  };

  const isCampaignEnded = (campaign: CampaignDetails) => {
    if (!campaign.campaignStartDate || !campaign.campaignEndDate) return false;
    const now = new Date();
    const end = new Date(campaign.campaignEndDate);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    return now > end && end >= twoWeeksAgo;
  };

  // Sort teams based on selected filter
  const getSortedTeams = () => {
    const firstCampaign = campaigns[0];
    if (!firstCampaign) return [];
    
    const teamsWithData = teams
      .map((team) => {
        const teamDonations = donations.filter(d => d.teamId === team._id);
        const teamTotal = teamDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
        const teamProgress = team.fundraisingGoal 
          ? Math.min((teamTotal / team.fundraisingGoal) * 100, 100)
          : 0;
        return { team, teamTotal, teamProgress };
      });

    switch (teamSortFilter) {
      case 'highest':
        return teamsWithData.sort((a, b) => b.teamTotal - a.teamTotal);
      case 'lowest':
        return teamsWithData.sort((a, b) => a.teamTotal - b.teamTotal);
      case 'name':
        return teamsWithData.sort((a, b) => (a.team.teamName || '').localeCompare(b.team.teamName || ''));
      case 'progress':
        return teamsWithData.sort((a, b) => b.teamProgress - a.teamProgress);
      default:
        return teamsWithData;
    }
  };

  const getFilterLabel = () => {
    switch (teamSortFilter) {
      case 'highest':
        return 'Sort: Highest Raised';
      case 'lowest':
        return 'Sort: Lowest Raised';
      case 'name':
        return 'Sort: By Name';
      case 'progress':
        return 'Sort: By Progress';
      default:
        return 'Sort Teams';
    }
  };

  // Apply filters from store
  const getFilteredCampaigns = () => {
    let filtered = campaigns;

    // Search filter
    if (filterStore.searchQuery) {
      filtered = filtered.filter(c =>
        c.campaignTitle?.toLowerCase().includes(filterStore.searchQuery.toLowerCase()) ||
        c.projectDescription?.toLowerCase().includes(filterStore.searchQuery.toLowerCase())
      );
    }

    // Goal range filter
    filtered = filtered.filter(c =>
      (c.fundraisingGoal || 0) >= filterStore.minGoal &&
      (c.fundraisingGoal || 0) <= filterStore.maxGoal
    );

    // Status filter
    if (filterStore.statusFilter.length > 0) {
      filtered = filtered.filter(c => filterStore.statusFilter.includes(c.status || 'Active'));
    }

    // Date range filter
    const now = new Date();
    if (filterStore.dateRange !== 'all') {
      filtered = filtered.filter(c => {
        if (!c.campaignStartDate) return false;
        const startDate = new Date(c.campaignStartDate);
        const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (filterStore.dateRange) {
          case 'thisWeek':
            return daysDiff <= 7;
          case 'thisMonth':
            return daysDiff <= 30;
          case 'thisQuarter':
            return daysDiff <= 90;
          default:
            return true;
        }
      });
    }

    // Sort
    switch (filterStore.sortBy) {
      case 'oldest':
        return filtered.sort((a, b) =>
          new Date(a.campaignStartDate || 0).getTime() -
          new Date(b.campaignStartDate || 0).getTime()
        );
      case 'mostFunded':
        return filtered.sort((a, b) => (b.fundraisingGoal || 0) - (a.fundraisingGoal || 0));
      case 'leastFunded':
        return filtered.sort((a, b) => (a.fundraisingGoal || 0) - (b.fundraisingGoal || 0));
      case 'endingSoon':
        return filtered.sort((a, b) =>
          new Date(a.campaignEndDate || 0).getTime() -
          new Date(b.campaignEndDate || 0).getTime()
        );
      case 'mostPopular':
        return filtered.sort((a, b) => {
          const aDonations = donations.filter(d => d.teamId === a._id).length;
          const bDonations = donations.filter(d => d.teamId === b._id).length;
          return bDonations - aDonations;
        });
      default: // newest
        return filtered.sort((a, b) =>
          new Date(b.campaignStartDate || 0).getTime() -
          new Date(a.campaignStartDate || 0).getTime()
        );
    }
  };

  const filteredCampaigns = getFilteredCampaigns();
  const liveCampaigns = filteredCampaigns.filter(c => isCampaignLive(c));
  const endedCampaigns = filteredCampaigns.filter(c => isCampaignEnded(c));
  const draftCampaigns = filteredCampaigns.filter(c => !isCampaignLive(c) && !isCampaignEnded(c));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="font-heading text-lg text-primary">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  // Note: We don't block access on error - show campaigns if available, with error banner
  // This allows users to see cached/partial data even if there's a loading issue

  return (
    <div className="min-h-screen bg-white">
      {/* Clean Modern Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-heading text-xl font-bold text-primary">
                  FundRise
                </h1>
                <p className="font-paragraph text-xs text-gray-500">
                  Make a difference today
                </p>
              </div>
            </Link>
            <nav className="flex items-center gap-6">
              <Link to="/campaigns" className="font-paragraph text-sm font-medium text-primary hover:text-secondary transition-colors">
                Campaigns
              </Link>
              <Link to="/gallery" className="font-paragraph text-sm font-medium text-primary hover:text-secondary transition-colors">
                Gallery
              </Link>
              <Link to="/admin-login">
                <Button className="bg-secondary text-white hover:bg-secondary/90 rounded-lg px-6 py-2 text-sm font-semibold">
                  Admin
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <div className="max-w-[100rem] mx-auto px-6 py-12">
        {/* Error Banner - Non-blocking */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-paragraph font-semibold text-red-900">Error Loading Data</p>
              <p className="font-paragraph text-sm text-red-800 mt-1">{error}</p>
            </div>
            <Button
              onClick={loadData}
              className="bg-red-600 text-white hover:bg-red-700 rounded-lg px-4 py-2 text-sm font-semibold flex-shrink-0"
            >
              Retry
            </Button>
          </motion.div>
        )}
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex gap-2 border-b border-gray-200"
        >
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'campaigns'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-gray-600 hover:text-secondary'
            }`}
          >
            All Campaigns
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'comparison'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-gray-600 hover:text-secondary'
            }`}
          >
            Compare
          </button>
          <button
            onClick={() => setActiveTab('leaderboards')}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'leaderboards'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-gray-600 hover:text-secondary'
            }`}
          >
            Leaderboards
          </button>
          <button
            onClick={() => {
              setActiveTab('impact');
              if (campaigns.length > 0) setSelectedCampaignForImpact(campaigns[0]);
            }}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'impact'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-gray-600 hover:text-secondary'
            }`}
          >
            Impact
          </button>
        </motion.div>

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <>
            {/* AI Alerts Section */}
            {alerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-secondary" />
                  <h3 className="font-heading text-lg font-bold text-primary">Campaign Alerts</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {alerts.slice(0, 4).map((alert, index) => (
                    <motion.div
                      key={`${alert.campaignId}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.priority === 'high'
                          ? 'bg-red-50 border-red-500'
                          : alert.priority === 'medium'
                          ? 'bg-yellow-50 border-yellow-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <p className="font-paragraph text-sm font-semibold text-primary">{alert.message}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Simple Search Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <div className="relative max-w-2xl mx-auto">
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg border border-gray-300 px-4 py-3">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="flex-1 outline-none font-paragraph text-primary bg-transparent placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearch('')}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
            
                {/* Search Results Dropdown */}
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-20 max-h-96 overflow-y-auto"
                  >
                    {searchResults.length > 0 ? (
                      <div>
                        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 sticky top-0">
                          <p className="font-paragraph text-xs text-blue-700 font-semibold">
                            ✓ Found {searchResults.length} campaign{searchResults.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        {searchResults.map((campaign, index) => (
                          <motion.div
                            key={campaign._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link
                              to={(campaign as any).slug ? `/c/${(campaign as any).slug}` : `/campaign/${campaign._id}`}
                              className="block px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <p className="font-heading font-semibold text-primary">{campaign.campaignTitle}</p>
                              <p className="font-paragraph text-sm text-gray-600 line-clamp-1">{campaign.projectDescription}</p>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <div className="mb-2">
                          <p className="font-paragraph text-sm text-gray-600 font-semibold">No campaigns found</p>
                        </div>
                        <p className="font-paragraph text-xs text-gray-500">
                          Try searching with different keywords like campaign name or description
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Advanced Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <AdvancedFilters
                filters={[
                  {
                    id: 'status',
                    label: 'Campaign Status',
                    type: 'checkbox',
                    options: [
                      { id: 'active', label: 'Active', value: 'Active' },
                      { id: 'completed', label: 'Completed', value: 'Completed' },
                      { id: 'draft', label: 'Draft', value: 'Draft' },
                    ],
                  },
                  {
                    id: 'goalRange',
                    label: 'Fundraising Goal',
                    type: 'range',
                    min: 0,
                    max: 100000,
                    step: 1000,
                  },
                  {
                    id: 'sortBy',
                    label: 'Sort By',
                    type: 'select',
                    options: [
                      { id: 'newest', label: 'Newest First', value: 'newest' },
                      { id: 'oldest', label: 'Oldest First', value: 'oldest' },
                      { id: 'mostFunded', label: 'Highest Goal', value: 'mostFunded' },
                      { id: 'leastFunded', label: 'Lowest Goal', value: 'leastFunded' },
                      { id: 'endingSoon', label: 'Ending Soon', value: 'endingSoon' },
                    ],
                  },
                ]}
                onFiltersChange={(filters) => {
                  if (filters.status) {
                    filterStore.setStatusFilter(filters.status as string[]);
                  }
                  if (filters.goalRange && Array.isArray(filters.goalRange)) {
                    filterStore.setGoalRange(filters.goalRange[0] as number, filters.goalRange[1] as number);
                  }
                  if (filters.sortBy) {
                    filterStore.setSortBy(filters.sortBy as any);
                  }
                }}
                onReset={() => filterStore.resetFilters()}
              />
            </motion.div>

            {/* AI Recommendations */}
            {recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-12"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-secondary" />
                  <h3 className="font-heading text-lg font-bold text-primary">Recommended For You</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendations.slice(0, 3).map((rec, index) => {
                    const campaign = campaigns.find(c => c._id === rec.campaignId);
                    if (!campaign) return null;
                    return (
                      <motion.div
                        key={rec.campaignId}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-heading font-semibold text-primary text-sm">{campaign.campaignTitle}</h4>
                          <span className="text-xs font-bold text-secondary">{rec.matchPercentage}% match</span>
                        </div>
                        <p className="font-paragraph text-xs text-gray-600 mb-3">{rec.reason}</p>
                        <Link to={`/campaign/${campaign._id}`}>
                          <Button className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-lg py-2 text-sm">
                            View Campaign
                          </Button>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Trending Campaigns */}
            {trendingCampaigns.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-12"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-5 h-5 text-secondary" />
                  <h3 className="font-heading text-lg font-bold text-primary">Trending This Week</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {trendingCampaigns.map((campaign, index) => {
                    const stats = getCampaignStats(campaign);
                    return (
                      <motion.div
                        key={campaign._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">🔥</span>
                          <h4 className="font-heading font-semibold text-primary text-sm">{campaign.campaignTitle}</h4>
                        </div>
                        <p className="font-paragraph text-xs text-gray-600 mb-3 line-clamp-2">{campaign.projectDescription}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-heading text-sm font-bold text-secondary">£{stats.totalRaised.toLocaleString()}</span>
                          <Link to={`/campaign/${campaign._id}`}>
                            <Button className="bg-secondary text-white hover:bg-secondary/90 rounded-lg px-3 py-1 text-xs">
                              View
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16"
            >
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-paragraph text-xs text-gray-500 uppercase tracking-wider mb-2">Active Campaigns</p>
                    <p className="font-heading text-4xl font-bold text-primary">{liveCampaigns.length}</p>
                  </div>
                  <Zap className="w-8 h-8 text-secondary/40" />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-paragraph text-xs text-gray-500 uppercase tracking-wider mb-2">Total Raised</p>
                    <p className="font-heading text-4xl font-bold text-secondary">
                      £{donations.filter(d => d.status === 'completed').reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-secondary/40" />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-paragraph text-xs text-gray-500 uppercase tracking-wider mb-2">Donors</p>
                    <p className="font-heading text-4xl font-bold text-primary">{donations.length}</p>
                  </div>
                  <Heart className="w-8 h-8 text-secondary/40" />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-paragraph text-xs text-gray-500 uppercase tracking-wider mb-2">Teams</p>
                    <p className="font-heading text-4xl font-bold text-primary">{teams.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-secondary/40" />
                </div>
              </div>
            </motion.div>
            {/* Live Campaigns Section */}
            {liveCampaigns.length > 0 ? (
              <section className="mb-16">
                <div className="mb-8">
                  <h2 className="font-heading text-3xl font-bold text-primary mb-2">
                    Active Campaigns
                  </h2>
                  <p className="font-paragraph text-gray-600">
                    {liveCampaigns.length} campaign{liveCampaigns.length !== 1 ? 's' : ''} currently accepting donations
                  </p>
                </div>

                <div className="space-y-8">
                  {liveCampaigns.map((campaign, index) => {
                    const stats = getCampaignStats(campaign);
                    return (
                      <motion.div
                        key={campaign._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-200 group"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                          {/* Left: Large Campaign Image */}
                          {campaign.mainCampaignImage && (
                            <div className="lg:col-span-2 relative h-64 lg:h-80 overflow-hidden bg-gray-100">
                              <Image
                                src={campaign.mainCampaignImage}
                                alt={campaign.campaignTitle || 'Campaign'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                width={600}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                              <div className="absolute top-4 right-4 bg-secondary text-white px-4 py-2 rounded-full font-semibold text-xs flex items-center gap-2">
                                <Zap className="w-3 h-3" />
                                LIVE
                              </div>
                            </div>
                          )}

                          {/* Right: Campaign Info & Stats */}
                          <div className="lg:col-span-1 p-6 lg:p-8 flex flex-col justify-between bg-gradient-to-br from-white to-gray-50">
                            {/* Header */}
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-heading text-2xl font-bold text-primary mb-2">
                                  {campaign.campaignTitle}
                                </h3>
                                <p className="font-paragraph text-sm text-gray-600 line-clamp-2">
                                  {campaign.projectDescription}
                                </p>
                              </div>

                              {/* Main Amount Display */}
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="font-paragraph text-xs text-gray-500 uppercase tracking-wider mb-1">Raised so far</p>
                                <p className="font-heading text-4xl font-bold text-secondary">
                                  £{stats.totalRaised.toLocaleString()}
                                </p>
                                <p className="font-paragraph text-xs text-gray-500 mt-2">
                                  of £{campaign.fundraisingGoal?.toLocaleString() || '0'} goal
                                </p>
                              </div>

                              {/* Progress Bar */}
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-paragraph text-xs text-gray-500">Progress</span>
                                  <span className="font-heading text-sm font-bold text-secondary">
                                    {stats.progress.toFixed(0)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats.progress}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="bg-gradient-to-r from-secondary to-secondary/80 h-full rounded-full"
                                  />
                                </div>
                              </div>

                              {/* Stats Grid */}
                              <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                  <p className="font-paragraph text-xs text-gray-500 mb-1">Donors</p>
                                  <p className="font-heading text-lg font-bold text-primary">{stats.donorCount}</p>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                  <p className="font-paragraph text-xs text-gray-500 mb-1">Days Left</p>
                                  <p className="font-heading text-lg font-bold text-primary">
                                    {campaign.campaignEndDate 
                                      ? Math.max(0, Math.ceil((new Date(campaign.campaignEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                                      : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* CTA Button */}
                            <Link to={(campaign as any).slug ? `/c/${(campaign as any).slug}` : `/campaign/${campaign._id}`} className="mt-6">
                              <Button className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-lg py-3 font-semibold flex items-center justify-center gap-2 transition-all">
                                View Campaign
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            ) : (
              <section className="mb-16">
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-paragraph text-gray-500">No active campaigns at the moment</p>
                </div>
              </section>
            )}
            {/* Ended Campaigns Section */}
            {endedCampaigns.length > 0 && (
              <section className="mb-16">
                <div className="mb-8">
                  <h2 className="font-heading text-3xl font-bold text-primary mb-2">
                    Recently Completed
                  </h2>
                  <p className="font-paragraph text-gray-600">
                    {endedCampaigns.length} campaign{endedCampaigns.length !== 1 ? 's' : ''} completed in the last 2 weeks
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {endedCampaigns.map((campaign, index) => {
                    const stats = getCampaignStats(campaign);
                    const endDate = campaign.campaignEndDate 
                      ? new Date(campaign.campaignEndDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })
                      : 'TBA';

                    return (
                      <motion.div
                        key={campaign._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-200"
                      >
                        {/* Campaign Image */}
                        {campaign.mainCampaignImage && (
                          <div className="relative h-48 overflow-hidden bg-gray-100">
                            <Image
                              src={campaign.mainCampaignImage}
                              alt={campaign.campaignTitle || 'Campaign'}
                              className="w-full h-full object-cover opacity-90"
                              width={400}
                            />
                            <div className="absolute top-3 right-3 bg-gray-700 text-white px-3 py-1 rounded-full font-semibold text-xs">
                              COMPLETED
                            </div>
                          </div>
                        )}

                        {/* Campaign Content */}
                        <div className="p-6 space-y-4">
                          <div>
                            <h3 className="font-heading text-xl font-bold text-primary mb-2">
                              {campaign.campaignTitle}
                            </h3>
                            <p className="font-paragraph text-sm text-gray-600 line-clamp-2">
                              {campaign.projectDescription}
                            </p>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-paragraph text-xs text-gray-500">Final Progress</span>
                              <span className="font-heading text-sm font-bold text-primary">
                                {stats.progress.toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.progress}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="bg-primary h-full rounded-full"
                              />
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <div>
                              <p className="font-paragraph text-xs text-gray-500">Raised</p>
                              <p className="font-heading text-lg font-bold text-primary">
                                £{stats.totalRaised.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-paragraph text-xs text-gray-500">Ended</p>
                              <p className="font-heading text-sm font-bold text-gray-700">
                                {endDate}
                              </p>
                            </div>
                          </div>

                          {/* View Details Button */}
                          <Link to={(campaign as any).slug ? `/c/${(campaign as any).slug}` : `/campaign/${campaign._id}`}>
                            <Button className="w-full bg-gray-700 text-white hover:bg-gray-800 rounded-lg py-2.5 font-semibold flex items-center justify-center gap-2">
                              View Details
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}
            {/* Draft Campaigns Section */}
            {draftCampaigns.length > 0 && (
              <section className="mb-16">
                <div className="mb-8">
                  <h2 className="font-heading text-3xl font-bold text-primary mb-2">
                    Coming Soon
                  </h2>
                  <p className="font-paragraph text-gray-600">
                    {draftCampaigns.length} campaign{draftCampaigns.length !== 1 ? 's' : ''} launching soon
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {draftCampaigns.map((campaign, index) => {
                    const startDate = campaign.campaignStartDate 
                      ? new Date(campaign.campaignStartDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })
                      : 'TBA';

                    return (
                      <motion.div
                        key={campaign._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-200"
                      >
                        {/* Campaign Image */}
                        {campaign.mainCampaignImage && (
                          <div className="relative h-48 overflow-hidden bg-gray-100">
                            <Image
                              src={campaign.mainCampaignImage}
                              alt={campaign.campaignTitle || 'Campaign'}
                              className="w-full h-full object-cover opacity-60"
                              width={400}
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="text-center">
                                <Calendar className="w-8 h-8 text-white mx-auto mb-2" />
                                <p className="font-heading text-white font-bold text-sm">Launches {startDate}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Campaign Content */}
                        <div className="p-6 space-y-4">
                          <div>
                            <h3 className="font-heading text-xl font-bold text-primary mb-2">
                              {campaign.campaignTitle}
                            </h3>
                            <p className="font-paragraph text-sm text-gray-600 line-clamp-2">
                              {campaign.projectDescription}
                            </p>
                          </div>

                          {/* Goal Info */}
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-secondary" />
                                <span className="font-paragraph text-sm text-gray-600">Goal:</span>
                              </div>
                              <span className="font-heading font-bold text-primary">
                                £{campaign.fundraisingGoal?.toLocaleString() || '0'}
                              </span>
                            </div>
                          </div>

                          {/* Notify Button */}
                          <Button className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-lg py-2.5 font-semibold">
                            Notify Me
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}
            {/* Countdown Timer Section */}
            {/* Matchers Section */}
            <section className="mb-16">

            </section>
            {/* Teams Section */}
            <section className="mb-16">

            </section>
            {/* No Campaigns */}

          </>
        )}

        {/* Comparison Tab */}
        {activeTab === 'comparison' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CampaignComparisonTool campaigns={campaigns} />
          </motion.div>
        )}

        {/* Leaderboards Tab */}
        {activeTab === 'leaderboards' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Leaderboards campaigns={campaigns} donations={donations} teams={teams} />
          </motion.div>
        )}

        {/* Impact Tab */}
        {activeTab === 'impact' && selectedCampaignForImpact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <select
                value={selectedCampaignForImpact._id}
                onChange={(e) => {
                  const campaign = campaigns.find(c => c._id === e.target.value);
                  if (campaign) setSelectedCampaignForImpact(campaign);
                }}
                className="w-full px-4 py-2 border border-primary/20 rounded-lg font-paragraph text-primary focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {campaigns.map(campaign => (
                  <option key={campaign._id} value={campaign._id}>
                    {campaign.campaignTitle}
                  </option>
                ))}
              </select>
            </div>
            <ImpactTracker campaign={selectedCampaignForImpact} donations={donations} />
          </motion.div>
        )}
      </div>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-[100rem] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-3">
              <h3 className="font-heading text-xl font-bold">FundRise</h3>
              <p className="font-paragraph text-sm text-gray-400">
                Supporting meaningful causes through community fundraising.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-heading text-lg font-bold">Quick Links</h4>
              <nav className="flex flex-col gap-2">
                <Link to="/" className="font-paragraph text-sm text-gray-400 hover:text-white transition-colors">
                  Campaigns
                </Link>
                <Link to="/gallery" className="font-paragraph text-sm text-gray-400 hover:text-white transition-colors">
                  Gallery
                </Link>
                <Link to="/admin-login" className="font-paragraph text-sm text-gray-400 hover:text-white transition-colors">
                  Admin
                </Link>
              </nav>
            </div>

            <div className="space-y-3">
              <h4 className="font-heading text-lg font-bold">Support</h4>
              <p className="font-paragraph text-sm text-gray-400">
                Have questions? Contact us for more information about our campaigns.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-800 text-center">
            <p className="font-paragraph text-sm text-gray-500">
              © {new Date().getFullYear()} FundRise. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
