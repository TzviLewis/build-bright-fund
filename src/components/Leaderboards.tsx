import React, { useMemo } from 'react';
import { CampaignDetails, Donations, Teams } from '@/entities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, Users, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardsProps {
  campaigns: CampaignDetails[];
  donations: Donations[];
  teams: Teams[];
}

export default function Leaderboards({
  campaigns,
  donations,
  teams,
}: LeaderboardsProps) {
  // Calculate top donors
  const topDonors = useMemo(() => {
    const donorMap = new Map<string, number>();
    donations.forEach((donation) => {
      if (!donation.isAnonymous && donation.donorName) {
        const current = donorMap.get(donation.donorName) || 0;
        donorMap.set(donation.donorName, current + (donation.amount || 0));
      }
    });
    return Array.from(donorMap.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [donations]);

  // Calculate top campaigns by funding
  const topCampaigns = useMemo(() => {
    return [...campaigns]
      .map((campaign) => {
        const campaignDonations = donations.filter(
          (d) => d.teamId === campaign._id
        );
        const totalFunded = campaignDonations.reduce(
          (sum, d) => sum + (d.amount || 0),
          0
        );
        return {
          ...campaign,
          totalFunded,
          donationCount: campaignDonations.length,
        };
      })
      .sort((a, b) => b.totalFunded - a.totalFunded)
      .slice(0, 10);
  }, [campaigns, donations]);

  // Calculate top teams
  const topTeams = useMemo(() => {
    return [...teams]
      .map((team) => {
        const teamDonations = donations.filter((d) => d.teamId === team._id);
        const totalFunded = teamDonations.reduce(
          (sum, d) => sum + (d.amount || 0),
          0
        );
        return {
          ...team,
          totalFunded,
          donationCount: teamDonations.length,
        };
      })
      .sort((a, b) => b.totalFunded - a.totalFunded)
      .slice(0, 10);
  }, [teams, donations]);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900">Leaderboards</h2>
      </div>

      <Tabs defaultValue="donors" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="donors" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Top Donors
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Top Campaigns
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Top Teams
          </TabsTrigger>
        </TabsList>

        {/* Top Donors */}
        <TabsContent value="donors" className="space-y-4">
          {topDonors.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No donations yet</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {topDonors.map((donor, index) => (
                <motion.div
                  key={donor.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <LeaderboardRow
                    rank={index + 1}
                    name={donor.name}
                    value={`$${donor.total.toLocaleString()}`}
                    icon={index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Top Campaigns */}
        <TabsContent value="campaigns" className="space-y-4">
          {topCampaigns.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No campaigns yet</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {topCampaigns.map((campaign, index) => (
                <motion.div
                  key={campaign._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {campaign.campaignTitle}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {campaign.donationCount} donations
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-blue-600">
                          ${campaign.totalFunded.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {campaign.fundraisingGoal
                            ? `${(
                                (campaign.totalFunded / campaign.fundraisingGoal) *
                                100
                              ).toFixed(0)}% of goal`
                            : 'No goal set'}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Top Teams */}
        <TabsContent value="teams" className="space-y-4">
          {topTeams.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No teams yet</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {topTeams.map((team, index) => (
                <motion.div
                  key={team._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {team.teamName}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {team.memberCount || 0} members • {team.donationCount} donations
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-purple-600">
                          ${team.totalFunded.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {team.fundraisingGoal
                            ? `${(
                                (team.totalFunded / team.fundraisingGoal) *
                                100
                              ).toFixed(0)}% of goal`
                            : 'No goal set'}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface LeaderboardRowProps {
  rank: number;
  name: string;
  value: string;
  icon?: string;
}

function LeaderboardRow({ rank, name, value, icon }: LeaderboardRowProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold">
            {icon || rank}
          </div>
          <span className="font-semibold text-gray-900">{name}</span>
        </div>
        <span className="text-lg font-bold text-blue-600">{value}</span>
      </div>
    </Card>
  );
}
