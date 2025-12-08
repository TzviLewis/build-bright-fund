import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Image } from '@/components/ui/image';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails, Donations, Matchers, Teams } from '@/entities';
import { ArrowRight, Heart, Users, Target, TrendingUp, Award, Zap, AlertCircle, CheckCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import DonationWidget from '@/components/DonationWidget';
import { useDonationStore } from '@/stores/donationStore';
import CountdownTimer from '@/components/CountdownTimer';
import CircularCountdownTimer from '@/components/CircularCountdownTimer';
import ConfettiAnimation from '@/components/ConfettiAnimation';

export default function HomePage() {
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [donations, setDonations] = useState<Donations[]>([]);
  const [matchers, setMatchers] = useState<Matchers[]>([]);
  const [teams, setTeams] = useState<Teams[]>([]);
  const [loading, setLoading] = useState(true);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [donorMessage, setDonorMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [previousGoalAchieved, setPreviousGoalAchieved] = useState(false);
  const { addNotification } = useDonationStore();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Check if goal was just achieved
    const totalRaised = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const mainGoalAchieved = campaign?.fundraisingGoal && totalRaised >= campaign.fundraisingGoal;
    
    if (mainGoalAchieved && !previousGoalAchieved) {
      setShowConfetti(true);
      setPreviousGoalAchieved(true);
      // Auto-hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3500);
    }
  }, [donations, campaign, previousGoalAchieved]);

  const loadData = async () => {
    try {
      const { items: campaignItems } = await BaseCrudService.getAll<CampaignDetails>('campaigndetails');
      const { items: donationItems } = await BaseCrudService.getAll<Donations>('donations');
      const { items: matcherItems } = await BaseCrudService.getAll<Matchers>('matchers');
      const { items: teamItems } = await BaseCrudService.getAll<Teams>('teams');
      
      if (campaignItems.length > 0) {
        const campaignData = campaignItems[0];
        // Set campaign times to 10:00 AM for start and 22:00 (10:00 PM) for end
        campaignData.campaignStartTime = '10:00 AM';
        campaignData.campaignEndTime = '22:00';
        setCampaign(campaignData);
      }
      setDonations(donationItems.filter(d => d.status === 'completed'));
      setMatchers(matcherItems.filter(m => m.status === 'active'));
      setTeams(teamItems);
    } catch (error) {
      console.error('Error loading data:', error);
      setSubmitError('Failed to load campaign data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    try {
      // Validation
      if (!donorEmail) {
        setSubmitError('Email address is required');
        setSubmitting(false);
        return;
      }
      if (!amount || parseFloat(amount) <= 0) {
        setSubmitError('Please enter a valid donation amount greater than $0');
        setSubmitting(false);
        return;
      }
      if (!isAnonymous && !donorName) {
        setSubmitError('Please enter your name or choose to donate anonymously');
        setSubmitting(false);
        return;
      }

      const donationData: Donations = {
        _id: crypto.randomUUID(),
        donorName: isAnonymous ? 'Anonymous' : donorName,
        donorEmail,
        amount: parseFloat(amount),
        donationDate: new Date().toISOString(),
        isAnonymous,
        donorMessage,
        status: 'completed',
        teamId: selectedTeamId || undefined
      };

      await BaseCrudService.create('donations', donationData);

      // Add notification to store for popup display
      addNotification({
        ...donationData,
        pageName: 'Home Page',
      });

      setSubmitSuccess(true);
      setDonorName('');
      setDonorEmail('');
      setAmount('');
      setDonorMessage('');
      setIsAnonymous(false);
      setSelectedTeamId('');
      
      await loadData();
      
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to process donation. Please try again.';
      console.error('Error submitting donation:', error);
      setSubmitError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const totalRaised = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const progressPercentage = campaign?.fundraisingGoal 
    ? Math.min((totalRaised / campaign.fundraisingGoal) * 100, 100)
    : 0;
  
  const mainGoalAchieved = campaign?.fundraisingGoal && totalRaised >= campaign.fundraisingGoal;
  const bonusGoalAmount = campaign?.bonusGoal || 0;
  const totalGoal = (campaign?.fundraisingGoal || 0) + bonusGoalAmount;
  const bonusProgressPercentage = bonusGoalAmount && mainGoalAchieved
    ? Math.min(((totalRaised - (campaign?.fundraisingGoal || 0)) / bonusGoalAmount) * 100, 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary font-heading text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {showConfetti && <ConfettiAnimation />}
      {/* Header */}
      <header className="bg-background border-b border-primary/10 shadow-sm">
        <div className="max-w-[120rem] mx-auto px-8 py-6 flex justify-between items-center">

          <nav className="flex items-center gap-8">
            <a href="#campaign" className="font-paragraph text-base text-primary hover:text-secondary transition-colors">
              Campaign
            </a>
            <a href="#donate" className="font-paragraph text-base text-primary hover:text-secondary transition-colors">
              Donate
            </a>
            <a href="#progress" className="font-paragraph text-base text-primary hover:text-secondary transition-colors">
              Progress
            </a>
            <Link to="/gallery">
              <a className="font-paragraph text-base text-primary hover:text-secondary transition-colors">
                Gallery
              </a>
            </Link>
            <Link to="/admin-login">
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full px-6"
              >
                ADMIN
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      {/* Campaign Media Hero Section */}
      <section className="w-full bg-primary/5 py-16">
        <div className="max-w-[120rem] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 gap-x-[99px] gap-y-0">
            {/* Campaign Video */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="rounded-lg overflow-hidden shadow-xl"
            >
              <div className="relative w-full h-80 bg-primary/10 flex items-center justify-center">
                <video
                  src="https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.mp4?id=campaign-video-main"
                  controls
                  className="w-full h-full object-cover"
                  poster="https://static.wixstatic.com/media/28ba1c_85fe0b52ac454146ac98eccc491782b9~mv2.png?originWidth=512&originHeight=320"
                />
              </div>
            </motion.div>

            {/* Campaign GIF */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="rounded-lg overflow-hidden shadow-xl"
            >
              <Image
                src="https://static.wixstatic.com/media/28ba1c_61d66837cb8a4faa9ec76959ec0581ba~mv2.jpg"
                className="w-full h-80 object-cover"
                width={600}
                originWidth={1600}
                originHeight={896} />
            </motion.div>
          </div>
        </div>
      </section>
      {/* Hero Section - Inspired by reference image */}
      <section className="w-full max-w-[120rem] mx-auto px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="font-heading text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-primary block">{campaign?.campaignTitle || 'Building Our Future'}</span>
                <span className="text-secondary block italic">Together</span>
              </h1>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <a href="#donate">
                <Button 
                  size="lg" 
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-8 py-6 text-lg font-semibold"
                >
                  DONATE NOW
                </Button>
              </a>
              <a href="#campaign">

              </a>
            </div>
          </motion.div>

          {/* Right: Image */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <Image 
                src={campaign?.mainCampaignImage || 'https://static.wixstatic.com/media/28ba1c_c73226414fee4a59bdb7266466a978bb~mv2.png?originWidth=768&originHeight=576'}
                alt="New school building vision"
                className="w-full h-[600px] object-cover"
                width={800}
              />
              {/* Accent Circle */}
              <div className="absolute bottom-8 left-8 bg-secondary rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
                <ArrowRight className="w-8 h-8 text-secondary-foreground" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Three Column Features - Inspired by reference image */}
      {/* Campaign Details */}
      <section className="w-full max-w-[120rem] mx-auto px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="font-heading text-5xl font-bold text-primary leading-tight">
              The Vision for <span className="text-secondary italic">Tomorrow</span>
            </h2>
            <div className="prose prose-lg max-w-none">

            </div>
            {campaign?.campaignStartDate && campaign?.campaignEndDate && (
              <div className="pt-6 space-y-4 border-t border-primary/10">
                <h3 className="font-heading text-2xl font-bold text-primary">{"Campaign"}</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="font-paragraph text-sm text-primary/60 uppercase tracking-wider">Start Date</p>
                    <p className="font-heading text-xl font-bold text-primary">
                      {new Date(campaign.campaignStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    {campaign.campaignStartTime && (
                      <p className="font-paragraph text-base text-secondary font-semibold">
                        {typeof campaign.campaignStartTime === 'string' 
                          ? campaign.campaignStartTime 
                          : new Date(campaign.campaignStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="font-paragraph text-sm text-primary/60 uppercase tracking-wider">End Date</p>
                    <p className="font-heading text-xl font-bold text-primary">
                      {new Date(campaign.campaignEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    {campaign.campaignEndTime && (
                      <p className="font-paragraph text-base text-secondary font-semibold">
                        {typeof campaign.campaignEndTime === 'string' 
                          ? campaign.campaignEndTime 
                          : new Date(campaign.campaignEndTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-primary/5 rounded-lg p-10 space-y-6"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-10 h-10 text-secondary" />
              <h3 className="font-heading text-3xl font-bold text-primary">Campaign Progress</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="font-heading text-5xl font-bold text-secondary">
                  £{totalRaised.toLocaleString()}
                </span>
                <span className="font-paragraph text-xl text-primary/70">
                  of £{campaign?.fundraisingGoal?.toLocaleString() || '0'} goal
                </span>
              </div>
              
              <div className="w-full bg-primary/10 rounded-full h-6 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${progressPercentage}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="bg-secondary h-full rounded-full"
                />
              </div>
              
              <h3 className="font-paragraph text-primary/80 uppercase text-lg">
                <span className="font-bold text-secondary">{progressPercentage.toFixed(1)}%</span> of our goal achieved with the support of <span className="font-bold">{donations.length}</span> generous donors
              </h3>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Bonus Goal Section - Only show if main goal is achieved */}
      {mainGoalAchieved && bonusGoalAmount > 0 && (
        <section className="w-full bg-gradient-to-r from-secondary/10 to-secondary/5 py-20 border-t-4 border-secondary">
          <div className="max-w-[120rem] mx-auto px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary text-secondary-foreground rounded-full">
                  <p className="font-heading text-sm font-bold uppercase tracking-wider">🎯 Bonus Goal Unlocked</p>
                </div>
                <h2 className="font-heading text-5xl font-bold text-primary mb-4">
                  We've Reached Our <span className="text-secondary italic">Main Goal!</span>
                </h2>
                <p className="font-paragraph text-xl text-primary/80 max-w-2xl mx-auto">
                  {campaign?.bonusGoalDescription || 'Thanks to your incredible support, we\'ve achieved our primary goal! Now we\'re reaching for an even bigger dream.'}
                </p>
              </div>

              <div className="bg-background rounded-lg p-10 shadow-lg space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <p className="font-paragraph text-sm text-primary/60 uppercase tracking-wider mb-2">Main Goal</p>
                    <p className="font-heading text-3xl font-bold text-primary">
                      £{campaign?.fundraisingGoal?.toLocaleString()}
                    </p>
                    <p className="font-paragraph text-sm text-secondary font-semibold mt-1">✓ Achieved</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="font-paragraph text-sm text-primary/60 uppercase tracking-wider mb-2">Bonus Goal</p>
                    <p className="font-heading text-3xl font-bold text-secondary">
                      £{bonusGoalAmount.toLocaleString()}
                    </p>
                    <p className="font-paragraph text-sm text-primary/70 mt-1">Additional Target</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="font-paragraph text-sm text-primary/60 uppercase tracking-wider mb-2">Total Goal</p>
                    <p className="font-heading text-3xl font-bold text-primary">
                      £{totalGoal.toLocaleString()}
                    </p>
                    <p className="font-paragraph text-sm text-primary/70 mt-1">Combined Target</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="font-paragraph text-lg text-primary/80">
                      Bonus Progress: <span className="font-bold text-secondary">{bonusProgressPercentage.toFixed(1)}%</span>
                    </span>
                    <span className="font-heading text-2xl font-bold text-secondary">
                      £{Math.max(0, totalRaised - (campaign?.fundraisingGoal || 0)).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="w-full bg-primary/10 rounded-full h-8 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${bonusProgressPercentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="bg-gradient-to-r from-secondary to-secondary/80 h-full rounded-full"
                    />
                  </div>
                  
                  <p className="font-paragraph text-base text-primary/80 text-center pt-2">
                    of £{bonusGoalAmount.toLocaleString()} bonus goal
                  </p>
                </div>
              </div>

              <div className="text-center mt-8">
                <a href="#donate">
                  <Button 
                    size="lg" 
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-8 py-6 text-lg font-semibold"
                  >
                    CONTINUE SUPPORTING
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      )}
      {/* Countdown Timer Section */}
      {campaign?.campaignEndDate && (
        <section className="w-full bg-gradient-to-r from-primary/5 to-secondary/5 py-20">
          <div className="max-w-[120rem] mx-auto px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-4xl font-bold text-primary mb-4">
                Time is <span className="text-secondary italic">Running Out</span>
              </h2>

            </div>
            <div className="flex justify-center">
              <CircularCountdownTimer endDate={campaign.campaignEndDate} startDate={campaign.campaignStartDate} />
            </div>
          </div>
        </section>
      )}
      {/* Donation Form */}
      <section id="donate" className="w-full bg-primary py-20">
        <div className="max-w-[100rem] mx-auto px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="font-heading text-5xl font-bold text-primary-foreground mb-4">
                Make Your <span className="italic text-secondary">Contribution</span>
              </h2>

            </div>

            <div className="bg-background rounded-lg p-10 shadow-2xl">
              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 bg-secondary/10 border-2 border-secondary rounded-lg flex items-start gap-3"
                >
                  <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-paragraph font-semibold text-secondary">
                      Donation Received Successfully!
                    </p>
                    <p className="font-paragraph text-sm text-secondary/80 mt-1">
                      Thank you for your generous donation. Your support makes a real difference in our community.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="text-secondary hover:text-secondary/70 flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 bg-destructive/10 border-2 border-destructive rounded-lg flex items-start gap-3"
                >
                  <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-paragraph font-semibold text-destructive">
                      Unable to Process Donation
                    </p>
                    <p className="font-paragraph text-sm text-destructive/80 mt-1">
                      {submitError}
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitError(null)}
                    className="text-destructive hover:text-destructive/70 flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              <form onSubmit={handleSubmitDonation} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-paragraph text-base font-semibold text-primary">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      required={!isAnonymous}
                      disabled={isAnonymous}
                      className="border-primary/20 focus:border-secondary"
                      placeholder="John Smith"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-base font-semibold text-primary">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      required
                      className="border-primary/20 focus:border-secondary"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-paragraph text-base font-semibold text-primary">
                    Donation Amount (£)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="border-primary/20 focus:border-secondary text-2xl font-bold"
                    placeholder="100.00"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-paragraph text-base font-semibold text-primary">
                    Donate as Part of a Team (Optional)
                  </label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:border-secondary focus:outline-none font-paragraph"
                  >
                    <option value="">Select a team (or donate individually)</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.teamName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-paragraph text-base font-semibold text-primary">
                    Message (Optional)
                  </label>
                  <Textarea
                    value={donorMessage}
                    onChange={(e) => setDonorMessage(e.target.value)}
                    className="border-primary/20 focus:border-secondary min-h-[100px]"
                    placeholder="Share why you're supporting this campaign..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                  />
                  <label
                    htmlFor="anonymous"
                    className="font-paragraph text-base text-primary cursor-pointer"
                  >
                    Make this donation anonymous
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full py-6 text-xl font-bold transition-all disabled:opacity-70"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    'SUBMIT DONATION'
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Matchers Section */}
      <section className="w-full bg-secondary/10 py-20">
        <div className="max-w-[120rem] mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-5xl font-bold text-primary mb-4">
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
                  className="bg-background rounded-lg p-8 shadow-lg border-2 border-secondary/20 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading text-2xl font-bold text-primary">
                        {matcher.matcherName}
                      </h3>

                    </div>

                  </div>

                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Teams Section */}
      <section className="w-full max-w-[120rem] mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="font-heading text-5xl font-bold text-primary mb-4">
            Fundraising <span className="text-secondary italic">Teams</span>
          </h2>

        </div>

        {teams.length === 0 ? (
          <p className="font-paragraph text-lg text-primary/60 text-center py-8">
            No teams yet. Be the first to create one!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teams.map((team) => {
              const teamDonations = donations.filter(d => d.teamId === team._id);
              const teamTotal = teamDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
              const teamProgress = team.fundraisingGoal 
                ? Math.min((teamTotal / team.fundraisingGoal) * 100, 100)
                : 0;

              return (
                <motion.div
                  key={team._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-primary/5 rounded-lg p-8 space-y-6 border-2 border-primary/10 hover:border-secondary/30 transition-colors cursor-pointer"
                >
                  {team.teamLogo && (
                    <div className="w-full h-40 rounded-lg overflow-hidden bg-background">
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

                  </div>
                  <div className="grid grid-cols-2 gap-4">

                    <div className="bg-background rounded-lg p-4">
                      <p className="font-paragraph text-sm text-primary/60">Raised</p>
                      <p className="font-heading text-2xl font-bold text-secondary">
                        £{teamTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="font-paragraph text-sm text-primary/60">Goal</span>
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
                        className="bg-secondary h-full rounded-full"
                      />
                    </div>
                    <p className="font-paragraph text-sm text-primary/70 text-right">
                      {teamProgress.toFixed(1)}% complete
                    </p>
                  </div>
                  <Link to={`/team/${team._id}`}>
                    <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full">
                      View Team Details
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
      <section id="progress" className="w-full max-w-[120rem] mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="font-heading text-5xl font-bold text-primary mb-4">
            Our Generous <span className="text-secondary italic">Supporters</span>
          </h2>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.slice(0, 9).map((donation) => (
            <motion.div
              key={donation._id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-primary/5 rounded-lg p-6 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-heading text-xl font-bold text-primary">
                    {donation.donorName || 'Anonymous'}
                  </p>
                  <p className="font-paragraph text-sm text-primary/60">
                    {donation.donationDate ? new Date(donation.donationDate).toLocaleDateString() : ''}
                  </p>
                </div>
                <p className="font-heading text-2xl font-bold text-secondary">
                  £{donation.amount?.toLocaleString()}
                </p>
              </div>
              {donation.donorMessage && (
                <p className="font-paragraph text-base text-primary/70 italic">
                  "{donation.donorMessage}"
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16 border-t border-primary/20">
        <div className="max-w-[120rem] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-4">
              <h3 className="font-heading text-2xl font-bold">SCHOOL CAMPAIGN</h3>

            </div>

            <div className="space-y-4">
              <h4 className="font-heading text-xl font-bold">Quick Links</h4>
              <nav className="flex flex-col gap-3">
                <a href="#campaign" className="font-paragraph text-base text-primary-foreground/80 hover:text-secondary transition-colors">
                  Campaign Details
                </a>
                <a href="#donate" className="font-paragraph text-base text-primary-foreground/80 hover:text-secondary transition-colors">
                  Make a Donation
                </a>
                <a href="#progress" className="font-paragraph text-base text-primary-foreground/80 hover:text-secondary transition-colors">
                  View Progress
                </a>
              </nav>
            </div>

            <div className="space-y-4">
              <h4 className="font-heading text-xl font-bold">Support</h4>

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
