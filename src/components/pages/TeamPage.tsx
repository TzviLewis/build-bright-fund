import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BaseCrudService } from '@/integrations';
import { Teams, Donations } from '@/entities';
import { ArrowLeft, Heart, Users, TrendingUp, MessageCircle, Calendar, Award, Share2, Download, BarChart3, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';

interface DonationReply {
  id: string;
  message: string;
  timestamp: string;
}

export default function TeamPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Teams | null>(null);
  const [donations, setDonations] = useState<Donations[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'supporters'>('overview');

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      
      const teamData = await BaseCrudService.getById<Teams>('teams', teamId || '');
      setTeam(teamData);

      const { items: donationItems } = await BaseCrudService.getAll<Donations>('donations');
      
      const teamDonations = donationItems.filter(d => d.teamId === teamId && d.status === 'completed');
      setDonations(teamDonations);
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReplies = (donationId: string): DonationReply[] => {
    const donation = donations.find(d => d._id === donationId);
    if (!donation || !donation.replies) return [];
    try {
      return JSON.parse(donation.replies);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full" />
          <p className="font-heading text-primary text-lg">Loading team profile...</p>
        </motion.div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-primary/10 shadow-sm">
          <div className="max-w-[120rem] mx-auto px-8 py-6">
            <Link to="/">
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg px-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaign
              </Button>
            </Link>
          </div>
        </header>
        <div className="max-w-[120rem] mx-auto px-8 py-20 text-center">
          <h1 className="font-heading text-4xl font-bold text-primary mb-4">Team Not Found</h1>
          <p className="font-paragraph text-lg text-primary/80 mb-8">
            The team you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/">
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg px-8 py-6 text-lg font-semibold">
              Return to Campaign
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalRaised = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const progressPercentage = team.fundraisingGoal 
    ? Math.min((totalRaised / team.fundraisingGoal) * 100, 100)
    : 0;

  const completedDonations = donations.filter(d => d.status === 'completed').length;
  const totalDonors = new Set(donations.map(d => d.donorEmail)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-secondary/5">
      {/* Header */}
      <header className="bg-white border-b border-primary/10 shadow-sm sticky top-0 z-20">
        <div className="max-w-[120rem] mx-auto px-8 py-6 flex justify-between items-center">
          <Link to="/">
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg px-6 font-heading"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              className="border-primary/20 text-primary hover:bg-primary/5 rounded-lg px-6 font-heading"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-[120rem] mx-auto px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Team Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="inline-block">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary font-heading font-semibold text-sm">
                  <Users className="w-4 h-4" />
                  Team Profile
                </span>
              </div>
              <h1 className="font-heading text-6xl lg:text-7xl font-bold leading-tight text-primary">
                {team.teamName}
              </h1>
              {team.teamDescription && (
                <p className="font-paragraph text-xl text-primary/70 leading-relaxed">
                  {team.teamDescription}
                </p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-primary/10 p-6 shadow-sm"
              >
                <p className="font-paragraph text-sm text-primary/60 mb-2">Total Raised</p>
                <p className="font-heading text-3xl font-bold text-secondary">
                  £{totalRaised.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl border border-primary/10 p-6 shadow-sm"
              >
                <p className="font-paragraph text-sm text-primary/60 mb-2">Supporters</p>
                <p className="font-heading text-3xl font-bold text-primary">
                  {completedDonations}
                </p>
              </motion.div>
            </div>

            {/* CTA Button */}
            <Link to="/#donate">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-white rounded-lg px-8 py-6 text-lg font-heading font-semibold w-full lg:w-auto"
              >
                <Heart className="w-5 h-5 mr-2" />
                Support This Team
              </Button>
            </Link>
          </motion.div>

          {/* Right: Team Logo */}
          {team.teamLogo && (
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/10">
                <Image 
                  src={team.teamLogo}
                  alt={team.teamName || 'Team logo'}
                  className="w-full h-[500px] object-cover"
                  width={800}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Progress Section */}
      <section className="w-full bg-white border-y border-primary/10 py-16">
        <div className="max-w-[120rem] mx-auto px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-secondary" />
              <h2 className="font-heading text-3xl font-bold text-primary">Fundraising Progress</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Progress Bar */}
              <div className="md:col-span-3 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="font-heading text-5xl font-bold text-secondary">
                    £{totalRaised.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                  <span className="font-paragraph text-lg text-primary/70">
                    of £{team.fundraisingGoal?.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'} goal
                  </span>
                </div>
                
                <div className="w-full bg-primary/10 rounded-full h-8 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${progressPercentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="bg-gradient-to-r from-secondary to-secondary/80 h-full rounded-full"
                  />
                </div>
                
                <p className="font-paragraph text-lg text-primary/80">
                  <span className="font-bold text-secondary">{progressPercentage.toFixed(1)}%</span> of goal achieved with the support of <span className="font-bold text-primary">{completedDonations}</span> generous donor{completedDonations !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-primary/5 rounded-xl p-6 border border-primary/10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                  <p className="font-paragraph text-sm text-primary/60">Average Donation</p>
                </div>
                <p className="font-heading text-3xl font-bold text-primary">
                  £{completedDonations > 0 ? (totalRaised / completedDonations).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-secondary/5 rounded-xl p-6 border border-secondary/10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-6 h-6 text-secondary" />
                  <p className="font-paragraph text-sm text-primary/60">Total Donors</p>
                </div>
                <p className="font-heading text-3xl font-bold text-secondary">
                  {totalDonors}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-primary/5 rounded-xl p-6 border border-primary/10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-6 h-6 text-secondary" />
                  <p className="font-paragraph text-sm text-primary/60">Total Donations</p>
                </div>
                <p className="font-heading text-3xl font-bold text-primary">
                  {completedDonations}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="w-full max-w-[120rem] mx-auto px-8 py-12">
        <div className="flex gap-4 mb-12 border-b border-primary/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`font-heading font-semibold text-lg pb-4 px-2 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-secondary text-primary'
                : 'border-transparent text-primary/60 hover:text-primary'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('supporters')}
            className={`font-heading font-semibold text-lg pb-4 px-2 border-b-2 transition-all ${
              activeTab === 'supporters'
                ? 'border-secondary text-primary'
                : 'border-transparent text-primary/60 hover:text-primary'
            }`}
          >
            <Heart className="w-5 h-5 inline mr-2" />
            Supporters ({completedDonations})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl border border-primary/10 p-8 shadow-sm">
                <h3 className="font-heading text-2xl font-bold text-primary mb-4">About This Team</h3>
                <p className="font-paragraph text-lg text-primary/80 leading-relaxed">
                  {team.teamDescription || 'This team is dedicated to supporting our fundraising campaign.'}
                </p>
                {team.memberCount && (
                  <div className="mt-6 pt-6 border-t border-primary/10">
                    <p className="font-paragraph text-sm text-primary/60 mb-2">Team Members</p>
                    <p className="font-heading text-3xl font-bold text-secondary">{team.memberCount}</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-primary/10 p-8 shadow-sm">
                <h3 className="font-heading text-2xl font-bold text-primary mb-4">Impact</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-secondary/5 rounded-lg">
                    <span className="font-paragraph text-primary/70">Funds Raised</span>
                    <span className="font-heading font-bold text-secondary">
                      £{totalRaised.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
                    <span className="font-paragraph text-primary/70">Progress</span>
                    <span className="font-heading font-bold text-primary">{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-secondary/5 rounded-lg">
                    <span className="font-paragraph text-primary/70">Remaining</span>
                    <span className="font-heading font-bold text-secondary">
                      £{Math.max(0, (team.fundraisingGoal || 0) - totalRaised).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Supporters Tab */}
        {activeTab === 'supporters' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {donations.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-primary/10">
                <Heart className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                <p className="font-heading text-2xl font-bold text-primary mb-2">No donations yet</p>
                <p className="font-paragraph text-lg text-primary/60 mb-8">
                  Be the first to support this amazing team!
                </p>
                <Link to="/#donate">
                  <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg px-8 py-6 text-lg font-semibold">
                    Make a Donation
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {donations.map((donation, index) => {
                  const replies = getReplies(donation._id);
                  return (
                    <motion.div
                      key={donation._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="bg-white rounded-xl border border-primary/10 hover:border-secondary/30 transition-all shadow-sm hover:shadow-md overflow-hidden"
                    >
                      {/* Donation Header */}
                      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-8 border-b border-primary/10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                              <Heart className="w-7 h-7 text-secondary" />
                            </div>
                            <div>
                              <p className="font-heading text-xl font-bold text-primary">
                                {donation.donorName || 'Anonymous Supporter'}
                              </p>
                              <p className="font-paragraph text-sm text-primary/60 flex items-center gap-1 mt-1">
                                <Calendar className="w-4 h-4" />
                                {donation.donationDate ? new Date(donation.donationDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date unknown'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-heading text-4xl font-bold text-secondary">
                              £{donation.amount?.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Donation Message */}
                      {donation.donorMessage && (
                        <div className="px-8 py-6 bg-primary/5 border-b border-primary/10">
                          <p className="font-paragraph text-base text-primary/80 italic border-l-4 border-secondary pl-4">
                            "{donation.donorMessage}"
                          </p>
                        </div>
                      )}

                      {/* Replies Section */}
                      {replies.length > 0 && (
                        <div className="px-8 py-6 bg-secondary/5 border-b border-secondary/10">
                          <div className="flex items-center gap-2 mb-4">
                            <MessageCircle className="w-5 h-5 text-secondary" />
                            <p className="font-heading font-bold text-secondary">Team Response{replies.length > 1 ? 's' : ''}</p>
                          </div>
                          <div className="space-y-4">
                            {replies.map((reply) => (
                              <div key={reply.id} className="bg-white rounded-lg p-4 border border-secondary/20">
                                <p className="font-paragraph text-base text-primary/80 mb-2">{reply.message}</p>
                                <p className="font-paragraph text-xs text-primary/50 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(reply.timestamp).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer Stats */}
                      <div className="px-8 py-4 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {replies.length > 0 && (
                            <div className="flex items-center gap-2 text-secondary">
                              <Award className="w-4 h-4" />
                              <span className="font-paragraph text-sm font-semibold">{replies.length} Response{replies.length > 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                        <p className="font-paragraph text-xs text-primary/60">
                          {donation.isAnonymous ? 'Anonymous Donation' : 'Named Donation'}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </section>

      {/* Call to Action */}
      <section className="w-full bg-gradient-to-r from-primary to-primary/90 py-20 mt-20">
        <div className="max-w-[120rem] mx-auto px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <h2 className="font-heading text-5xl font-bold text-primary-foreground">
              Make a Difference Today
            </h2>
            <p className="font-paragraph text-xl text-primary-foreground/90">
              Support {team.teamName} in their mission to make a positive impact
            </p>

            <Link to="/#donate">
              <Button 
                size="lg" 
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg px-8 py-6 text-lg font-heading font-semibold inline-flex items-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Donate Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16 border-t border-primary/20">
        <div className="max-w-[120rem] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-4">
              <h4 className="font-heading text-xl font-bold">Team Info</h4>
              <p className="font-paragraph text-base text-primary-foreground/80">
                {team.teamName} is committed to making a positive impact through our fundraising efforts.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-heading text-xl font-bold">Quick Links</h4>
              <nav className="flex flex-col gap-3">
                <Link to="/" className="font-paragraph text-base text-primary-foreground/80 hover:text-secondary transition-colors">
                  Campaign Details
                </Link>
                <Link to="/#donate" className="font-paragraph text-base text-primary-foreground/80 hover:text-secondary transition-colors">
                  Make a Donation
                </Link>
                <Link to="/gallery" className="font-paragraph text-base text-primary-foreground/80 hover:text-secondary transition-colors">
                  Gallery
                </Link>
              </nav>
            </div>

            <div className="space-y-4">
              <h4 className="font-heading text-xl font-bold">Support</h4>
              <p className="font-paragraph text-base text-primary-foreground/80">
                Have questions? Contact us for more information about how you can help.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-primary-foreground/20 text-center">
            <p className="font-paragraph text-sm text-primary-foreground/70">
              © {new Date().getFullYear()} School Fundraising Campaign. All rights reserved. | Secure & Trusted Donations
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
