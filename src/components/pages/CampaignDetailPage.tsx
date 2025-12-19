import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails } from '@/entities';
import { ArrowLeft, AlertCircle, Loader2, Play } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { motion } from 'framer-motion';
import VideoPlayer from '@/components/VideoPlayer';

export default function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
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

      const data = await BaseCrudService.getById<CampaignDetails>('campaigndetails', campaignId);
      setCampaign(data);
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

          {/* Call to Action */}
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
