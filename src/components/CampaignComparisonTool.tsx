import React, { useState } from 'react';
import { CampaignDetails } from '@/entities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Check, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CampaignComparisonToolProps {
  campaigns: CampaignDetails[];
  onCompare?: (campaignIds: string[]) => void;
}

export default function CampaignComparisonTool({
  campaigns,
  onCompare,
}: CampaignComparisonToolProps) {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const toggleCampaign = (campaignId: string) => {
    setSelectedCampaigns((prev) =>
      prev.includes(campaignId)
        ? prev.filter((id) => id !== campaignId)
        : [...prev, campaignId].slice(-3) // Max 3 campaigns
    );
  };

  const selectedCampaignData = campaigns.filter((c) =>
    selectedCampaigns.includes(c._id)
  );

  const handleCompare = () => {
    if (selectedCampaigns.length >= 2) {
      setIsComparing(true);
      onCompare?.(selectedCampaigns);
    }
  };

  const clearSelection = () => {
    setSelectedCampaigns([]);
    setIsComparing(false);
  };

  if (!isComparing || selectedCampaignData.length === 0) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Compare Campaigns
          </h3>
          {selectedCampaigns.length > 0 && (
            <Badge variant="secondary">
              {selectedCampaigns.length} selected
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <motion.div
              key={campaign._id}
              whileHover={{ scale: 1.02 }}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedCampaigns.includes(campaign._id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleCampaign(campaign._id)}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-gray-900 flex-1">
                  {campaign.campaignTitle}
                </h4>
                {selectedCampaigns.includes(campaign._id) && (
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {campaign.projectDescription}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Goal:</span>
                  <span className="font-semibold">
                    ${campaign.fundraisingGoal?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="outline" className="text-xs">
                    {campaign.status || 'Active'}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedCampaigns.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <Button
              onClick={handleCompare}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Compare {selectedCampaigns.length} Campaigns
            </Button>
            <Button
              onClick={clearSelection}
              variant="outline"
            >
              Clear
            </Button>
          </motion.div>
        )}
      </div>
    );
  }

  // Comparison View
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Campaign Comparison</h3>
        <Button
          onClick={clearSelection}
          variant="outline"
          size="sm"
        >
          Back to Selection
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900 sticky left-0 bg-white">
                Metric
              </th>
              {selectedCampaignData.map((campaign) => (
                <th
                  key={campaign._id}
                  className="text-left py-3 px-4 font-semibold text-gray-900 min-w-[200px]"
                >
                  {campaign.campaignTitle}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <ComparisonRow
              label="Fundraising Goal"
              values={selectedCampaignData.map(
                (c) => `$${c.fundraisingGoal?.toLocaleString() || '0'}`
              )}
            />
            <ComparisonRow
              label="Status"
              values={selectedCampaignData.map((c) => c.status || 'Active')}
            />
            <ComparisonRow
              label="Bonus Goal"
              values={selectedCampaignData.map(
                (c) => `$${c.bonusGoal?.toLocaleString() || 'N/A'}`
              )}
            />
            <ComparisonRow
              label="Start Date"
              values={selectedCampaignData.map((c) =>
                c.campaignStartDate
                  ? new Date(c.campaignStartDate).toLocaleDateString()
                  : 'TBD'
              )}
            />
            <ComparisonRow
              label="End Date"
              values={selectedCampaignData.map((c) =>
                c.campaignEndDate
                  ? new Date(c.campaignEndDate).toLocaleDateString()
                  : 'TBD'
              )}
            />
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedCampaignData.map((campaign) => (
          <Card key={campaign._id} className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              {campaign.campaignTitle}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {campaign.projectDescription}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Promotional Text:</span>
                <span className="font-medium">{campaign.promotionalText || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bonus Goal Description:</span>
                <span className="font-medium">
                  {campaign.bonusGoalDescription || 'N/A'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface ComparisonRowProps {
  label: string;
  values: (string | number)[];
}

function ComparisonRow({ label, values }: ComparisonRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-3 px-4 font-medium text-gray-700 sticky left-0 bg-white">
        {label}
      </td>
      {values.map((value, idx) => (
        <td key={idx} className="py-3 px-4 text-gray-900">
          {value}
        </td>
      ))}
    </tr>
  );
}
