import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails, Donations } from '@/entities';
import { ArrowLeft, Save, DollarSign, Users, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [donations, setDonations] = useState<Donations[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form fields
  const [campaignTitle, setCampaignTitle] = useState('');
  const [fundraisingGoal, setFundraisingGoal] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [promotionalText, setPromotionalText] = useState('');
  const [mainCampaignImage, setMainCampaignImage] = useState('');
  const [campaignStartDate, setCampaignStartDate] = useState('');
  const [campaignEndDate, setCampaignEndDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { items: campaignItems } = await BaseCrudService.getAll<CampaignDetails>('campaigndetails');
      const { items: donationItems } = await BaseCrudService.getAll<Donations>('donations');
      
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

          {/* Donations Tab */}
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
