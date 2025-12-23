import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { Donations, CampaignDetails } from '@/entities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Heart, TrendingUp, Calendar, Award, FileText, MessageSquare, Download, Filter, Share2, Zap } from 'lucide-react';
import moment from 'moment';

export default function DonorProfilePage() {
  const { member } = useMember();
  const [donations, setDonations] = useState<Donations[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalDonated, setTotalDonated] = useState(0);
  const [donationCount, setDonationCount] = useState(0);
  const [donorTier, setDonorTier] = useState<string>('Bronze');
  const [chartData, setChartData] = useState<any[]>([]);
  const [campaignBreakdown, setCampaignBreakdown] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [recurringDonation, setRecurringDonation] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch all donations and campaigns
        const [donationsRes, campaignsRes] = await Promise.all([
          BaseCrudService.getAll<Donations>('donations'),
          BaseCrudService.getAll<CampaignDetails>('campaigndetails'),
        ]);
        
        // Filter donations by the current member's email
        const memberDonations = donationsRes.items.filter(
          (donation) => donation.donorEmail === member?.loginEmail
        );

        setDonations(memberDonations);
        setCampaigns(campaignsRes.items);
        
        // Calculate total donated amount
        const total = memberDonations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
        setTotalDonated(total);
        setDonationCount(memberDonations.length);

        // Determine donor tier based on total donations
        if (total >= 5000) setDonorTier('Platinum');
        else if (total >= 2500) setDonorTier('Gold');
        else if (total >= 1000) setDonorTier('Silver');
        else if (total >= 500) setDonorTier('Bronze');
        else setDonorTier('Friend');

        // Generate chart data from donations
        const sortedDonations = [...memberDonations].sort((a, b) => 
          new Date(a.donationDate || 0).getTime() - new Date(b.donationDate || 0).getTime()
        );
        
        const monthlyData = sortedDonations.reduce((acc, donation) => {
          const month = moment(donation.donationDate).format('MMM YYYY');
          const existing = acc.find(item => item.month === month);
          if (existing) {
            existing.amount += donation.amount || 0;
            existing.count += 1;
          } else {
            acc.push({ month, amount: donation.amount || 0, count: 1 });
          }
          return acc;
        }, [] as any[]);

        setChartData(monthlyData);

        // Generate campaign breakdown
        const campaignMap = new Map<string, number>();
        memberDonations.forEach(donation => {
          const campaign = campaignsRes.items.find(c => c._id === donation.teamId);
          const campaignName = campaign?.campaignTitle || 'Unknown Campaign';
          campaignMap.set(campaignName, (campaignMap.get(campaignName) || 0) + (donation.amount || 0));
        });

        const breakdown = Array.from(campaignMap.entries()).map(([name, amount]) => ({
          name,
          value: amount,
        }));
        setCampaignBreakdown(breakdown);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (member?.loginEmail) {
      fetchData();
    }
  }, [member?.loginEmail]);

  const COLORS = ['#0066ff', '#ff3b30', '#34c759', '#ff9500', '#5856d6', '#00c7be'];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  const handleDownloadReport = () => {
    const reportContent = `
DONOR IMPACT REPORT
Generated: ${moment().format('MMMM D, YYYY')}

Donor: ${member?.profile?.nickname || member?.contact?.firstName || 'Anonymous'}
Email: ${member?.loginEmail}
Member Since: ${moment(member?._createdDate).format('MMMM D, YYYY')}
Donor Tier: ${donorTier}

DONATION SUMMARY
Total Donated: ${totalDonated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Total Donations: ${donationCount}
Average Donation: ${donationCount > 0 ? (totalDonated / donationCount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}

DONATION HISTORY
${donations.map(d => `- ${moment(d.donationDate).format('MMMM D, YYYY')}: ${d.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`).join('\n')}

Thank you for your generous support!
    `;
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportContent));
    element.setAttribute('download', `donor-report-${moment().format('YYYY-MM-DD')}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
              Donor Dashboard
            </h1>
            <p className="text-lg font-paragraph text-muted-foreground">
              Welcome back, {member?.profile?.nickname || member?.contact?.firstName || 'Donor'}!
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleDownloadReport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Report
            </Button>
            <Button className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Impact
            </Button>
          </div>
        </div>

        {/* Donor Tier Badge */}
        <div className="mb-8">
          <Card className="p-6 border border-secondary/30 bg-secondary/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/20 rounded-lg">
                <Award className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-paragraph text-muted-foreground mb-1">
                  Your Donor Tier
                </p>
                <h3 className="text-2xl font-heading font-bold text-foreground">
                  {donorTier} Donor
                </h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Total Donated Card */}
          <Card className="p-6 border border-muted">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-paragraph text-muted-foreground mb-2">
                  Total Donated
                </p>
                <p className="text-3xl font-heading font-bold text-foreground">
                  ${totalDonated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Heart className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </Card>

          {/* Donation Count Card */}
          <Card className="p-6 border border-muted">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-paragraph text-muted-foreground mb-2">
                  Total Donations
                </p>
                <p className="text-3xl font-heading font-bold text-foreground">
                  {donationCount}
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
            </div>
          </Card>

          {/* Average Donation Card */}
          <Card className="p-6 border border-muted">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-paragraph text-muted-foreground mb-2">
                  Average Donation
                </p>
                <p className="text-3xl font-heading font-bold text-foreground">
                  ${donationCount > 0 ? (totalDonated / donationCount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          {/* Impact Score Card */}
          <Card className="p-6 border border-muted">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-paragraph text-muted-foreground mb-2">
                  Impact Score
                </p>
                <p className="text-3xl font-heading font-bold text-foreground">
                  {Math.min(100, Math.floor((totalDonated / 1000) * 10))}
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <Zap className="w-6 h-6 text-accent" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <div className="flex gap-2 mb-6 border-b border-muted">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-paragraph text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'text-secondary border-b-2 border-secondary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 font-paragraph text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'text-secondary border-b-2 border-secondary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('impact')}
              className={`px-4 py-2 font-paragraph text-sm transition-colors ${
                activeTab === 'impact'
                  ? 'text-secondary border-b-2 border-secondary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Impact Report
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 font-paragraph text-sm transition-colors ${
                activeTab === 'messages'
                  ? 'text-secondary border-b-2 border-secondary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Messages
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Donation History Section */}
              <div>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                  Recent Donations
                </h2>

                {donations.length === 0 ? (
                  <Card className="p-12 border border-muted text-center">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-paragraph text-muted-foreground">
                      You haven't made any donations yet.
                    </p>
                    <p className="text-sm font-paragraph text-muted-foreground mt-2">
                      Start making a difference by donating to a campaign today!
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {donations.slice(0, 5).map((donation) => (
                      <Card
                        key={donation._id}
                        className="p-6 border border-muted hover:border-secondary/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-heading font-semibold text-foreground">
                                ${donation.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </h3>
                              {donation.isAnonymous && (
                                <Badge variant="outline" className="text-xs">
                                  Anonymous
                                </Badge>
                              )}
                              {donation.status && (
                                <Badge
                                  variant={donation.status === 'completed' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                </Badge>
                              )}
                            </div>
                            {donation.donorMessage && (
                              <p className="text-sm font-paragraph text-muted-foreground mb-3">
                                "{donation.donorMessage}"
                              </p>
                            )}
                            <p className="text-xs font-paragraph text-muted-foreground">
                              {moment(donation.donationDate).format('MMMM D, YYYY [at] h:mm A')}
                            </p>
                          </div>
                          {donation.teamId && (
                            <div className="text-right">
                              <p className="text-xs font-paragraph text-muted-foreground mb-1">
                                Team ID
                              </p>
                              <p className="text-sm font-heading font-semibold text-foreground">
                                {donation.teamId}
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Donation Trend Chart */}
              <Card className="p-6 border border-muted">
                <h3 className="text-lg font-heading font-semibold text-foreground mb-6">
                  Donation Trend
                </h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                      <XAxis dataKey="month" stroke="#666666" />
                      <YAxis stroke="#666666" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fafafa', border: '1px solid #e5e5e5' }}
                        formatter={(value) => `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#0066ff" 
                        strokeWidth={2}
                        dot={{ fill: '#0066ff', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No donation data available</p>
                )}
              </Card>

              {/* Campaign Breakdown */}
              <Card className="p-6 border border-muted">
                <h3 className="text-lg font-heading font-semibold text-foreground mb-6">
                  Donations by Campaign
                </h3>
                {campaignBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={campaignBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {campaignBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No campaign data available</p>
                )}
              </Card>
            </div>
          )}

          {/* Impact Report Tab */}
          {activeTab === 'impact' && (
            <div className="space-y-8">
              <Card className="p-8 border border-secondary/30 bg-secondary/5">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <FileText className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-heading font-bold text-foreground mb-3">
                      Your Impact Summary
                    </h3>
                    <div className="space-y-3">
                      <p className="font-paragraph text-foreground">
                        <span className="font-semibold">Total Impact:</span> Your ${totalDonated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in donations has made a real difference in {campaignBreakdown.length} campaign{campaignBreakdown.length !== 1 ? 's' : ''}.
                      </p>
                      <p className="font-paragraph text-foreground">
                        <span className="font-semibold">Donor Tier:</span> As a {donorTier} Donor, you're in the top {donorTier === 'Platinum' ? '5%' : donorTier === 'Gold' ? '15%' : donorTier === 'Silver' ? '30%' : '50%'} of our most generous supporters.
                      </p>
                      <p className="font-paragraph text-foreground">
                        <span className="font-semibold">Consistency:</span> You've made {donationCount} donation{donationCount !== 1 ? 's' : ''} with an average contribution of ${donationCount > 0 ? (totalDonated / donationCount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 border border-muted">
                <h3 className="text-lg font-heading font-bold text-foreground mb-6">
                  Campaign Impact Breakdown
                </h3>
                <div className="space-y-4">
                  {campaignBreakdown.map((campaign, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg border border-muted">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-paragraph text-foreground">{campaign.name}</span>
                      </div>
                      <span className="font-heading font-semibold text-foreground">
                        ${campaign.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-8">
              <Card className="p-8 border border-muted">
                <div className="flex items-center gap-4 mb-6">
                  <MessageSquare className="w-6 h-6 text-secondary" />
                  <h3 className="text-lg font-heading font-bold text-foreground">
                    Communication Center
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-background rounded-lg border border-muted">
                    <p className="font-paragraph text-foreground mb-2">
                      <span className="font-semibold">Thank You Message</span>
                    </p>
                    <p className="text-sm font-paragraph text-muted-foreground">
                      We're grateful for your generous support. Your contributions help us make a real difference in our community.
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-lg border border-muted">
                    <p className="font-paragraph text-foreground mb-2">
                      <span className="font-semibold">Campaign Updates</span>
                    </p>
                    <p className="text-sm font-paragraph text-muted-foreground">
                      You'll receive regular updates on the campaigns you've supported, including progress reports and impact stories.
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-lg border border-muted">
                    <p className="font-paragraph text-foreground mb-2">
                      <span className="font-semibold">Exclusive Donor Benefits</span>
                    </p>
                    <p className="text-sm font-paragraph text-muted-foreground">
                      As a valued donor, you have access to exclusive content, early campaign announcements, and special recognition.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </Tabs>

        {/* Account Information Section */}
        <div className="mt-12 pt-8 border-t border-muted">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
            Account Information
          </h3>
          <Card className="p-6 border border-muted">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-paragraph text-muted-foreground mb-1">
                  Email
                </p>
                <p className="text-base font-paragraph text-foreground">
                  {member?.loginEmail}
                </p>
              </div>
              {member?.contact?.firstName && (
                <div>
                  <p className="text-sm font-paragraph text-muted-foreground mb-1">
                    Name
                  </p>
                  <p className="text-base font-paragraph text-foreground">
                    {member.contact.firstName} {member.contact.lastName || ''}
                  </p>
                </div>
              )}
              {member?.profile?.nickname && (
                <div>
                  <p className="text-sm font-paragraph text-muted-foreground mb-1">
                    Nickname
                  </p>
                  <p className="text-base font-paragraph text-foreground">
                    {member.profile.nickname}
                  </p>
                </div>
              )}
              {member?._createdDate && (
                <div>
                  <p className="text-sm font-paragraph text-muted-foreground mb-1">
                    Member Since
                  </p>
                  <p className="text-base font-paragraph text-foreground">
                    {moment(member._createdDate).format('MMMM D, YYYY')}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
