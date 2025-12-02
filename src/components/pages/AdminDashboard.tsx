import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails, Donations, Matchers, Teams } from '@/entities';
import { ArrowLeft, Save, DollarSign, Users, TrendingUp, Calendar, Award, Trash2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';

export default function AdminDashboard() {
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [donations, setDonations] = useState<Donations[]>([]);
  const [matchers, setMatchers] = useState<Matchers[]>([]);
  const [teams, setTeams] = useState<Teams[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showNewMatcher, setShowNewMatcher] = useState(false);
  const [showNewTeam, setShowNewTeam] = useState(false);

  // Campaign form fields
  const [campaignTitle, setCampaignTitle] = useState('');
  const [fundraisingGoal, setFundraisingGoal] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [promotionalText, setPromotionalText] = useState('');
  const [mainCampaignImage, setMainCampaignImage] = useState('');
  const [campaignStartDate, setCampaignStartDate] = useState('');
  const [campaignEndDate, setCampaignEndDate] = useState('');

  // Matcher form fields
  const [matcherName, setMatcherName] = useState('');
  const [matchingAmount, setMatchingAmount] = useState('');
  const [matchingPercentage, setMatchingPercentage] = useState('');
  const [matcherStatus, setMatcherStatus] = useState('active');
  const [contactEmail, setContactEmail] = useState('');
  const [matchingLimit, setMatchingLimit] = useState('');

  // Team form fields
  const [teamName, setTeamName] = useState('');
  const [teamGoal, setTeamGoal] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [memberCount, setMemberCount] = useState('');
  const [teamLogo, setTeamLogo] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { items: campaignItems } = await BaseCrudService.getAll<CampaignDetails>('campaigndetails');
      const { items: donationItems } = await BaseCrudService.getAll<Donations>('donations');
      const { items: matcherItems } = await BaseCrudService.getAll<Matchers>('matchers');
      const { items: teamItems } = await BaseCrudService.getAll<Teams>('teams');
      
      if (campaignItems.length > 0) {
        const camp = campaignItems[0];
        setCampaign(camp);
        setCampaignTitle(camp.campaignTitle || '');
        setFundraisingGoal(camp.fundraisingGoal?.toString() || '');
        setProjectDescription(camp.projectDescription || '');
        setPromotionalText(camp.promotionalText || '');
        setMainCampaignImage(camp.mainCampaignImage || '');
        setCampaignStartDate(camp.campaignStartDate ? new Date(camp.campaignStartDate).toISOString().split('T')[0] : '');
        setCampaignEndDate(camp.campaignEndDate ? new Date(camp.campaignEndDate).toISOString().split('T')[0] : '');
      }
      setDonations(donationItems);
      setMatchers(matcherItems);
      setTeams(teamItems);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const campaignData: CampaignDetails = {
        _id: campaign?._id || crypto.randomUUID(),
        campaignTitle,
        fundraisingGoal: parseFloat(fundraisingGoal),
        projectDescription,
        promotionalText,
        mainCampaignImage,
        campaignStartDate: campaignStartDate ? new Date(campaignStartDate).toISOString() : undefined,
        campaignEndDate: campaignEndDate ? new Date(campaignEndDate).toISOString() : undefined,
      };

      if (campaign?._id) {
        await BaseCrudService.update('campaigndetails', campaignData);
      } else {
        await BaseCrudService.create('campaigndetails', campaignData);
      }

      setSaveSuccess(true);
      await loadData();
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving campaign:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMatcher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await BaseCrudService.create('matchers', {
        _id: crypto.randomUUID(),
        matcherName,
        matchingAmount: parseFloat(matchingAmount),
        matchingPercentage: parseFloat(matchingPercentage),
        status: matcherStatus,
        contactEmail,
        matchingLimit: matchingLimit ? parseFloat(matchingLimit) : undefined
      });

      setShowNewMatcher(false);
      setMatcherName('');
      setMatchingAmount('');
      setMatchingPercentage('');
      setMatcherStatus('active');
      setContactEmail('');
      setMatchingLimit('');
      
      await loadData();
    } catch (error) {
      console.error('Error adding matcher:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMatcher = async (matcherId: string) => {
    try {
      await BaseCrudService.delete('matchers', matcherId);
      await loadData();
    } catch (error) {
      console.error('Error deleting matcher:', error);
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await BaseCrudService.create('teams', {
        _id: crypto.randomUUID(),
        teamName,
        fundraisingGoal: parseFloat(teamGoal),
        teamDescription,
        memberCount: parseInt(memberCount),
        teamLogo
      });

      setShowNewTeam(false);
      setTeamName('');
      setTeamGoal('');
      setTeamDescription('');
      setMemberCount('');
      setTeamLogo('');
      
      await loadData();
    } catch (error) {
      console.error('Error adding team:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await BaseCrudService.delete('teams', teamId);
      await loadData();
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const totalRaised = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const completedDonations = donations.filter(d => d.status === 'completed');
  const progressPercentage = campaign?.fundraisingGoal 
    ? Math.min((totalRaised / campaign.fundraisingGoal) * 100, 100)
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
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-[120rem] mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
              <p className="font-paragraph text-base text-primary-foreground/80 mt-1">
                Manage your fundraising campaign
              </p>
            </div>
            <Link to="/">
              <Button 
                variant="outline" 
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaign
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[120rem] mx-auto px-8 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-base font-semibold text-primary/70 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Total Raised
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-4xl font-bold text-secondary">
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
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-base font-semibold text-primary/70 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Total Donors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-4xl font-bold text-primary">
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
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-base font-semibold text-primary/70 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-4xl font-bold text-primary">
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
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-base font-semibold text-primary/70 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-4xl font-bold text-primary">
                  ${campaign?.fundraisingGoal?.toLocaleString() || '0'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="campaign" className="space-y-8">
          <TabsList className="bg-primary/10">
            <TabsTrigger value="campaign" className="font-paragraph data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Campaign Settings
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

          {/* Campaign Settings Tab */}
          <TabsContent value="campaign">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="font-heading text-2xl font-bold text-primary">
                  Edit Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {saveSuccess && (
                  <div className="mb-6 p-4 bg-secondary/10 border-2 border-secondary rounded-lg">
                    <p className="font-paragraph text-base text-secondary font-semibold">
                      Campaign details saved successfully!
                    </p>
                  </div>
                )}

                <form onSubmit={handleSaveCampaign} className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-paragraph text-base font-semibold text-primary">
                      Campaign Title
                    </label>
                    <Input
                      type="text"
                      value={campaignTitle}
                      onChange={(e) => setCampaignTitle(e.target.value)}
                      required
                      className="border-primary/20 focus:border-secondary"
                      placeholder="Building Our Future"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-base font-semibold text-primary">
                      Fundraising Goal ($)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={fundraisingGoal}
                      onChange={(e) => setFundraisingGoal(e.target.value)}
                      required
                      className="border-primary/20 focus:border-secondary"
                      placeholder="500000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-base font-semibold text-primary">
                      Promotional Text
                    </label>
                    <Textarea
                      value={promotionalText}
                      onChange={(e) => setPromotionalText(e.target.value)}
                      className="border-primary/20 focus:border-secondary min-h-[100px]"
                      placeholder="A compelling message to inspire donations..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-base font-semibold text-primary">
                      Project Description
                    </label>
                    <Textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="border-primary/20 focus:border-secondary min-h-[200px]"
                      placeholder="Detailed description of the building project..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-base font-semibold text-primary">
                      Main Campaign Image URL
                    </label>
                    <Input
                      type="text"
                      value={mainCampaignImage}
                      onChange={(e) => setMainCampaignImage(e.target.value)}
                      className="border-primary/20 focus:border-secondary"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-paragraph text-base font-semibold text-primary flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Campaign Start Date
                      </label>
                      <Input
                        type="date"
                        value={campaignStartDate}
                        onChange={(e) => setCampaignStartDate(e.target.value)}
                        className="border-primary/20 focus:border-secondary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-paragraph text-base font-semibold text-primary flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Campaign End Date
                      </label>
                      <Input
                        type="date"
                        value={campaignEndDate}
                        onChange={(e) => setCampaignEndDate(e.target.value)}
                        className="border-primary/20 focus:border-secondary"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-8 py-6 text-lg font-semibold"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {saving ? 'Saving...' : 'Save Campaign Details'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matchers Tab */}
          <TabsContent value="matchers">
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="font-heading text-2xl font-bold text-primary">
                    Manage Matchers
                  </CardTitle>
                  <Button
                    onClick={() => setShowNewMatcher(!showNewMatcher)}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Matcher
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {showNewMatcher && (
                  <form onSubmit={handleAddMatcher} className="space-y-6 p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
                    <h3 className="font-heading text-xl font-bold text-primary">New Matcher</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-paragraph text-base font-semibold text-primary">
                          Matcher Name
                        </label>
                        <Input
                          type="text"
                          value={matcherName}
                          onChange={(e) => setMatcherName(e.target.value)}
                          required
                          className="border-primary/20 focus:border-secondary"
                          placeholder="Company or Organization Name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-base font-semibold text-primary">
                          Contact Email
                        </label>
                        <Input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          required
                          className="border-primary/20 focus:border-secondary"
                          placeholder="contact@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-base font-semibold text-primary">
                          Matching Amount ($)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={matchingAmount}
                          onChange={(e) => setMatchingAmount(e.target.value)}
                          required
                          className="border-primary/20 focus:border-secondary"
                          placeholder="50000"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-base font-semibold text-primary">
                          Matching Percentage (%)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={matchingPercentage}
                          onChange={(e) => setMatchingPercentage(e.target.value)}
                          required
                          className="border-primary/20 focus:border-secondary"
                          placeholder="100"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-base font-semibold text-primary">
                          Matching Limit ($) - Optional
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={matchingLimit}
                          onChange={(e) => setMatchingLimit(e.target.value)}
                          className="border-primary/20 focus:border-secondary"
                          placeholder="100000"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-base font-semibold text-primary">
                          Status
                        </label>
                        <select
                          value={matcherStatus}
                          onChange={(e) => setMatcherStatus(e.target.value)}
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
                        disabled={saving}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-8"
                      >
                        {saving ? 'Adding...' : 'Add Matcher'}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowNewMatcher(false)}
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full px-8"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {matchers.length === 0 ? (
                  <p className="font-paragraph text-base text-primary/60 text-center py-8">
                    No matchers yet. Add one to boost donations!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {matchers.map((matcher) => (
                      <div key={matcher._id} className="bg-primary/5 rounded-lg p-6 border-2 border-primary/10 flex justify-between items-start">
                        <div className="space-y-2">
                          <h4 className="font-heading text-xl font-bold text-primary">
                            {matcher.matcherName}
                          </h4>
                          <p className="font-paragraph text-sm text-primary/70">
                            {matcher.contactEmail}
                          </p>
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div>
                              <p className="font-paragraph text-xs text-primary/60">Amount</p>
                              <p className="font-heading text-lg font-bold text-secondary">
                                ${matcher.matchingAmount?.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="font-paragraph text-xs text-primary/60">Rate</p>
                              <p className="font-heading text-lg font-bold text-primary">
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
                        <Button
                          onClick={() => handleDeleteMatcher(matcher._id)}
                          variant="outline"
                          className="border-destructive text-destructive hover:bg-destructive hover:text-destructiveforeground rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams">
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="font-heading text-2xl font-bold text-primary">
                    Manage Teams
                  </CardTitle>
                  <Button
                    onClick={() => setShowNewTeam(!showNewTeam)}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Team
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {showNewTeam && (
                  <form onSubmit={handleAddTeam} className="space-y-6 p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
                    <h3 className="font-heading text-xl font-bold text-primary">New Team</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-paragraph text-base font-semibold text-primary">
                          Team Name
                        </label>
                        <Input
                          type="text"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          required
                          className="border-primary/20 focus:border-secondary"
                          placeholder="Team Name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-base font-semibold text-primary">
                          Fundraising Goal ($)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={teamGoal}
                          onChange={(e) => setTeamGoal(e.target.value)}
                          required
                          className="border-primary/20 focus:border-secondary"
                          placeholder="50000"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-base font-semibold text-primary">
                          Number of Members
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={memberCount}
                          onChange={(e) => setMemberCount(e.target.value)}
                          required
                          className="border-primary/20 focus:border-secondary"
                          placeholder="10"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-paragraph text-base font-semibold text-primary">
                          Team Logo URL
                        </label>
                        <Input
                          type="text"
                          value={teamLogo}
                          onChange={(e) => setTeamLogo(e.target.value)}
                          className="border-primary/20 focus:border-secondary"
                          placeholder="https://example.com/logo.jpg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-paragraph text-base font-semibold text-primary">
                        Team Description
                      </label>
                      <Textarea
                        value={teamDescription}
                        onChange={(e) => setTeamDescription(e.target.value)}
                        required
                        className="border-primary/20 focus:border-secondary min-h-[100px]"
                        placeholder="Describe the team and its mission..."
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-8"
                      >
                        {saving ? 'Adding...' : 'Add Team'}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowNewTeam(false)}
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full px-8"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {teams.length === 0 ? (
                  <p className="font-paragraph text-base text-primary/60 text-center py-8">
                    No teams yet. Create one to encourage group fundraising!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {teams.map((team) => {
                      const teamDonations = donations.filter(d => d.teamId === team._id);
                      const teamTotal = teamDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

                      return (
                        <div key={team._id} className="bg-primary/5 rounded-lg p-6 border-2 border-primary/10 space-y-4">
                          {team.teamLogo && (
                            <div className="w-full h-32 rounded-lg overflow-hidden bg-background">
                              <Image src={team.teamLogo} alt={team.teamName || 'Team logo'} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-heading text-xl font-bold text-primary">
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
                          <Button
                            onClick={() => handleDeleteTeam(team._id)}
                            variant="outline"
                            className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructiveforeground rounded-full"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Team
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="donations">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="font-heading text-2xl font-bold text-primary">
                  All Donations ({donations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {donations.length === 0 ? (
                    <p className="font-paragraph text-base text-primary/60 text-center py-8">
                      No donations yet. Share your campaign to start receiving support!
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-primary/20">
                            <th className="font-heading text-left py-3 px-4 text-primary">Donor</th>
                            <th className="font-heading text-left py-3 px-4 text-primary">Email</th>
                            <th className="font-heading text-left py-3 px-4 text-primary">Amount</th>
                            <th className="font-heading text-left py-3 px-4 text-primary">Date</th>
                            <th className="font-heading text-left py-3 px-4 text-primary">Status</th>
                            <th className="font-heading text-left py-3 px-4 text-primary">Message</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donations.map((donation) => (
                            <tr key={donation._id} className="border-b border-primary/10 hover:bg-primary/5">
                              <td className="font-paragraph py-3 px-4 text-primary">
                                {donation.donorName || 'Anonymous'}
                              </td>
                              <td className="font-paragraph py-3 px-4 text-primary/70">
                                {donation.donorEmail}
                              </td>
                              <td className="font-paragraph py-3 px-4 text-secondary font-bold">
                                ${donation.amount?.toLocaleString()}
                              </td>
                              <td className="font-paragraph py-3 px-4 text-primary/70">
                                {donation.donationDate ? new Date(donation.donationDate).toLocaleDateString() : '-'}
                              </td>
                              <td className="font-paragraph py-3 px-4">
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                  donation.status === 'completed' 
                                    ? 'bg-secondary/10 text-secondary' 
                                    : 'bg-primary/10 text-primary'
                                }`}>
                                  {donation.status || 'pending'}
                                </span>
                              </td>
                              <td className="font-paragraph py-3 px-4 text-primary/70 max-w-xs truncate">
                                {donation.donorMessage || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
