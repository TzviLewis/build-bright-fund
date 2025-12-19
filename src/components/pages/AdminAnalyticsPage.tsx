import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BaseCrudService } from '@/integrations';
import { Donations, Teams, CampaignDetails } from '@/entities';
import { ArrowLeft, AlertCircle, Loader2, TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donations[]>([]);
  const [teams, setTeams] = useState<Teams[]>([]);
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [donationsData, teamsData, campaignData] = await Promise.all([
        BaseCrudService.getAll<Donations>('donations'),
        BaseCrudService.getAll<Teams>('teams'),
        BaseCrudService.getAll<CampaignDetails>('campaigndetails'),
      ]);
      setDonations(donationsData.items);
      setTeams(teamsData.items);
      setCampaign(campaignData.items[0] || null);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics
  const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalDonationCount = donations.length;
  const averageDonation = totalDonationCount > 0 ? totalDonations / totalDonationCount : 0;
  const anonymousDonations = donations.filter(d => d.isAnonymous).length;

  // Donations by team
  const donationsByTeam = teams.map(team => {
    const teamDonations = donations.filter(d => d.teamId === team._id);
    const amount = teamDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    return {
      name: team.teamName || 'Unknown',
      value: amount,
      count: teamDonations.length,
    };
  }).filter(t => t.value > 0);

  // Donations over time (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const donationsByDate = last7Days.map(date => {
    const dayDonations = donations.filter(d => {
      const donationDate = new Date(d.donationDate || '').toISOString().split('T')[0];
      return donationDate === date;
    });
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: dayDonations.reduce((sum, d) => sum + (d.amount || 0), 0),
      count: dayDonations.length,
    };
  });

  // Donation status distribution
  const statusDistribution = [
    {
      name: 'Anonymous',
      value: anonymousDonations,
      color: '#60a2ff',
    },
    {
      name: 'Named',
      value: totalDonationCount - anonymousDonations,
      color: '#0B1E5B',
    },
  ];

  // Progress towards goal
  const progressPercentage = campaign?.fundraisingGoal
    ? Math.min((totalDonations / campaign.fundraisingGoal) * 100, 100)
    : 0;

  const COLORS = ['#0B1E5B', '#60a2ff', '#4a90e2', '#357abd', '#2a5aa8'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">Analytics & Reports</h1>
            <p className="text-sm text-gray-600">Campaign performance and donation insights</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Admin
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Raised</p>
                <p className="text-3xl font-bold text-primary">${totalDonations.toFixed(2)}</p>
              </div>
              <DollarSign className="text-primary/20" size={40} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Donations</p>
                <p className="text-3xl font-bold text-primary">{totalDonationCount}</p>
              </div>
              <TrendingUp className="text-primary/20" size={40} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Donation</p>
                <p className="text-3xl font-bold text-primary">${averageDonation.toFixed(2)}</p>
              </div>
              <Target className="text-primary/20" size={40} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Teams</p>
                <p className="text-3xl font-bold text-primary">{teams.length}</p>
              </div>
              <Users className="text-primary/20" size={40} />
            </div>
          </motion.div>
        </div>

        {/* Campaign Progress */}
        {campaign && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Campaign Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">Goal: ${campaign.fundraisingGoal?.toFixed(2)}</p>
                    <p className="text-sm font-semibold text-primary">{progressPercentage.toFixed(1)}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-primary h-4 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
                {campaign.bonusGoal && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Bonus Goal: ${campaign.bonusGoal.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{campaign.bonusGoalDescription}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Donations by Team */}
          {donationsByTeam.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Donations by Team</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={donationsByTeam}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)}`} />
                    <Bar dataKey="value" fill="#0B1E5B" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Donations Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Donations Over Time (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={donationsByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)}`} />
                  <Line type="monotone" dataKey="amount" stroke="#0B1E5B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Donation Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Donation Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col justify-center space-y-4">
                {statusDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.value} donations</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
