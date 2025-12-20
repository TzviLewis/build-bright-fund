import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails, Donations, Teams, Matchers } from '@/entities';
import { ArrowLeft, AlertCircle, Loader2, Play, Users, TrendingUp, DollarSign, Share2, Download, Eye, Copy, CheckCircle, Clock, Target, Zap } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { motion } from 'framer-motion';
import VideoPlayer from '@/components/VideoPlayer';
import CircularCountdownTimer from '@/components/CircularCountdownTimer';

export default function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [donations, setDonations] = useState<Donations[]>([]);
  const [teams, setTeams] = useState<Teams[]>([]);
  const [matchers, setMatchers] = useState<Matchers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign?.campaignTitle || 'Campaign',
        text: campaign?.projectDescription || '',
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err));
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground border-b border-secondary/20 shadow-sm sticky top-0 z-40">
        <div className="max-w-[120rem] mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <Button
              onClick={() => navigate('/')}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-6 py-2 font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Button>
            <h1 className="font-heading text-3xl font-bold">{campaign.campaignTitle}</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="space-y-0"
      >
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-r from-primary via-primary/95 to-secondary/20">
          {campaign.mainCampaignImage ? (
            <div className="relative h-[500px] overflow-hidden">
              <Image
                src={campaign.mainCampaignImage}
                alt={campaign.campaignTitle || 'Campaign'}
                className="w-full h-full object-cover"
                width={1200}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent flex flex-col justify-end">
                <div className="max-w-[120rem] mx-auto px-8 pb-12 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="space-y-4"
                  >
                    <h2 className="font-heading text-5xl lg:text-6xl font-bold text-primary-foreground">
                      {campaign.campaignTitle}
                    </h2>
                    {campaign.projectDescription && (
                      <p className="font-paragraph text-lg text-primary-foreground/90 max-w-2xl">
                        {campaign.projectDescription}
                      </p>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-[120rem] mx-auto px-8 py-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <h2 className="font-heading text-5xl lg:text-6xl font-bold text-primary-foreground">
                  {campaign.campaignTitle}
                </h2>
                {campaign.projectDescription && (
                  <p className="font-paragraph text-lg text-primary-foreground/80 max-w-2xl">
                    {campaign.projectDescription}
                  </p>
                )}
              </motion.div>
            </div>
          )}
        </section>

        {/* Quick Stats Section */}
        <section className="w-full bg-white border-b border-primary/10 shadow-sm">
          <div className="max-w-[120rem] mx-auto px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Fundraising Goal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-5 h-5 text-primary" />
                  <p className="font-paragraph text-sm text-primary/60">Fundraising Goal</p>
                </div>
                <p className="font-heading text-3xl font-bold text-primary">
                  ${campaign.fundraisingGoal?.toFixed(0) || '0'}
                </p>
              </motion.div>

              {/* Total Donations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg p-6 border border-secondary/20"
              >
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-5 h-5 text-secondary" />
                  <p className="font-paragraph text-sm text-secondary/60">Total Donations</p>
                </div>
                <p className="font-heading text-3xl font-bold text-secondary">
                  ${totalDonations.toFixed(0)}
                </p>
              </motion.div>

              {/* Teams */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-primary" />
                  <p className="font-paragraph text-sm text-primary/60">Teams</p>
                </div>
                <p className="font-heading text-3xl font-bold text-primary">
                  {teams.length}
                </p>
              </motion.div>

              {/* Team Members */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg p-6 border border-secondary/20"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-secondary" />
                  <p className="font-paragraph text-sm text-secondary/60">Team Members</p>
                </div>
                <p className="font-heading text-3xl font-bold text-secondary">
                  {totalTeamMembers}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="w-full max-w-[120rem] mx-auto px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Countdown Timer */}
              {campaign.campaignEndDate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white rounded-lg border border-primary/10 shadow-lg overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <h3 className="font-heading text-xl font-bold text-primary">Campaign Countdown</h3>
                    </div>
                  </div>
                  <div className="p-8 flex justify-center">
                    <CircularCountdownTimer endDate={campaign.campaignEndDate} />
                  </div>
                </motion.div>
              )}

              {/* Campaign Video */}
              {campaign.campaignVideo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white rounded-lg border border-primary/10 shadow-lg overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                      <Play className="w-5 h-5 text-primary" />
                      <h3 className="font-heading text-xl font-bold text-primary">Campaign Video</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <VideoPlayer src={campaign.campaignVideo} />
                  </div>
                </motion.div>
              )}

              {/* Fundraising Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-lg border border-primary/10 shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4 border-b border-primary/10">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="font-heading text-xl font-bold text-primary">Fundraising Progress</h3>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <p className="font-paragraph text-sm font-semibold text-primary">Progress</p>
                      <p className="font-heading text-lg font-bold text-secondary">{progressPercentage.toFixed(0)}%</p>
                    </div>
                    <div className="w-full bg-primary/10 rounded-full h-4 overflow-hidden border border-primary/20">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="bg-gradient-to-r from-secondary to-secondary/80 h-full rounded-full"
                      />
                    </div>
                  </div>

                  {/* Bonus Goal */}
                  {campaign.bonusGoalDescription && (
                    <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-heading font-bold text-secondary mb-1">Bonus Goal</p>
                          <p className="font-paragraph text-sm text-secondary/80">{campaign.bonusGoalDescription}</p>
                          {campaign.bonusGoal && (
                            <p className="font-heading text-lg font-bold text-secondary mt-2">
                              ${campaign.bonusGoal.toFixed(0)}
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
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white rounded-lg border border-primary/10 shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4 border-b border-primary/10">
                  <h3 className="font-heading text-xl font-bold text-primary">Campaign Details</h3>
                </div>
                <div className="p-6 space-y-6">
                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {campaign.campaignStartDate && (
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
                    {campaign.campaignEndDate && (
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
                  {campaign.status && (
                    <div>
                      <p className="font-paragraph text-sm text-primary/60 mb-2">Status</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${campaign.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <p className="font-heading font-bold text-primary">{campaign.status}</p>
                      </div>
                    </div>
                  )}

                  {/* Promotional Text */}
                  {campaign.promotionalText && (
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                      <p className="font-paragraph text-sm text-primary/70">{campaign.promotionalText}</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Matchers Section */}
              {matchers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-white rounded-lg border border-primary/10 shadow-lg overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <h3 className="font-heading text-xl font-bold text-primary">Generous Matchers</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matchers.map((matcher, index) => (
                        <motion.div
                          key={matcher._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 * index }}
                          className="border border-primary/10 rounded-lg p-4 hover:border-secondary/30 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-primary/5 to-transparent"
                        >
                          <h4 className="font-heading text-lg font-bold text-primary mb-3">{matcher.matcherName}</h4>
                          <div className="space-y-2">
                            {matcher.matchingAmount && (
                              <div className="flex justify-between items-center">
                                <span className="font-paragraph text-sm text-primary/60">Matching Amount:</span>
                                <span className="font-heading font-bold text-secondary">
                                  ${matcher.matchingAmount.toFixed(0)}
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
                                  ${matcher.matchingLimit.toFixed(0)}
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
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="bg-white rounded-lg border border-primary/10 shadow-lg overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <h3 className="font-heading text-xl font-bold text-primary">Fundraising Teams ({teams.length})</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teams.map((team, index) => (
                        <motion.div
                          key={team._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 * index }}
                          onClick={() => navigate(`/team/${team._id}`)}
                          className="border border-primary/10 rounded-lg overflow-hidden hover:border-secondary/30 hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-primary/5 to-transparent"
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
                                    ${team.fundraisingGoal.toFixed(0)}
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
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="sticky top-[100px] space-y-6"
              >
                {/* Donation CTA */}
                <div className="bg-gradient-to-br from-secondary to-secondary/80 rounded-lg p-6 text-secondary-foreground shadow-lg">
                  <h3 className="font-heading text-2xl font-bold mb-2">Make an Impact</h3>
                  <p className="font-paragraph text-sm text-secondary-foreground/90 mb-4">
                    Your donation helps us reach our goal and make a real difference.
                  </p>
                  <Button
                    onClick={() => navigate('/')}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold py-3"
                  >
                    Donate Now
                  </Button>
                </div>

                {/* Share Section */}
                <div className="bg-white rounded-lg border border-primary/10 shadow-lg p-6">
                  <h3 className="font-heading text-lg font-bold text-primary mb-4">Share Campaign</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleShare}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg transition-colors font-paragraph font-semibold text-primary"
                    >
                      <Share2 className="w-5 h-5" />
                      Share
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg transition-colors font-paragraph font-semibold text-primary"
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
                <div className="bg-white rounded-lg border border-primary/10 shadow-lg p-6 space-y-4">
                  <h3 className="font-heading text-lg font-bold text-primary">Campaign Info</h3>
                  
                  <div>
                    <p className="font-paragraph text-xs text-primary/60 uppercase tracking-wide mb-1">Campaign ID</p>
                    <p className="font-heading font-mono text-sm text-primary break-all">{campaign._id}</p>
                  </div>

                  {campaign.status && (
                    <div>
                      <p className="font-paragraph text-xs text-primary/60 uppercase tracking-wide mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${campaign.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <p className="font-heading font-bold text-primary">{campaign.status}</p>
                      </div>
                    </div>
                  )}

                  {campaign.campaignStartDate && (
                    <div>
                      <p className="font-paragraph text-xs text-primary/60 uppercase tracking-wide mb-1">Started</p>
                      <p className="font-heading font-bold text-primary">
                        {new Date(campaign.campaignStartDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {campaign.campaignEndDate && (
                    <div>
                      <p className="font-paragraph text-xs text-primary/60 uppercase tracking-wide mb-1">Ends</p>
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
        <section className="w-full bg-primary py-20">
          <div className="max-w-[120rem] mx-auto px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-6"
            >
              <h2 className="font-heading text-5xl font-bold text-primary-foreground">
                Ready to Make a <span className="text-secondary italic">Difference</span>?
              </h2>
              <p className="font-paragraph text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                Join us in supporting this important campaign. Every donation brings us closer to our goal.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  onClick={() => navigate('/')}
                  size="lg"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-8 py-6 text-lg font-semibold"
                >
                  DONATE NOW
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary rounded-full px-8 py-6 text-lg font-semibold"
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
      </motion.div>
    </div>
  );
}
