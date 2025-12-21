import React, { useMemo } from 'react';
import { CampaignDetails, Donations } from '@/entities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Users, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImpactTrackerProps {
  campaign: CampaignDetails;
  donations: Donations[];
}

export default function ImpactTracker({
  campaign,
  donations,
}: ImpactTrackerProps) {
  const campaignDonations = donations.filter((d) => d.teamId === campaign._id);

  const metrics = useMemo(() => {
    const totalRaised = campaignDonations.reduce(
      (sum, d) => sum + (d.amount || 0),
      0
    );
    const totalDonors = new Set(
      campaignDonations
        .filter((d) => !d.isAnonymous && d.donorName)
        .map((d) => d.donorName)
    ).size;
    const averageDonation =
      campaignDonations.length > 0
        ? totalRaised / campaignDonations.length
        : 0;
    const fundingPercentage = campaign.fundraisingGoal
      ? (totalRaised / campaign.fundraisingGoal) * 100
      : 0;
    const remainingToGoal = Math.max(
      0,
      (campaign.fundraisingGoal || 0) - totalRaised
    );
    const bonusGoalProgress = campaign.bonusGoal
      ? (totalRaised / campaign.bonusGoal) * 100
      : 0;

    return {
      totalRaised,
      totalDonors,
      averageDonation,
      fundingPercentage,
      remainingToGoal,
      bonusGoalProgress,
      donationCount: campaignDonations.length,
    };
  }, [campaignDonations, campaign]);

  const impactItems = [
    {
      icon: Zap,
      label: 'Total Raised',
      value: `$${metrics.totalRaised.toLocaleString()}`,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: Users,
      label: 'Total Donors',
      value: metrics.totalDonors.toString(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Target,
      label: 'Average Donation',
      value: `$${metrics.averageDonation.toFixed(2)}`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: TrendingUp,
      label: 'Donations',
      value: metrics.donationCount.toString(),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="w-6 h-6 text-yellow-500" />
        <h3 className="text-2xl font-bold text-gray-900">Impact Tracker</h3>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {impactItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-4 ${item.bgColor} border-0`}>
                <div className="flex items-start justify-between mb-3">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                <p className={`text-2xl font-bold ${item.color}`}>
                  {item.value}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Funding Progress */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">Primary Goal Progress</h4>
              <Badge variant="secondary">
                {metrics.fundingPercentage.toFixed(1)}%
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(metrics.fundingPercentage, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
              <span>${metrics.totalRaised.toLocaleString()} raised</span>
              <span>${campaign.fundraisingGoal?.toLocaleString() || '0'} goal</span>
            </div>
          </div>

          {metrics.remainingToGoal > 0 && (
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-blue-600">
                  ${metrics.remainingToGoal.toLocaleString()}
                </span>
                {' '}more needed to reach the primary goal
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Bonus Goal Progress */}
      {campaign.bonusGoal && campaign.bonusGoal > 0 && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Bonus Goal Progress</h4>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {metrics.bonusGoalProgress.toFixed(1)}%
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(metrics.bonusGoalProgress, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                <span>${metrics.totalRaised.toLocaleString()} raised</span>
                <span>${campaign.bonusGoal.toLocaleString()} bonus goal</span>
              </div>
            </div>

            {campaign.bonusGoalDescription && (
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-green-600">Bonus:</span>
                  {' '}{campaign.bonusGoalDescription}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Impact Summary */}
      <Card className="p-6 space-y-4">
        <h4 className="font-semibold text-gray-900">Campaign Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Campaign Status</p>
            <Badge variant="outline" className="w-fit">
              {campaign.status || 'Active'}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Start Date</p>
            <p className="font-semibold text-gray-900">
              {campaign.campaignStartDate
                ? new Date(campaign.campaignStartDate).toLocaleDateString()
                : 'TBD'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">End Date</p>
            <p className="font-semibold text-gray-900">
              {campaign.campaignEndDate
                ? new Date(campaign.campaignEndDate).toLocaleDateString()
                : 'TBD'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Total Donations</p>
            <p className="font-semibold text-gray-900">
              {metrics.donationCount}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
