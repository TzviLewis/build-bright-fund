import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails, Donations, Teams, Matchers } from '@/entities';
import { ArrowLeft, AlertCircle, Loader2, Play, Users, TrendingUp, DollarSign } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Campaigns
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Hero Section */}
          {campaign.mainCampaignImage && (
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src={campaign.mainCampaignImage}
                alt={campaign.campaignTitle || 'Campaign'}
                className="w-full h-full object-cover"
                width={800}
              />
              <div className="absolute inset-0 bg-black/30 flex items-end">
                <div className="p-6 text-white w-full">
                  <h1 className="text-4xl font-bold mb-2">{campaign.campaignTitle}</h1>
                  <p className="text-lg opacity-90">{campaign.projectDescription}</p>
                </div>
              </div>
            </div>
          )}

          {!campaign.mainCampaignImage && (
            <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-12 text-white">
              <h1 className="text-4xl font-bold mb-2">{campaign.campaignTitle}</h1>
              <p className="text-lg opacity-90">{campaign.projectDescription}</p>
            </div>
          )}

          {/* Countdown Timer */}
          {campaign.campaignEndDate && (
            <Card>
              <CardHeader>
                <CardTitle>Campaign Countdown</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <CircularCountdownTimer endDate={campaign.campaignEndDate} />
              </CardContent>
            </Card>
          )}

          {/* Campaign Video */}
          {campaign.campaignVideo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play size={20} />
                  Campaign Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VideoPlayer src={campaign.campaignVideo} />
              </CardContent>
            </Card>
          )}

          {/* Fundraising Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Fundraising Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Goal</p>
                  <p className="text-3xl font-bold text-primary">
                    ${campaign.fundraisingGoal?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Bonus Goal</p>
                  <p className="text-3xl font-bold text-secondary">
                    ${campaign.bonusGoal?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">Progress</p>
                  <p className="text-sm font-semibold text-primary">{progressPercentage.toFixed(0)}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {campaign.bonusGoalDescription && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Bonus Goal</p>
                  <p className="text-sm text-blue-800">{campaign.bonusGoalDescription}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {campaign.projectDescription && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">About This Campaign</h3>
                  <p className="text-gray-700 leading-relaxed">{campaign.projectDescription}</p>
                </div>
              )}

              {campaign.promotionalText && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-sm font-semibold text-yellow-900 mb-2">Special Message</p>
                  <p className="text-sm text-yellow-800">{campaign.promotionalText}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaign.campaignStartDate && (
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-semibold">
                      {new Date(campaign.campaignStartDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {campaign.campaignEndDate && (
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-semibold">
                      {new Date(campaign.campaignEndDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {campaign.status && (
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        campaign.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                    <p className="font-semibold">{campaign.status}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Matchers Section */}
          {matchers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  Generous Matchers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchers.map((matcher) => (
                    <motion.div
                      key={matcher._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-lg mb-2">{matcher.matcherName}</h3>
                      <div className="space-y-2">
                        {matcher.matchingAmount && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Matching Amount:</span>
                            <span className="font-semibold text-primary">
                              ${matcher.matchingAmount.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {matcher.matchingPercentage && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Matching %:</span>
                            <span className="font-semibold text-secondary">
                              {matcher.matchingPercentage}%
                            </span>
                          </div>
                        )}
                        {matcher.matchingLimit && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Limit:</span>
                            <span className="font-semibold">
                              ${matcher.matchingLimit.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Teams Section */}
          {teams.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  Fundraising Teams ({teams.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams.map((team) => (
                    <motion.div
                      key={team._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/team/${team._id}`)}
                    >
                      {team.teamLogo && (
                        <div className="mb-3 h-20 rounded overflow-hidden">
                          <Image
                            src={team.teamLogo}
                            alt={team.teamName || 'Team'}
                            className="w-full h-full object-cover"
                            width={200}
                          />
                        </div>
                      )}
                      <h3 className="font-semibold text-lg mb-2">{team.teamName}</h3>
                      {team.teamDescription && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {team.teamDescription}
                        </p>
                      )}
                      <div className="space-y-2">
                        {team.fundraisingGoal && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Goal:</span>
                            <span className="font-semibold text-primary">
                              ${team.fundraisingGoal.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {team.memberCount && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Members:</span>
                            <span className="font-semibold">{team.memberCount}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ... keep existing code (Call to Action section) ... */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="text-lg opacity-90 mb-6">
              Your donation helps us reach our goal and make an impact.
            </p>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100"
              onClick={() => navigate('/')}
            >
              Donate Now
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
