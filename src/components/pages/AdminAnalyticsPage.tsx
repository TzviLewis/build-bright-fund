import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails, Donations, Matchers, Teams } from '@/entities';
import { ArrowLeft, TrendingUp, DollarSign, Users, Target, Calendar, AlertCircle, Loader2, BarChart3, PieChart, LineChart as LineChartIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart as PieChartComponent, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as LineChartComponent, Line } from 'recharts';

export default function AdminAnalyticsPage() {
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [donations, setDonations] = useState<Donations[]>([]);
  const [teams, setTeams] = useState<Teams[]>([]);
  const [matchers, setMatchers] = useState<Matchers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      setCampaign(campaignRes.items?.[0] || null);
      setDonations(donationsRes.items || []);
      setTeams(teamsRes.items || []);
      setMatchers(matchersRes.items || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load analytics';
      setError(`Failed to load analytics: ${errorMsg}`);
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalRaised = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const completedDonations = donations.filter(d => d.status === 'completed');
  const averageDonation = completedDonations.length > 0 ? totalRaised / completedDonations.length : 0;
  const progressPercentage = campaign?.fundraisingGoal 
    ? Math.min((totalRaised / campaign.fundraisingGoal) * 100, 100)
    : 0;

  const topTeams = teams
    .map(team => ({
      team,
      raised: donations
        .filter(d => d.teamId === team._id)
        .reduce((sum, d) => sum + (d.amount || 0), 0),
    }))
    .sort((a, b) => b.raised - a.raised)
    .slice(0, 5);

  const topDonors = completedDonations
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, 5);

  // Prepare chart data
  const teamChartData = topTeams.map(item => ({
    name: item.team.teamName || 'Unknown',
    raised: item.raised,
  }));

  const donationDistribution = [
    { name: 'Completed', value: completedDonations.length, color: '#3b82f6' },
    { name: 'Pending', value: donations.filter(d => d.status !== 'completed').length, color: '#93c5fd' },
  ];

  const dailyDonations = donations.reduce((acc, donation) => {
    if (!donation.donationDate) return acc;
    const date = new Date(donation.donationDate).toLocaleDateString();
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.amount += donation.amount || 0;
      existing.count += 1;
    } else {
      acc.push({ date, amount: donation.amount || 0, count: 1 });
    }
    return acc;
  }, [] as Array<{ date: string; amount: number; count: number }>).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto mb-4" />
          <p className="font-heading text-lg text-primary">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-8">
        <div className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold text-primary mb-4">Error</h1>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-b border-blue-800 shadow-lg sticky top-0 z-50">
        <div className="max-w-[120rem] mx-auto px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-heading text-4xl font-bold">Analytics Dashboard</h1>
              <p className="font-paragraph text-base text-blue-100 mt-2">
                Campaign performance insights & metrics
              </p>
            </div>
            <Link to="/admin">
              <Button 
                className="bg-white text-blue-600 hover:bg-blue-50 rounded-full px-6 py-2 font-semibold shadow-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[120rem] mx-auto px-8 py-12">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm font-semibold text-blue-700 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  Total Raised
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-4xl font-bold text-blue-900">
                  £{(totalRaised / 1000).toFixed(1)}k
                </p>
                <div className="mt-3 w-full bg-blue-100 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
                <p className="font-paragraph text-xs text-blue-600 mt-2">
                  {progressPercentage.toFixed(1)}% of goal
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm font-semibold text-green-700 flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  Total Donors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-4xl font-bold text-green-900">
                  {completedDonations.length}
                </p>
                <p className="font-paragraph text-xs text-green-600 mt-2">
                  Avg donation: £{averageDonation.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm font-semibold text-purple-700 flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-4xl font-bold text-purple-900">
                  £{((campaign?.fundraisingGoal || 0) / 1000).toFixed(1)}k
                </p>
                <p className="font-paragraph text-xs text-purple-600 mt-2">
                  Remaining: £{(Math.max(0, (campaign?.fundraisingGoal || 0) - totalRaised) / 1000).toFixed(1)}k
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm font-semibold text-orange-700 flex items-center gap-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-4xl font-bold text-orange-900">
                  {teams.length}
                </p>
                <p className="font-paragraph text-xs text-orange-600 mt-2">
                  Active fundraisers
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Top Teams Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="font-heading text-xl font-bold text-blue-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Top Fundraising Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={teamChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        formatter={(value) => `£${(value as number).toLocaleString()}`}
                      />
                      <Bar dataKey="raised" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="font-paragraph text-center text-blue-600/60 py-8">No team data available</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Donation Status Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="font-heading text-xl font-bold text-blue-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  Donation Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {donationDistribution.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChartComponent>
                      <Pie
                        data={donationDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {donationDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} donations`} />
                    </PieChartComponent>
                  </ResponsiveContainer>
                ) : (
                  <p className="font-paragraph text-center text-blue-600/60 py-8">No donation data available</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Daily Donations Trend */}
        {dailyDonations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="mb-12"
          >
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="font-heading text-xl font-bold text-blue-900 flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-blue-600" />
                  Donation Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChartComponent data={dailyDonations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value) => `£${(value as number).toLocaleString()}`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="Daily Amount" />
                  </LineChartComponent>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Top Teams List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="mb-12"
        >
          <Card className="border-0 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="font-heading text-2xl font-bold text-blue-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Top Fundraising Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topTeams.length === 0 ? (
                <p className="font-paragraph text-center text-blue-600/60 py-8">
                  No teams yet
                </p>
              ) : (
                <div className="space-y-4">
                  {topTeams.map((item, index) => (
                    <motion.div 
                      key={item.team._id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-lg">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-heading font-bold text-blue-900">{item.team.teamName}</p>
                          <p className="font-paragraph text-sm text-blue-700">{item.team.memberCount} members</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-2xl font-bold text-blue-900">
                          £{item.raised.toLocaleString()}
                        </p>
                        <p className="font-paragraph text-xs text-blue-600">
                          {((item.raised / (item.team.fundraisingGoal || 1)) * 100).toFixed(1)}% of goal
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Donors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <Card className="border-0 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="font-heading text-2xl font-bold text-blue-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Top Donors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topDonors.length === 0 ? (
                <p className="font-paragraph text-center text-blue-600/60 py-8">
                  No donations yet
                </p>
              ) : (
                <div className="space-y-4">
                  {topDonors.map((donation, index) => (
                    <motion.div 
                      key={donation._id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-lg">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-heading font-bold text-blue-900">{donation.donorName || 'Anonymous'}</p>
                          <p className="font-paragraph text-sm text-blue-700">{donation.donorEmail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-2xl font-bold text-blue-900">
                          £{donation.amount?.toLocaleString()}
                        </p>
                        <p className="font-paragraph text-xs text-blue-600">
                          {donation.donationDate ? new Date(donation.donationDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
