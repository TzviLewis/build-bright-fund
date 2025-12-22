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
      const [campaignRes, donationsRes, teamsRes, matchersRes] = await Promise.all([
        BaseCrudService.getAll<CampaignDetails>('campaigndetails'),
        BaseCrudService.getAll<Donations>('donations'),
        BaseCrudService.getAll<Teams>('teams'),
        BaseCrudService.getAll<Matchers>('matchers'),
      ]);

      const campaignsData = campaignRes.items || [];
      const donationsData = donationsRes.items || [];
      const teamsData = teamsRes.items || [];
      const matchersData = matchersRes.items?.filter(m => m.status === 'active') || [];

      setCampaigns(campaignsData);
      setDonations(donationsData);
      setTeams(teamsData);
      setMatchers(matchersData);

      // Generate AI insights for all campaigns
      const insightsMap = new Map<string, CampaignInsight>();
      campaignsData.forEach(campaign => {
        const insight = aiService.analyzeCampaignPerformance(campaign, donationsData, teamsData);
        insightsMap.set(campaign._id, insight);
      });
      setCampaignInsights(insightsMap);

      // Generate recommendations
      const recs = aiService.generateRecommendations(campaignsData, donationsData);
      setRecommendations(recs);

      // Generate alerts
      const campaignAlerts = aiService.generateAlerts(campaignsData, donationsData);
      setAlerts(campaignAlerts);

      // Get trending campaigns
      const trending = aiService.getTrendingCampaigns(campaignsData, donationsData, 3);
      setTrendingCampaigns(trending);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load campaigns';
      setError(`Failed to load campaigns: ${errorMsg}`);
      console.error('Error loading campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCampaignStats = (campaign: CampaignDetails) => {
    const campaignDonations = donations.filter(d => d.status === 'completed');
    const totalRaised = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const progress = campaign.fundraisingGoal 
      ? Math.min((totalRaised / campaign.fundraisingGoal) * 100, 100)
      : 0;
    return { totalRaised, progress, donorCount: campaignDonations.length };
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = aiService.searchCampaigns(campaigns, query);
      const matchedCampaigns = results.map(result => 
        campaigns.find(c => c._id === result.campaignId)
      ).filter(Boolean) as CampaignDetails[];
      setSearchResults(matchedCampaigns);
    } else {
      setSearchResults([]);
    }
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
    const teamsWithData = teams.map((team) => {
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

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-8">
        <div className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold text-primary mb-4">Error Loading Campaigns</h1>
          <p className="font-paragraph text-lg text-primary/70 mb-6">{error}</p>
          <Button 
            onClick={loadData}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-8 py-3"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-primary/10 shadow-sm sticky top-0 z-50">
        <div className="max-w-[120rem] mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-heading text-3xl font-bold text-primary">Active Campaigns</h1>
              <p className="font-paragraph text-sm text-primary/60 mt-1">
                Discover meaningful causes to support
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/home">
                <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-6 py-2 font-semibold">
                  Main Campaign
                </Button>
              </Link>
              <Link to="/admin-login">
                <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 rounded-full px-6 py-2 font-semibold">
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-[120rem] mx-auto px-8 py-16">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex gap-2 flex-wrap"
        >
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'campaigns'
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-white border border-primary/20 text-primary hover:border-secondary'
            }`}
          >
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'comparison'
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-white border border-primary/20 text-primary hover:border-secondary'
            }`}
          >
            Compare
          </button>
          <button
            onClick={() => setActiveTab('leaderboards')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'leaderboards'
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-white border border-primary/20 text-primary hover:border-secondary'
            }`}
          >
            Leaderboards
          </button>
          <button
            onClick={() => {
              setActiveTab('impact');
              if (campaigns.length > 0) setSelectedCampaignForImpact(campaigns[0]);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'impact'
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-white border border-primary/20 text-primary hover:border-secondary'
            }`}
          >
            Impact
          </button>
        </motion.div>

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <>
            {/* AI-Powered Search Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <div className="relative">
                <div className="flex items-center gap-3 bg-white rounded-lg border border-secondary/30 px-4 py-3 shadow-md hover:shadow-lg transition-shadow">
                  <Search className="w-5 h-5 text-secondary" />
                  <input
                    type="text"
                    placeholder="Search campaigns by title, description, or goal..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="flex-1 outline-none font-paragraph text-primary placeholder-primary/40"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearch('')}
                      className="text-primary/60 hover:text-primary transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
            
                {/* Search Results */}
                {searchQuery && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-secondary/20 shadow-lg z-20 max-h-96 overflow-y-auto"
                  >
                    {searchResults.map((campaign) => (
                      <Link
                        key={campaign._id}
                        to={`/?campaign=${campaign._id}`}
                        className="block px-4 py-3 hover:bg-secondary/5 border-b border-primary/10 last:border-b-0 transition-colors"
                      >
                        <p className="font-heading font-semibold text-primary">{campaign.campaignTitle}</p>
                        <p className="font-paragraph text-sm text-primary/60 line-clamp-1">{campaign.projectDescription}</p>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Advanced Filters Toggle */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-primary/20 rounded-lg hover:border-secondary transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Advanced Filters
                </button>
              </div>

              {/* Advanced Filters Panel */}
              {showAdvancedFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <AdvancedFilters onClose={() => setShowAdvancedFilters(false)} />
                </motion.div>
              )}
            </motion.div>

            {/* AI Alerts Section */}
            {alerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-16"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-secondary" />
                  <h3 className="font-heading text-lg font-bold text-primary">Smart Alerts</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {alerts.slice(0, 6).map((alert, index) => (
                    <motion.div
                      key={`${alert.campaignId}-${alert.type}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`rounded-lg p-4 border-l-4 ${
                        alert.priority === 'high'
                          ? 'bg-red-50 border-red-500'
                          : alert.priority === 'medium'
                          ? 'bg-yellow-50 border-yellow-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <p className="font-paragraph text-sm text-primary font-semibold">{alert.message}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Trending Campaigns Section */}
            {trendingCampaigns.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-20"
              >
                <div className="flex items-center gap-2 mb-8">
                  <TrendingUpIcon className="w-5 h-5 text-secondary" />
                  <h2 className="font-heading text-3xl font-bold text-primary">Trending <span className="text-secondary italic">Now</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {trendingCampaigns.map((campaign, index) => {
                    const stats = getCampaignStats(campaign);
                    return (
                      <motion.div
                        key={campaign._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg overflow-hidden border border-secondary/30 hover:border-secondary/60 transition-all shadow-md hover:shadow-lg"
                      >
                        {campaign.mainCampaignImage && (
                          <div className="h-40 overflow-hidden">
                            <Image
                              src={campaign.mainCampaignImage}
                              alt={campaign.campaignTitle || 'Campaign'}
                              className="w-full h-full object-cover"
                              width={400}
                            />
                          </div>
                        )}

                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* AI Recommendations Section */}
            {recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-20"
              >
                <div className="flex items-center gap-2 mb-8">
                  <Brain className="w-5 h-5 text-secondary" />
                  <h2 className="font-heading text-3xl font-bold text-primary">AI <span className="text-secondary italic">Recommendations</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.slice(0, 4).map((rec, index) => (
                    <motion.div
                      key={rec.campaignId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg p-6 border border-primary/10 hover:border-secondary/30 transition-all shadow-md hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-heading text-xl font-bold text-primary flex-1">{rec.campaignTitle}</h3>
                        <div className="bg-secondary/20 rounded-full px-3 py-1 ml-2">
                          <span className="font-heading text-sm font-bold text-secondary">{rec.matchPercentage.toFixed(0)}%</span>
                        </div>
                      </div>
                      <p className="font-paragraph text-sm text-primary/70 mb-4">{rec.reason}</p>
                      <Link to={`/?campaign=${rec.campaignId}`}>
                        <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg py-2 font-semibold text-sm">
                          View Campaign
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20"
            >
              <div className="bg-white rounded-lg p-6 border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-paragraph text-sm text-primary/60 uppercase tracking-wider">Active Campaigns</p>
                    <p className="font-heading text-3xl font-bold text-primary mt-2">{liveCampaigns.length}</p>
                  </div>
                  <Zap className="w-10 h-10 text-secondary/30" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-paragraph text-sm text-primary/60 uppercase tracking-wider">Total Raised</p>
                    <p className="font-heading text-3xl font-bold text-secondary mt-2">
                      £{donations.filter(d => d.status === 'completed').reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-10 h-10 text-secondary/30" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-paragraph text-sm text-primary/60 uppercase tracking-wider">Donors</p>
                    <p className="font-heading text-3xl font-bold text-primary mt-2">{donations.length}</p>
                  </div>
                  <Heart className="w-10 h-10 text-secondary/30" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-paragraph text-sm text-primary/60 uppercase tracking-wider">Teams</p>
                    <p className="font-heading text-3xl font-bold text-primary mt-2">{teams.length}</p>
                  </div>
                  <Users className="w-10 h-10 text-secondary/30" />
                </div>
              </div>
            </motion.div>

            {/* Live Campaigns Section */}
            {liveCampaigns.length > 0 ? (
              <section className="mb-20">
                <div className="mb-12">
                  <div className="inline-block mb-4 px-4 py-2 bg-secondary/20 rounded-full">
                    <p className="font-heading text-sm font-bold text-secondary uppercase tracking-wider">🔴 Live Now</p>
                  </div>
                  <h2 className="font-heading text-4xl font-bold text-primary">
                    Featured <span className="text-secondary italic">Campaigns</span>
                  </h2>
                  <p className="font-paragraph text-lg text-primary/70 mt-2">
                    {liveCampaigns.length} campaign{liveCampaigns.length !== 1 ? 's' : ''} currently accepting donations
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {liveCampaigns.map((campaign, index) => {
                    const stats = getCampaignStats(campaign);
                    return (
                      <motion.div
                        key={campaign._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-secondary/20 group"
                      >
                        {/* Campaign Image */}
                        {campaign.mainCampaignImage && (
                          <div className="relative h-64 overflow-hidden bg-primary/5">
                            <Image
                              src={campaign.mainCampaignImage}
                              alt={campaign.campaignTitle || 'Campaign'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              width={600}
                            />
                            <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                              LIVE
                            </div>
                          </div>
                        )}

                        {/* Campaign Content */}
                        <div className="p-8 space-y-6">
                          <div>
                            <h3 className="font-heading text-3xl font-bold text-primary mb-2">
                              {campaign.campaignTitle}
                            </h3>
                            <p className="font-paragraph text-primary/70 line-clamp-2">
                              {campaign.projectDescription}
                            </p>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-primary/5 rounded-lg p-4 text-center border border-primary/10">
                              <p className="font-paragraph text-xs text-primary/60 uppercase tracking-wider mb-1">Raised</p>
                              <p className="font-heading text-2xl font-bold text-secondary">
                                £{stats.totalRaised.toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-primary/5 rounded-lg p-4 text-center border border-primary/10">
                              <p className="font-paragraph text-xs text-primary/60 uppercase tracking-wider mb-1">Goal</p>
                              <p className="font-heading text-2xl font-bold text-primary">
                                £{campaign.fundraisingGoal?.toLocaleString() || '0'}
                              </p>
                            </div>
                            <div className="bg-primary/5 rounded-lg p-4 text-center border border-primary/10">
                              <p className="font-paragraph text-xs text-primary/60 uppercase tracking-wider mb-1">Donors</p>
                              <p className="font-heading text-2xl font-bold text-primary">
                                {stats.donorCount}
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-paragraph text-sm text-primary/70">Progress</span>
                              <span className="font-heading text-lg font-bold text-secondary">
                                {stats.progress.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-primary/10 rounded-full h-3 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.progress}%` }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                className="bg-gradient-to-r from-secondary to-secondary/80 h-full rounded-full"
                              />
                            </div>
                          </div>

                          {/* CTA Button */}
                          <Link to={`/?campaign=${campaign._id}`}>
                            <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg py-3 font-semibold flex items-center justify-center gap-2 transition-all">
                              Support This Campaign
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            ) : (
              <section className="mb-20">
                <div className="text-center py-16 bg-white rounded-lg border border-primary/10">
                  <AlertCircle className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                  <h2 className="font-heading text-3xl font-bold text-primary mb-2">No Live Campaigns</h2>
                  <p className="font-paragraph text-lg text-primary/60">
                    Check back soon for exciting new campaigns!
                  </p>
                </div>
              </section>
            )}

            {/* Ended Campaigns Section */}
            {endedCampaigns.length > 0 && (
              <section className="mb-20">
                <div className="mb-12">
                  <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
                    <p className="font-heading text-sm font-bold text-primary uppercase tracking-wider">✓ Recently Ended</p>
                  </div>
                  <h2 className="font-heading text-4xl font-bold text-primary">
                    Recently Completed <span className="text-secondary italic">Campaigns</span>
                  </h2>
                  <p className="font-paragraph text-lg text-primary/70 mt-2">
                    {endedCampaigns.length} campaign{endedCampaigns.length !== 1 ? 's' : ''} completed in the last 2 weeks
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all border border-primary/10 group"
                      >
                        {/* Campaign Image */}
                        {campaign.mainCampaignImage && (
                          <div className="relative h-64 overflow-hidden bg-primary/5">
                            <Image
                              src={campaign.mainCampaignImage}
                              alt={campaign.campaignTitle || 'Campaign'}
                              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                              width={600}
                            />
                            <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                              COMPLETED
                            </div>
                          </div>
                        )}

                        {/* Campaign Content */}
                        <div className="p-8 space-y-6">
                          <div>
                            <h3 className="font-heading text-3xl font-bold text-primary mb-2">
                              {campaign.campaignTitle}
                            </h3>
                            <p className="font-paragraph text-primary/70 line-clamp-2">
                              {campaign.projectDescription}
                            </p>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-primary/5 rounded-lg p-4 text-center border border-primary/10">
                              <p className="font-paragraph text-xs text-primary/60 uppercase tracking-wider mb-1">Raised</p>
                              <p className="font-heading text-2xl font-bold text-secondary">
                                £{stats.totalRaised.toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-primary/5 rounded-lg p-4 text-center border border-primary/10">
                              <p className="font-paragraph text-xs text-primary/60 uppercase tracking-wider mb-1">Goal</p>
                              <p className="font-heading text-2xl font-bold text-primary">
                                £{campaign.fundraisingGoal?.toLocaleString() || '0'}
                              </p>
                            </div>
                            <div className="bg-primary/5 rounded-lg p-4 text-center border border-primary/10">
                              <p className="font-paragraph text-xs text-primary/60 uppercase tracking-wider mb-1">Donors</p>
                              <p className="font-heading text-2xl font-bold text-primary">
                                {stats.donorCount}
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-paragraph text-sm text-primary/70">Final Progress</span>
                              <span className="font-heading text-lg font-bold text-primary">
                                {stats.progress.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-primary/10 rounded-full h-3 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.progress}%` }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full"
                              />
                            </div>
                          </div>

                          {/* End Date */}
                          <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                            <p className="font-paragraph text-xs text-primary/60 uppercase tracking-wider mb-1">Campaign Ended</p>
                            <p className="font-heading text-lg font-bold text-primary">{endDate}</p>
                          </div>

                          {/* View Details Button */}
                          <Link to={`/campaign/${campaign._id}`}>
                            <Button className="w-full bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/90 hover:to-secondary/70 rounded-lg py-3 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
                              View Campaign Details
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
              <section className="mb-20">
                <div className="mb-12">
                  <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
                    <p className="font-heading text-sm font-bold text-primary uppercase tracking-wider">📋 Coming Soon</p>
                  </div>
                  <h2 className="font-heading text-4xl font-bold text-primary">
                    Upcoming <span className="text-secondary italic">Campaigns</span>
                  </h2>
                  <p className="font-paragraph text-lg text-primary/70 mt-2">
                    {draftCampaigns.length} campaign{draftCampaigns.length !== 1 ? 's' : ''} launching soon
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {draftCampaigns.map((campaign, index) => {
                    const stats = getCampaignStats(campaign);
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
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all border border-primary/10"
                      >
                        {/* Campaign Image */}
                        {campaign.mainCampaignImage && (
                          <div className="relative h-48 overflow-hidden bg-primary/5">
                            <Image
                              src={campaign.mainCampaignImage}
                              alt={campaign.campaignTitle || 'Campaign'}
                              className="w-full h-full object-cover opacity-75"
                              width={400}
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <div className="text-center">
                                <Calendar className="w-8 h-8 text-white mx-auto mb-2" />
                                <p className="font-heading text-white font-bold">Coming {startDate}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Campaign Content */}
                        <div className="p-6 space-y-4">
                          <div>
                            <h3 className="font-heading text-xl font-bold text-primary mb-1">
                              {campaign.campaignTitle}
                            </h3>
                            <p className="font-paragraph text-sm text-primary/70 line-clamp-2">
                              {campaign.projectDescription}
                            </p>
                          </div>

                          {/* Goal Info */}
                          <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-secondary" />
                                <span className="font-paragraph text-sm text-primary/70">Goal:</span>
                              </div>
                              <span className="font-heading font-bold text-primary">
                                £{campaign.fundraisingGoal?.toLocaleString() || '0'}
                              </span>
                            </div>
                          </div>

                          {/* Notify Button */}
                          <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg py-2 font-semibold">
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
            {campaigns.length > 0 && campaigns[0]?.campaignEndDate && (
              <section className="mb-20">
                <div className="text-center mb-12">
                  <h2 className="font-heading text-4xl font-bold text-primary mb-4">
                    Time is <span className="text-secondary italic">Running Out</span>
                  </h2>
                </div>
                <div className="flex justify-center">
                  <CircularCountdownTimer endDate={campaigns[0].campaignEndDate} startDate={campaigns[0].campaignStartDate} />
                </div>
              </section>
            )}

            {/* Matchers Section */}
            <section className="mb-20">
              <div className="text-center mb-12">
                <h2 className="font-heading text-4xl font-bold text-primary mb-4">
                  Generous <span className="text-secondary italic">Matchers</span>
                </h2>
              </div>

              {matchers.length === 0 ? (
                <p className="font-paragraph text-lg text-primary/60 text-center py-8">
                  No matchers available yet. Check back soon!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {matchers.map((matcher) => (
                    <motion.div
                      key={matcher._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4 }}
                      className="bg-white rounded-lg p-8 shadow-lg border border-secondary/20 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-heading text-2xl font-bold text-primary">
                            {matcher.matcherName}
                          </h3>
                        </div>
                      </div>
                      {matcher.matchingAmount && (
                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                          <p className="font-paragraph text-sm text-primary/60 uppercase tracking-wider mb-1">Matching Amount</p>
                          <p className="font-heading text-2xl font-bold text-secondary">
                            £{matcher.matchingAmount.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {matcher.matchingPercentage && (
                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                          <p className="font-paragraph text-sm text-primary/60 uppercase tracking-wider mb-1">Matching Percentage</p>
                          <p className="font-heading text-2xl font-bold text-secondary">
                            {matcher.matchingPercentage}%
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Teams Section */}
            <section className="mb-20">
              <div className="mb-12">
                <h2 className="font-heading text-4xl font-bold text-primary mb-8">
                  Fundraising <span className="text-secondary italic">Teams</span>
                </h2>

                {/* Team Filter */}
                <div className="relative mb-8">
                  <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="w-full px-4 py-3 bg-white border border-primary/20 rounded-lg font-paragraph font-semibold text-primary flex items-center justify-between hover:border-secondary transition-colors"
                  >
                    <span>{getFilterLabel()}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showFilterMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-primary/20 rounded-lg shadow-lg z-10 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          setTeamSortFilter('highest');
                          setShowFilterMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left font-paragraph font-semibold transition-colors ${
                          teamSortFilter === 'highest'
                            ? 'bg-secondary/10 text-secondary border-l-4 border-secondary'
                            : 'text-primary hover:bg-primary/5'
                        }`}
                      >
                        Highest Raised
                      </button>
                      <button
                        onClick={() => {
                          setTeamSortFilter('lowest');
                          setShowFilterMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left font-paragraph font-semibold transition-colors border-t border-primary/10 ${
                          teamSortFilter === 'lowest'
                            ? 'bg-secondary/10 text-secondary border-l-4 border-secondary'
                            : 'text-primary hover:bg-primary/5'
                        }`}
                      >
                        Lowest Raised
                      </button>
                      <button
                        onClick={() => {
                          setTeamSortFilter('name');
                          setShowFilterMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left font-paragraph font-semibold transition-colors border-t border-primary/10 ${
                          teamSortFilter === 'name'
                            ? 'bg-secondary/10 text-secondary border-l-4 border-secondary'
                            : 'text-primary hover:bg-primary/5'
                        }`}
                      >
                        By Name
                      </button>
                      <button
                        onClick={() => {
                          setTeamSortFilter('progress');
                          setShowFilterMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left font-paragraph font-semibold transition-colors border-t border-primary/10 ${
                          teamSortFilter === 'progress'
                            ? 'bg-secondary/10 text-secondary border-l-4 border-secondary'
                            : 'text-primary hover:bg-primary/5'
                        }`}
                      >
                        By Progress
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>

              {teams.length === 0 ? (
                <p className="font-paragraph text-lg text-primary/60 text-center py-8">
                  No teams yet. Be the first to create one!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {getSortedTeams().map(({ team, teamTotal, teamProgress }) => (
                    <motion.div
                      key={team._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className="bg-white rounded-lg p-8 space-y-6 border border-primary/10 hover:border-secondary/30 transition-colors cursor-pointer shadow-lg"
                    >
                      {team.teamLogo && (
                        <div className="w-full h-40 rounded-lg overflow-hidden bg-primary/5">
                          <Image 
                            src={team.teamLogo}
                            alt={team.teamName || 'Team logo'}
                            className="w-full h-full object-cover"
                            width={400}
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-heading text-3xl font-bold text-primary">
                          {team.teamName}
                        </h3>
                        {team.teamDescription && (
                          <p className="font-paragraph text-primary/70 mt-2 line-clamp-2">
                            {team.teamDescription}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                          <p className="font-paragraph text-sm text-primary/60 uppercase tracking-wider mb-1">Raised</p>
                          <p className="font-heading text-2xl font-bold text-secondary">
                            £{teamTotal.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                          <p className="font-paragraph text-sm text-primary/60 uppercase tracking-wider mb-1">Members</p>
                          <p className="font-heading text-2xl font-bold text-primary">
                            {team.memberCount || 0}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="font-paragraph text-sm text-primary/70">Goal</span>
                          <span className="font-heading text-lg font-bold text-primary">
                            £{team.fundraisingGoal?.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-primary/10 rounded-full h-4 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${teamProgress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="bg-gradient-to-r from-secondary to-secondary/80 h-full rounded-full"
                          />
                        </div>
                        <p className="font-paragraph text-sm text-primary/70 text-right">
                          {teamProgress.toFixed(1)}% complete
                        </p>
                      </div>
                      <Link to={`/team/${team._id}`}>
                        <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg py-3 font-semibold">
                          View Team Details
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* No Campaigns */}
            {campaigns.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <AlertCircle className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                <h2 className="font-heading text-3xl font-bold text-primary mb-2">No Campaigns Yet</h2>
                <p className="font-paragraph text-lg text-primary/60 mb-8">
                  Check back soon for exciting new campaigns!
                </p>
                <Link to="/admin-login">
                  <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-8 py-3 font-semibold">
                    Admin Dashboard
                  </Button>
                </Link>
              </motion.div>
            )}
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
      <footer className="bg-primary text-primary-foreground py-12 border-t border-primary/20 mt-20">
        <div className="max-w-[120rem] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
            <div className="space-y-4">
              <h3 className="font-heading text-2xl font-bold">Crowdfunding Platform</h3>
              <p className="font-paragraph text-primary-foreground/80">
                Supporting meaningful causes through community fundraising.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-heading text-xl font-bold">Quick Links</h4>
              <nav className="flex flex-col gap-2">
                <Link to="/" className="font-paragraph text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Campaigns
                </Link>
                <Link to="/home" className="font-paragraph text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Original Home
                </Link>
                <Link to="/gallery" className="font-paragraph text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Gallery
                </Link>
              </nav>
            </div>

            <div className="space-y-4">
              <h4 className="font-heading text-xl font-bold">Support</h4>
              <p className="font-paragraph text-primary-foreground/80">
                Have questions? Contact us for more information about our campaigns.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-primary-foreground/20 text-center">
            <p className="font-paragraph text-sm text-primary-foreground/70">
              © {new Date().getFullYear()} Crowdfunding Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
