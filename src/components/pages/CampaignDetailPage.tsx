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
  const { campaignId } = useParams<{ campaignId: string }>();
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
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      if (!campaignId) {
        setError('Campaign not found');
        return;
      }

      const [campaignData, donationsRes, teamsRes, matchersRes] = await Promise.all([
        BaseCrudService.getById<CampaignDetails>('campaigndetails', campaignId),
        BaseCrudService.getAll<Donations>('donations'),
        BaseCrudService.getAll<Teams>('teams'),
        BaseCrudService.getAll<Matchers>('matchers'),
      ]);

      setCampaign(campaignData);
      setDonations(donationsRes.items || []);
      setTeams(teamsRes.items || []);
      setMatchers(matchersRes.items?.filter(m => m.status === 'active') || []);
    } catch (err) {
      setError('Failed to load campaign details');
      console.error(err);
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

  const progressPercentage = campaign.fundraisingGoal
    ? Math.min((campaign.fundraisingGoal * 0.5) / campaign.fundraisingGoal * 100, 100)
    : 0;

  const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalTeamMembers = teams.reduce((sum, t) => sum + (t.memberCount || 0), 0);
  const avgDonation = donations.length > 0 ? totalDonations / donations.length : 0;
  const topDonations = [...donations].sort((a, b) => (b.amount || 0) - (a.amount || 0)).slice(0, 5);
  const totalMatcherAmount = matchers.reduce((sum, m) => sum + (m.matchingAmount || 0), 0);
  const potentialMatched = totalDonations * 0.5; // Assuming 50% match rate for demo

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <header className="bg-primary text-primary-foreground border-b border-secondary/20 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[120rem] mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <Button
              onClick={() => navigate('/')}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg px-4 py-2 font-semibold text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="font-heading text-2xl font-bold text-center flex-1 px-4 truncate">{campaign?.campaignTitle}</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="space-y-0"
      >
        {/* Enhanced Hero Section */}
        <section className="w-full bg-gradient-to-br from-primary via-primary/95 to-secondary/30 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -ml-48 -mb-48"></div>

          {campaign?.mainCampaignImage ? (
            <div className="relative h-[550px] overflow-hidden">
              <Image
                src={campaign.mainCampaignImage}
                alt={campaign.campaignTitle || 'Campaign'}
                className="w-full h-full object-cover"
                width={1600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end">
                <div className="max-w-[120rem] mx-auto px-8 pb-16 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="space-y-3">
                      <h2 className="font-heading text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight">
                        {campaign.campaignTitle}
                      </h2>
                      {campaign.projectDescription && (
                        <p className="font-paragraph text-xl text-primary-foreground/95 max-w-3xl">
                          {campaign.projectDescription}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 pt-4">
                      <Button
                        onClick={() => navigate('/')}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg px-8 py-3 font-semibold text-base"
                      >
                        Donate Now
                      </Button>
                      <Button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        variant="outline"
                        className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 rounded-lg px-8 py-3 font-semibold text-base"
                      >
                        <Share2 className="w-5 h-5 mr-2" />
                        Share
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-[120rem] mx-auto px-8 py-24 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <h2 className="font-heading text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight">
                    {campaign.campaignTitle}
                  </h2>
                  {campaign.projectDescription && (
                    <p className="font-paragraph text-xl text-primary-foreground/90 max-w-3xl">
                      {campaign.projectDescription}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button
                    onClick={() => navigate('/')}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg px-8 py-3 font-semibold text-base"
                  >
                    Donate Now
                  </Button>
                  <Button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    variant="outline"
                    className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 rounded-lg px-8 py-3 font-semibold text-base"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </section>

        {/* Advanced Stats Dashboard */}
        <section className="w-full bg-white border-b border-primary/10">
          <div className="max-w-[120rem] mx-auto px-8 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Primary Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Fundraising Goal */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-gradient-to-br from-primary/8 to-primary/4 rounded-xl p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/20 p-3 rounded-lg">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <p className="font-paragraph text-sm text-primary/70">Fundraising Goal</p>
                    </div>
                  </div>
                  <p className="font-heading text-4xl font-bold text-primary">
                    ${campaign?.fundraisingGoal?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0'}
                  </p>
                </motion.div>

                {/* Total Donations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="bg-gradient-to-br from-secondary/15 to-secondary/5 rounded-xl p-6 border border-secondary/30 hover:border-secondary/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-secondary/30 p-3 rounded-lg">
                        <DollarSign className="w-5 h-5 text-secondary" />
                      </div>
                      <p className="font-paragraph text-sm text-secondary/70">Total Raised</p>
                    </div>
                  </div>
                  <p className="font-heading text-4xl font-bold text-secondary">
                    ${totalDonations.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="font-paragraph text-xs text-secondary/60 mt-2">
                    {donations.length} {donations.length === 1 ? 'donation' : 'donations'}
                  </p>
                </motion.div>

                {/* Teams */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-gradient-to-br from-primary/8 to-primary/4 rounded-xl p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/20 p-3 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <p className="font-paragraph text-sm text-primary/70">Fundraising Teams</p>
                    </div>
                  </div>
                  <p className="font-heading text-4xl font-bold text-primary">
                    {teams.length}
                  </p>
                  <p className="font-paragraph text-xs text-primary/60 mt-2">
                    {totalTeamMembers} total members
                  </p>
                </motion.div>

                {/* Matched Amount */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="bg-gradient-to-br from-amber-100/30 to-amber-50/20 rounded-xl p-6 border border-amber-200/40 hover:border-amber-300/60 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-200/40 p-3 rounded-lg">
                        <Flame className="w-5 h-5 text-amber-700" />
                      </div>
                      <p className="font-paragraph text-sm text-amber-700/70">Potential Matched</p>
                    </div>
                  </div>
                  <p className="font-heading text-4xl font-bold text-amber-700">
                    ${potentialMatched.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="font-paragraph text-xs text-amber-700/60 mt-2">
                    With {matchers.length} matcher{matchers.length !== 1 ? 's' : ''}
                  </p>
                </motion.div>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Average Donation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <p className="font-paragraph text-sm text-primary/60">Avg Donation</p>
                  </div>
                  <p className="font-heading text-3xl font-bold text-primary">
                    ${avgDonation.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                </motion.div>

                {/* Progress to Goal */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                  className="bg-white rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                    <p className="font-paragraph text-sm text-secondary/60">Progress</p>
                  </div>
                  <p className="font-heading text-3xl font-bold text-secondary">
                    {progressPercentage.toFixed(0)}%
                  </p>
                </motion.div>

                {/* Matcher Impact */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-white rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="w-5 h-5 text-amber-700" />
                    <p className="font-paragraph text-sm text-amber-700/60">Matcher Impact</p>
                  </div>
                  <p className="font-heading text-3xl font-bold text-amber-700">
                    ${totalMatcherAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="w-full max-w-[120rem] mx-auto px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Countdown Timer */}
              {campaign?.campaignEndDate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white rounded-xl border border-primary/10 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <h3 className="font-heading text-xl font-bold text-primary">Campaign Countdown</h3>
                    </div>
                  </div>
                  <div className="p-8 flex justify-center bg-gradient-to-b from-white to-primary/2">
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
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white rounded-xl border border-primary/10 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                      <Play className="w-5 h-5 text-primary" />
                      <h3 className="font-heading text-xl font-bold text-primary">Campaign Video</h3>
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-b from-white to-primary/2">
                    <VideoPlayer src={campaign.campaignVideo} />
                  </div>
                </motion.div>
              )}

              {/* Fundraising Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-xl border border-primary/10 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4 border-b border-primary/10">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="font-heading text-xl font-bold text-primary">Fundraising Progress</h3>
                  </div>
                </div>
                <div className="p-6 space-y-6 bg-gradient-to-b from-white to-primary/2">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <p className="font-paragraph text-sm font-semibold text-primary">Progress to Goal</p>
                      <p className="font-heading text-lg font-bold text-secondary">{progressPercentage.toFixed(0)}%</p>
                    </div>
                    <div className="w-full bg-primary/10 rounded-full h-5 overflow-hidden border border-primary/20">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${progressPercentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="bg-gradient-to-r from-secondary to-secondary/80 h-full rounded-full shadow-lg"
                      />
                    </div>
                  </div>

                  {/* Bonus Goal */}
                  {campaign?.bonusGoalDescription && (
                    <div className="bg-gradient-to-br from-secondary/15 to-secondary/5 rounded-lg p-5 border border-secondary/30">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-heading font-bold text-secondary mb-1">Bonus Goal</p>
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

              {/* Campaign Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white rounded-xl border border-primary/10 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4 border-b border-primary/10">
                  <h3 className="font-heading text-xl font-bold text-primary">Campaign Details</h3>
                </div>
                <div className="p-6 space-y-6 bg-gradient-to-b from-white to-primary/2">
                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {campaign?.campaignStartDate && (
                      <div>
                        <p className="font-paragraph text-sm text-primary/60 mb-2">Start Date</p>
                        <p className="font-heading text-lg font-bold text-primary">
                          {new Date(campaign.campaignStartDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                    {campaign?.campaignEndDate && (
                      <div>
                        <p className="font-paragraph text-sm text-primary/60 mb-2">End Date</p>
                        <p className="font-heading text-lg font-bold text-primary">
                          {new Date(campaign.campaignEndDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  {campaign?.status && (
                    <div>
                      <p className="font-paragraph text-sm text-primary/60 mb-2">Status</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${campaign.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <p className="font-heading font-bold text-primary">{campaign.status}</p>
                      </div>
                    </div>
                  )}

                  {/* Promotional Text */}
                  {campaign?.promotionalText && (
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                      <p className="font-paragraph text-sm text-primary/70">{campaign.promotionalText}</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Top Donations Section */}
              {topDonations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.55 }}
                  className="bg-white rounded-xl border border-primary/10 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      <h3 className="font-heading text-xl font-bold text-primary">Top Donors</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-3 bg-gradient-to-b from-white to-primary/2">
                    {topDonations.map((donation, index) => (
                      <motion.div
                        key={donation._id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10 hover:border-primary/30 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-secondary/20 text-secondary font-heading font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-heading font-bold text-primary">
                              {donation.isAnonymous ? 'Anonymous Donor' : (donation.donorName || 'Donor')}
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

              {/* Matchers Section */}
              {matchers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-white rounded-xl border border-primary/10 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-primary" />
                      <h3 className="font-heading text-xl font-bold text-primary">Generous Matchers</h3>
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-b from-white to-primary/2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matchers.map((matcher, index) => (
                        <motion.div
                          key={matcher._id}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.1 * index }}
                          className="border border-primary/10 rounded-lg p-5 hover:border-secondary/40 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-primary/5 to-transparent"
                        >
                          <h4 className="font-heading text-lg font-bold text-primary mb-3">{matcher.matcherName}</h4>
                          <div className="space-y-2">
                            {matcher.matchingAmount && (
                              <div className="flex justify-between items-center">
                                <span className="font-paragraph text-sm text-primary/60">Matching Amount:</span>
                                <span className="font-heading font-bold text-secondary">
                                  ${matcher.matchingAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </span>
                              </div>
                            )}
                            {matcher.matchingPercentage && (
                              <div className="flex justify-between items-center">
                                <span className="font-paragraph text-sm text-primary/60">Matching %:</span>
                                <span className="font-heading font-bold text-secondary">
                                  {matcher.matchingPercentage}%
                                </span>
                              </div>
                            )}
                            {matcher.matchingLimit && (
                              <div className="flex justify-between items-center">
                                <span className="font-paragraph text-sm text-primary/60">Limit:</span>
                                <span className="font-heading font-bold text-primary">
                                  ${matcher.matchingLimit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Teams Section */}
              {teams.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="bg-white rounded-xl border border-primary/10 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <h3 className="font-heading text-xl font-bold text-primary">Fundraising Teams ({teams.length})</h3>
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-b from-white to-primary/2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teams.map((team, index) => (
                        <motion.div
                          key={team._id}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.1 * index }}
                          onClick={() => navigate(`/team/${team._id}`)}
                          className="border border-primary/10 rounded-lg overflow-hidden hover:border-secondary/40 hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-primary/5 to-transparent"
                        >
                          {team.teamLogo && (
                            <div className="h-32 overflow-hidden bg-primary/10">
                              <Image
                                src={team.teamLogo}
                                alt={team.teamName || 'Team'}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                width={300}
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h4 className="font-heading text-lg font-bold text-primary mb-2">{team.teamName}</h4>
                            {team.teamDescription && (
                              <p className="font-paragraph text-sm text-primary/60 mb-3 line-clamp-2">
                                {team.teamDescription}
                              </p>
                            )}
                            <div className="space-y-2">
                              {team.fundraisingGoal && (
                                <div className="flex justify-between items-center">
                                  <span className="font-paragraph text-xs text-primary/60">Goal:</span>
                                  <span className="font-heading font-bold text-secondary">
                                    ${team.fundraisingGoal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                              )}
                              {team.memberCount && (
                                <div className="flex justify-between items-center">
                                  <span className="font-paragraph text-xs text-primary/60">Members:</span>
                                  <span className="font-heading font-bold text-primary">{team.memberCount}</span>
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
                {/* Donation Tiers Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white rounded-xl border border-primary/10 shadow-lg p-6 hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="font-heading text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-secondary" />
                    Support This Campaign
                  </h3>
                  <DonationTiersSelector 
                    campaignId={campaignId}
                    onDonationComplete={() => {
                      // Reload campaign data to show updated donation count
                      loadCampaign();
                    }}
                  />
                </motion.div>

                {/* Share Section */}
                <div className="bg-white rounded-xl border border-primary/10 shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                  <h3 className="font-heading text-lg font-bold text-primary mb-4">Share Campaign</h3>
                  <div className="space-y-3">
                    {/* Share Buttons */}
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

                    {/* Copy Link Button */}
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
                <div className="bg-white rounded-xl border border-primary/10 shadow-lg p-6 space-y-4 hover:shadow-xl transition-all duration-300">
                  <h3 className="font-heading text-lg font-bold text-primary">Campaign Info</h3>
                  
                  <div>
                    <p className="font-paragraph text-xs text-primary/60 uppercase tracking-wide mb-2">Campaign ID</p>
                    <div className="flex items-center gap-2">
                      <p className="font-heading font-mono text-sm text-primary break-all flex-1">{campaign?._id}</p>
                      <button
                        onClick={() => handleCopyField(campaign?._id || '', 'id')}
                        className="p-2 hover:bg-primary/5 rounded transition-colors"
                      >
                        {copiedField === 'id' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-primary/60" />
                        )}
                      </button>
                    </div>
                  </div>

                  {campaign?.status && (
                    <div>
                      <p className="font-paragraph text-xs text-primary/60 uppercase tracking-wide mb-2">Status</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${campaign.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <p className="font-heading font-bold text-primary">{campaign.status}</p>
                      </div>
                    </div>
                  )}

                  {campaign?.campaignStartDate && (
                    <div>
                      <p className="font-paragraph text-xs text-primary/60 uppercase tracking-wide mb-2">Started</p>
                      <p className="font-heading font-bold text-primary">
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
                      <p className="font-heading font-bold text-primary">
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

        {/* Call to Action Section */}
        <section className="w-full bg-gradient-to-r from-primary via-primary/95 to-secondary/20 py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="max-w-[120rem] mx-auto px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-6"
            >
              <h2 className="font-heading text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
                Ready to Make a <span className="text-secondary italic">Difference</span>?
              </h2>
              <p className="font-paragraph text-lg text-primary-foreground/85 max-w-2xl mx-auto">
                Join us in supporting this important campaign. Every donation brings us closer to our goal and creates real impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  onClick={() => navigate('/')}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg px-8 py-3 text-lg font-semibold"
                >
                  DONATE NOW
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary rounded-lg px-8 py-3 text-lg font-semibold"
                >
                  BACK TO CAMPAIGNS
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-primary text-primary-foreground py-16 border-t border-primary/20">
          <div className="max-w-[120rem] mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div className="space-y-4">
                <h3 className="font-heading text-2xl font-bold">CAMPAIGN</h3>
              </div>

              <div className="space-y-4">
                <h4 className="font-heading text-xl font-bold">Quick Links</h4>
                <nav className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate('/')}
                    className="font-paragraph text-base text-primary-foreground/80 hover:text-secondary transition-colors text-left"
                  >
                    All Campaigns
                  </button>
                  <a href="/#donate" className="font-paragraph text-base text-primary-foreground/80 hover:text-secondary transition-colors">
                    Make a Donation
                  </a>
                  <a href="/#progress" className="font-paragraph text-base text-primary-foreground/80 hover:text-secondary transition-colors">
                    View Progress
                  </a>
                </nav>
              </div>

              <div className="space-y-4">
                <h4 className="font-heading text-xl font-bold">Resources</h4>
                <nav className="flex flex-col gap-3">
                  <a href="/gallery" className="font-paragraph text-base text-primary-foreground/80 hover:text-secondary transition-colors">
                    Gallery
                  </a>
                  <a href="/" className="font-paragraph text-base text-primary-foreground/80 hover:text-secondary transition-colors">
                    Home
                  </a>
                </nav>
              </div>
            </div>

            <div className="pt-8 border-t border-primary-foreground/20 text-center">
              <p className="font-paragraph text-sm text-primary-foreground/70">
                © {new Date().getFullYear()} Campaign. All rights reserved. | Secure & Trusted Donations
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
