import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails, Donations, Teams } from '@/entities';
import { ArrowRight, Calendar, DollarSign, Users, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignDetails[]>([]);
  const [donations, setDonations] = useState<Donations[]>([]);
  const [teams, setTeams] = useState<Teams[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [campaignRes, donationsRes, teamsRes] = await Promise.all([
        BaseCrudService.getAll<CampaignDetails>('campaigndetails'),
        BaseCrudService.getAll<Donations>('donations'),
        BaseCrudService.getAll<Teams>('teams'),
      ]);

      setCampaigns(campaignRes.items || []);
      setDonations(donationsRes.items || []);
      setTeams(teamsRes.items || []);
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

  const liveCampaigns = campaigns.filter(c => isCampaignLive(c));
  const endedCampaigns = campaigns.filter(c => isCampaignEnded(c));
  const draftCampaigns = campaigns.filter(c => !isCampaignLive(c) && !isCampaignEnded(c));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="font-heading text-lg text-blue-900">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-8">
        <div className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold text-blue-900 mb-4">Error Loading Campaigns</h1>
          <p className="font-paragraph text-lg text-blue-700 mb-6">{error}</p>
          <Button 
            onClick={loadData}
            className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-8 py-3"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white border-b-4 border-blue-600 shadow-lg">
        <div className="max-w-[120rem] mx-auto px-8 py-12">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-heading text-5xl font-bold mb-2">Our Campaigns</h1>
              <p className="font-paragraph text-xl text-blue-100">
                Discover and support our active fundraising campaigns
              </p>
            </div>
            <Link to="/home">
              <Button className="bg-white text-blue-900 hover:bg-blue-50 rounded-full px-8 py-3 font-semibold">
                View Original Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[120rem] mx-auto px-8 py-16">
        {/* Live Campaigns Section */}
        {liveCampaigns.length > 0 ? (
          <section className="mb-20">
            <div className="mb-12">
              <div className="inline-block mb-4 px-4 py-2 bg-green-100 rounded-full">
                <p className="font-heading text-sm font-bold text-green-700 uppercase tracking-wider">🔴 Live Now</p>
              </div>
              <h2 className="font-heading text-4xl font-bold text-blue-900">
                Active <span className="text-green-600 italic">Campaigns</span>
              </h2>
              <p className="font-paragraph text-lg text-blue-700 mt-2">
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
                    className="bg-white rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow border-2 border-green-200"
                  >
                    {/* Campaign Image */}
                    {campaign.mainCampaignImage && (
                      <div className="relative h-64 overflow-hidden bg-blue-100">
                        <Image
                          src={campaign.mainCampaignImage}
                          alt={campaign.campaignTitle || 'Campaign'}
                          className="w-full h-full object-cover"
                          width={600}
                        />
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
                          LIVE
                        </div>
                      </div>
                    )}

                    {/* Campaign Content */}
                    <div className="p-8 space-y-6">
                      <div>
                        <h3 className="font-heading text-3xl font-bold text-blue-900 mb-2">
                          {campaign.campaignTitle}
                        </h3>
                        <p className="font-paragraph text-blue-700 line-clamp-2">
                          {campaign.projectDescription}
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <p className="font-paragraph text-xs text-blue-600 uppercase tracking-wider mb-1">Raised</p>
                          <p className="font-heading text-2xl font-bold text-blue-900">
                            £{stats.totalRaised.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <p className="font-paragraph text-xs text-blue-600 uppercase tracking-wider mb-1">Goal</p>
                          <p className="font-heading text-2xl font-bold text-blue-900">
                            £{campaign.fundraisingGoal?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <p className="font-paragraph text-xs text-blue-600 uppercase tracking-wider mb-1">Donors</p>
                          <p className="font-heading text-2xl font-bold text-blue-900">
                            {stats.donorCount}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-paragraph text-sm text-blue-700">Progress</span>
                          <span className="font-heading text-lg font-bold text-green-600">
                            {stats.progress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.progress}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full"
                          />
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Link to={`/?campaign=${campaign._id}`}>
                        <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 rounded-lg py-3 font-semibold flex items-center justify-center gap-2">
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
            <div className="text-center py-16 bg-white rounded-lg border-2 border-blue-200">
              <AlertCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="font-heading text-3xl font-bold text-blue-900 mb-2">No Live Campaigns</h2>
              <p className="font-paragraph text-lg text-blue-700">
                Check back soon for exciting new campaigns!
              </p>
            </div>
          </section>
        )}

        {/* Ended Campaigns Section */}
        {endedCampaigns.length > 0 && (
          <section className="mb-20">
            <div className="mb-12">
              <div className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full">
                <p className="font-heading text-sm font-bold text-blue-700 uppercase tracking-wider">✓ Recently Ended</p>
              </div>
              <h2 className="font-heading text-4xl font-bold text-blue-900">
                Recently Completed <span className="text-blue-600 italic">Campaigns</span>
              </h2>
              <p className="font-paragraph text-lg text-blue-700 mt-2">
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
                    className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-300"
                  >
                    {/* Campaign Image */}
                    {campaign.mainCampaignImage && (
                      <div className="relative h-64 overflow-hidden bg-blue-100">
                        <Image
                          src={campaign.mainCampaignImage}
                          alt={campaign.campaignTitle || 'Campaign'}
                          className="w-full h-full object-cover opacity-90"
                          width={600}
                        />
                        <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full font-semibold text-sm">
                          COMPLETED
                        </div>
                      </div>
                    )}

                    {/* Campaign Content */}
                    <div className="p-8 space-y-6">
                      <div>
                        <h3 className="font-heading text-3xl font-bold text-blue-900 mb-2">
                          {campaign.campaignTitle}
                        </h3>
                        <p className="font-paragraph text-blue-700 line-clamp-2">
                          {campaign.projectDescription}
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <p className="font-paragraph text-xs text-blue-600 uppercase tracking-wider mb-1">Raised</p>
                          <p className="font-heading text-2xl font-bold text-blue-900">
                            £{stats.totalRaised.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <p className="font-paragraph text-xs text-blue-600 uppercase tracking-wider mb-1">Goal</p>
                          <p className="font-heading text-2xl font-bold text-blue-900">
                            £{campaign.fundraisingGoal?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <p className="font-paragraph text-xs text-blue-600 uppercase tracking-wider mb-1">Donors</p>
                          <p className="font-heading text-2xl font-bold text-blue-900">
                            {stats.donorCount}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-paragraph text-sm text-blue-700">Final Progress</span>
                          <span className="font-heading text-lg font-bold text-blue-600">
                            {stats.progress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.progress}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
                          />
                        </div>
                      </div>

                      {/* End Date */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="font-paragraph text-xs text-blue-600 uppercase tracking-wider mb-1">Campaign Ended</p>
                        <p className="font-heading text-lg font-bold text-blue-900">{endDate}</p>
                      </div>

                      {/* View Details Button */}
                      <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg py-3 font-semibold flex items-center justify-center gap-2">
                        View Campaign Details
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Draft Campaigns Section */}
        {draftCampaigns.length > 0 && (
          <section>
            <div className="mb-12">
              <div className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full">
                <p className="font-heading text-sm font-bold text-blue-700 uppercase tracking-wider">📋 Coming Soon</p>
              </div>
              <h2 className="font-heading text-4xl font-bold text-blue-900">
                Upcoming <span className="text-blue-600 italic">Campaigns</span>
              </h2>
              <p className="font-paragraph text-lg text-blue-700 mt-2">
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
                    className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-blue-200"
                  >
                    {/* Campaign Image */}
                    {campaign.mainCampaignImage && (
                      <div className="relative h-48 overflow-hidden bg-blue-100">
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
                        <h3 className="font-heading text-xl font-bold text-blue-900 mb-1">
                          {campaign.campaignTitle}
                        </h3>
                        <p className="font-paragraph text-sm text-blue-700 line-clamp-2">
                          {campaign.projectDescription}
                        </p>
                      </div>

                      {/* Goal Info */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                            <span className="font-paragraph text-sm text-blue-700">Goal:</span>
                          </div>
                          <span className="font-heading font-bold text-blue-900">
                            £{campaign.fundraisingGoal?.toLocaleString() || '0'}
                          </span>
                        </div>
                      </div>

                      {/* Notify Button */}
                      <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg py-2 font-semibold">
                        Notify Me
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* No Campaigns */}
        {campaigns.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <AlertCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h2 className="font-heading text-3xl font-bold text-blue-900 mb-2">No Campaigns Yet</h2>
            <p className="font-paragraph text-lg text-blue-700 mb-8">
              Check back soon for exciting new campaigns!
            </p>
            <Link to="/admin-login">
              <Button className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-8 py-3 font-semibold">
                Admin Dashboard
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12 border-t-4 border-blue-700 mt-20">
        <div className="max-w-[120rem] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
            <div className="space-y-4">
              <h3 className="font-heading text-2xl font-bold">Crowdfunding Platform</h3>
              <p className="font-paragraph text-blue-100">
                Supporting meaningful causes through community fundraising.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-heading text-xl font-bold">Quick Links</h4>
              <nav className="flex flex-col gap-2">
                <Link to="/" className="font-paragraph text-blue-100 hover:text-white transition-colors">
                  Campaigns
                </Link>
                <Link to="/home" className="font-paragraph text-blue-100 hover:text-white transition-colors">
                  Original Home
                </Link>
                <Link to="/gallery" className="font-paragraph text-blue-100 hover:text-white transition-colors">
                  Gallery
                </Link>
              </nav>
            </div>

            <div className="space-y-4">
              <h4 className="font-heading text-xl font-bold">Support</h4>
              <p className="font-paragraph text-blue-100">
                Have questions? Contact us for more information about our campaigns.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-blue-700 text-center">
            <p className="font-paragraph text-sm text-blue-100">
              © {new Date().getFullYear()} Crowdfunding Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
