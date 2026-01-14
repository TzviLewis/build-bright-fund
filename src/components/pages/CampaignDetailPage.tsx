import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails, Donations, Teams, Matchers } from '@/entities';
import { ArrowLeft, AlertCircle, Loader2, Play, Users, TrendingUp, DollarSign, Share2, Copy, CheckCircle, Clock, Target, Zap, BarChart3, Award, Flame, Mail, MessageCircle, QrCode, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { motion } from 'framer-motion';
import VideoPlayer from '@/components/VideoPlayer';
import CircularCountdownTimer from '@/components/CircularCountdownTimer';
import LiveChat from '@/components/LiveChat';
import DonationTiersSelector from '@/components/DonationTiersSelector';

export default function CampaignDetailPage() {
  const { campaignId, campaignSlug } = useParams<{ campaignId?: string; campaignSlug?: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [donations, setDonations] = useState<Donations[]>([]);
  const [teams, setTeams] = useState<Teams[]>([]);
  const [matchers, setMatchers] = useState<Matchers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadCampaign();
  }, [campaignId, campaignSlug]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      setError('');

      let campaignData: CampaignDetails | null = null;
      const identifier = campaignId || campaignSlug;

      if (!identifier) {
        setError('Campaign not found');
        return;
      }

      // Try loading by ID first (if campaignId is provided)
      if (campaignId) {
        try {
          campaignData = await BaseCrudService.getById<CampaignDetails>('campaigndetails', campaignId);
        } catch (err) {
          console.error('Error loading campaign by ID:', err);
          // Try loading all campaigns and finding the one with matching ID
          try {
            const allCampaigns = await BaseCrudService.getAll<CampaignDetails>('campaigndetails');
            campaignData = (allCampaigns.items || []).find(c => c._id === campaignId) || null;
          } catch (fallbackErr) {
            console.error('Fallback campaign loading failed:', fallbackErr);
          }
        }
      }

      // If not found by ID, try loading by slug
      if (!campaignData && campaignSlug) {
        try {
          const allCampaigns = await BaseCrudService.getAll<CampaignDetails>('campaigndetails');
          // First try to match by slug field (if it exists)
          campaignData = (allCampaigns.items || []).find(c => 
            (c as any).slug?.toLowerCase() === campaignSlug.toLowerCase()
          ) || null;
          
          // Fallback: match by slug-like title (convert title to slug format for comparison)
          if (!campaignData) {
            campaignData = (allCampaigns.items || []).find(c => 
              c.campaignTitle?.toLowerCase().replace(/\s+/g, '-') === campaignSlug.toLowerCase()
            ) || null;
          }
        } catch (err) {
          console.error('Error loading campaign by slug:', err);
        }
      }

      if (!campaignData) {
        setError('Campaign not found. The campaign may have been deleted or the URL is invalid.');
        return;
      }

      setCampaign(campaignData);

      // Load related data
      const [donationsRes, teamsRes, matchersRes] = await Promise.all([
        BaseCrudService.getAll<Donations>('donations').catch((err) => {
          console.error('Error loading donations:', err);
          return { items: [] };
        }),
        BaseCrudService.getAll<Teams>('teams').catch((err) => {
          console.error('Error loading teams:', err);
          return { items: [] };
        }),
        BaseCrudService.getAll<Matchers>('matchers').catch((err) => {
          console.error('Error loading matchers:', err);
          return { items: [] };
        }),
      ]);

      const allDonations = donationsRes.items || [];
      const allTeams = teamsRes.items || [];
      const allMatchers = matchersRes.items || [];
      
      console.log('Loaded teams for dropdown:', allTeams.length, allTeams);
      
      setDonations(allDonations);
      setTeams(allTeams);
      setMatchers(allMatchers.filter(m => m.status === 'active'));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load campaign details';
      setError(errorMsg);
      console.error('Campaign loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyField = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = campaign?.campaignTitle || 'Campaign';
    const text = campaign?.projectDescription || '';

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`,
    };

    if (platform === 'native' && navigator.share) {
      navigator.share({
        title,
        text,
        url,
      }).catch(err => console.log('Error sharing:', err));
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto mb-4" />
          <p className="font-paragraph text-lg text-primary">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[120rem] mx-auto px-8 py-8">
          <Button
            onClick={() => navigate('/')}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-6 py-2 font-semibold mb-6 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Campaigns
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'Campaign not found'}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Filter donations for this specific campaign
  const campaignDonations = donations.filter(d => 
    d.status === 'completed'
  );
  
  const totalDonations = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const progressPercentage = campaign.fundraisingGoal
    ? Math.min((totalDonations / campaign.fundraisingGoal) * 100, 100)
    : 0;

  const totalTeamMembers = teams.reduce((sum, t) => sum + (t.memberCount || 0), 0);
  const avgDonation = campaignDonations.length > 0 ? totalDonations / campaignDonations.length : 0;
  const topDonations = [...campaignDonations].sort((a, b) => (b.amount || 0) - (a.amount || 0)).slice(0, 5);
  const totalMatcherAmount = matchers.reduce((sum, m) => sum + (m.matchingAmount || 0), 0);
  const potentialMatched = totalDonations * 0.5; // Assuming 50% match rate for demo

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <header className="bg-white border-b border-primary/10 sticky top-0 z-40 shadow-sm backdrop-blur-sm bg-white/95">
        <div className="max-w-[120rem] mx-auto px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-primary hover:bg-primary/5 rounded-lg px-4 py-2 font-semibold text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Campaigns
            </Button>
            <h1 className="font-heading text-xl lg:text-2xl font-bold text-center flex-1 px-4 truncate text-primary">{campaign?.campaignTitle}</h1>
            <Button
              onClick={() => setShowShareMenu(!showShareMenu)}
              variant="outline"
              className="border-primary/20 text-primary hover:bg-primary/5 rounded-lg px-4 py-2 font-semibold text-sm"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="space-y-0"
      >
        {/* Modern Hero Section */}
        <section className="w-full bg-gradient-to-br from-secondary/5 via-white to-primary/5 relative overflow-hidden">
          {campaign?.mainCampaignImage ? (
            <div className="relative h-[500px] lg:h-[600px] overflow-hidden">
              <Image
                src={campaign.mainCampaignImage}
                alt={campaign.campaignTitle || 'Campaign'}
                className="w-full h-full object-cover"
                width={1600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end">
                <div className="max-w-[120rem] mx-auto px-6 lg:px-8 pb-12 lg:pb-16 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="space-y-4 lg:space-y-6"
                  >
                    <div className="space-y-3">
                      <h2 className="font-heading text-4xl lg:text-6xl font-bold text-white leading-tight max-w-4xl">
                        {campaign.campaignTitle}
                      </h2>
                      {campaign.projectDescription && (
                        <p className="font-paragraph text-base lg:text-lg text-white/95 max-w-2xl">
                          {campaign.projectDescription}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-[120rem] mx-auto px-6 lg:px-8 py-16 lg:py-24 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4 lg:space-y-6"
              >
                <div className="space-y-3">
                  <h2 className="font-heading text-4xl lg:text-6xl font-bold text-primary leading-tight max-w-4xl">
                    {campaign.campaignTitle}
                  </h2>
                  {campaign.projectDescription && (
                    <p className="font-paragraph text-base lg:text-lg text-primary/80 max-w-2xl">
                      {campaign.projectDescription}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </section>

        {/* Clean Stats Section */}
        <section className="w-full bg-white border-b border-primary/5">
          <div className="max-w-[120rem] mx-auto px-6 lg:px-8 py-12 lg:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
            >
              {/* Fundraising Goal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-gradient-to-br from-primary/5 to-transparent rounded-xl p-6 border border-primary/10 hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 p-2.5 rounded-lg">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Goal</p>
                </div>
                <p className="font-heading text-3xl font-bold text-primary">
                  ${campaign?.fundraisingGoal?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0'}
                </p>
              </motion.div>

              {/* Total Raised */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="bg-gradient-to-br from-secondary/10 to-transparent rounded-xl p-6 border border-secondary/20 hover:border-secondary/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-secondary/20 p-2.5 rounded-lg">
                    <DollarSign className="w-5 h-5 text-secondary" />
                  </div>
                  <p className="font-paragraph text-xs text-secondary/70">Raised</p>
                </div>
                <p className="font-heading text-3xl font-bold text-secondary">
                  ${totalDonations.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
                <p className="font-paragraph text-xs text-secondary/60 mt-1">
                  {donations.length} {donations.length === 1 ? 'donation' : 'donations'}
                </p>
              </motion.div>

              {/* Teams */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-br from-primary/5 to-transparent rounded-xl p-6 border border-primary/10 hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 p-2.5 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <p className="font-paragraph text-xs text-primary/60">Teams</p>
                </div>
                <p className="font-heading text-3xl font-bold text-primary">
                  {teams.length}
                </p>
                <p className="font-paragraph text-xs text-primary/60 mt-1">
                  {totalTeamMembers} members
                </p>
              </motion.div>

              {/* Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="bg-gradient-to-br from-secondary/10 to-transparent rounded-xl p-6 border border-secondary/20 hover:border-secondary/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-secondary/20 p-2.5 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                  </div>
                  <p className="font-paragraph text-xs text-secondary/70">Progress</p>
                </div>
                <p className="font-heading text-3xl font-bold text-secondary">
                  {progressPercentage.toFixed(0)}%
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="w-full max-w-[120rem] mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-xl border border-primary/10 shadow-sm overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="font-paragraph text-sm font-semibold text-primary">Campaign Progress</p>
                    <p className="font-heading text-lg font-bold text-secondary">{progressPercentage.toFixed(0)}%</p>
                  </div>
                  <div className="w-full bg-primary/5 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${progressPercentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="bg-gradient-to-r from-secondary to-secondary/80 h-full rounded-full"
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-paragraph text-primary/60">
                      ${totalDonations.toLocaleString()} raised
                    </span>
                    <span className="font-paragraph text-primary/60">
                      ${campaign?.fundraisingGoal?.toLocaleString()} goal
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Countdown Timer */}
              {campaign?.campaignEndDate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-white rounded-xl border border-primary/10 shadow-sm overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-6 py-4 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <h3 className="font-heading text-lg font-bold text-primary">Time Remaining</h3>
                    </div>
                  </div>
                  <div className="p-8 flex justify-center">
                    <CircularCountdownTimer endDate={campaign.campaignEndDate} />
                  </div>
                </motion.div>
              )}

              {/* Campaign Video */}
              {campaign?.campaignVideo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white rounded-xl border border-primary/10 shadow-sm overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-6 py-4 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                      <Play className="w-5 h-5 text-primary" />
                      <h3 className="font-heading text-lg font-bold text-primary">Campaign Video</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <VideoPlayer src={campaign.campaignVideo} />
                  </div>
                </motion.div>
              )}

              {/* Campaign Details */}
              {(campaign?.promotionalText || campaign?.bonusGoalDescription) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white rounded-xl border border-primary/10 shadow-sm overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-6 py-4 border-b border-primary/10">
                    <h3 className="font-heading text-lg font-bold text-primary">About This Campaign</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {campaign?.promotionalText && (
                      <p className="font-paragraph text-sm text-primary/70 leading-relaxed">{campaign.promotionalText}</p>
                    )}
                    {campaign?.bonusGoalDescription && (
                      <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/20">
                        <div className="flex items-start gap-3">
                          <Zap className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-heading font-semibold text-secondary mb-1">Bonus Goal</p>
                            <p className="font-paragraph text-sm text-secondary/80">{campaign.bonusGoalDescription}</p>
                            {campaign.bonusGoal && (
                              <p className="font-heading text-lg font-bold text-secondary mt-2">
                                ${campaign.bonusGoal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Top Donations Section */}
              {topDonations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-white rounded-xl border border-primary/10 shadow-sm overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-6 py-4 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      <h3 className="font-heading text-lg font-bold text-primary">Top Donors</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    {topDonations.map((donation, index) => (
                      <motion.div
                        key={donation._id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10 hover:border-primary/20 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-secondary/20 text-secondary font-heading font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-heading font-semibold text-primary">
                              {donation.isAnonymous ? 'Anonymous' : (donation.donorName || 'Donor')}
                            </p>
                            {donation.donorMessage && (
                              <p className="font-paragraph text-xs text-primary/60 line-clamp-1">{donation.donorMessage}</p>
                            )}
                          </div>
                        </div>
                        <p className="font-heading text-lg font-bold text-secondary">
                          ${donation.amount?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0'}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Teams Section */}
              {teams.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-white rounded-xl border border-primary/10 shadow-sm overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-6 py-4 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <h3 className="font-heading text-lg font-bold text-primary">Fundraising Teams ({teams.length})</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teams.map((team, index) => (
                        <motion.div
                          key={team._id}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.1 * index }}
                          onClick={() => navigate(`/team/${team._id}`)}
                          className="border border-primary/10 rounded-lg overflow-hidden hover:border-secondary/30 hover:shadow-md transition-all duration-300 cursor-pointer bg-white"
                        >
                          {team.teamLogo && (
                            <div className="h-32 overflow-hidden bg-primary/5">
                              <Image
                                src={team.teamLogo}
                                alt={team.teamName || 'Team'}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                width={300}
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h4 className="font-heading text-base font-bold text-primary mb-2">{team.teamName}</h4>
                            {team.teamDescription && (
                              <p className="font-paragraph text-sm text-primary/60 mb-3 line-clamp-2">
                                {team.teamDescription}
                              </p>
                            )}
                            <div className="space-y-2">
                              {team.fundraisingGoal && (
                                <div className="flex justify-between items-center">
                                  <span className="font-paragraph text-xs text-primary/60">Goal:</span>
                                  <span className="font-heading font-semibold text-secondary">
                                    ${team.fundraisingGoal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                              )}
                              {team.memberCount && (
                                <div className="flex justify-between items-center">
                                  <span className="font-paragraph text-xs text-primary/60">Members:</span>
                                  <span className="font-heading font-semibold text-primary">{team.memberCount}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="sticky top-[100px] space-y-6"
              >
                {/* Donation Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white rounded-xl border border-primary/10 shadow-sm p-6"
                >
                  <h3 className="font-heading text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-secondary" />
                    Make a Donation
                  </h3>
                  <DonationTiersSelector 
                    campaignId={campaignId}
                    campaignVideoUrl={campaign?.campaignVideo}
                    teams={teams}
                    onDonationComplete={() => {
                      loadCampaign();
                    }}
                  />
                </motion.div>

                {/* Share Section */}
                <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">
                  <h3 className="font-heading text-base font-bold text-primary mb-4">Share Campaign</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleShare('facebook')}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors font-paragraph font-semibold text-blue-700 text-sm"
                      >
                        <Facebook className="w-4 h-4" />
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors font-paragraph font-semibold text-sky-700 text-sm"
                      >
                        <Twitter className="w-4 h-4" />
                        Twitter
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors font-paragraph font-semibold text-blue-700 text-sm"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </button>
                      <button
                        onClick={() => handleShare('email')}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors font-paragraph font-semibold text-gray-700 text-sm"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </button>
                    </div>

                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg transition-colors font-paragraph font-semibold text-primary"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Campaign Info */}
                <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6 space-y-4">
                  <h3 className="font-heading text-base font-bold text-primary">Campaign Info</h3>
                  
                  {campaign?.status && (
                    <div>
                      <p className="font-paragraph text-xs text-primary/60 uppercase tracking-wide mb-2">Status</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${campaign.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <p className="font-heading font-semibold text-primary">{campaign.status}</p>
                      </div>
                    </div>
                  )}

                  {campaign?.campaignStartDate && (
                    <div>
                      <p className="font-paragraph text-xs text-primary/60 uppercase tracking-wide mb-2">Started</p>
                      <p className="font-heading font-semibold text-primary">
                        {new Date(campaign.campaignStartDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {campaign?.campaignEndDate && (
                    <div>
                      <p className="font-paragraph text-xs text-primary/60 uppercase tracking-wide mb-2">Ends</p>
                      <p className="font-heading font-semibold text-primary">
                        {new Date(campaign.campaignEndDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Simple Footer */}
        <footer className="bg-primary text-primary-foreground py-12 border-t border-primary/10">
          <div className="max-w-[120rem] mx-auto px-6 lg:px-8">
            <div className="text-center">
              <p className="font-paragraph text-sm text-primary-foreground/70">
                © {new Date().getFullYear()} Campaign Platform. All rights reserved.
              </p>
            </div>
          </div>
        </footer>

        {/* Live Chat Widget */}
        <LiveChat campaignId={campaignId} />
      </motion.div>
    </div>
  );
}
