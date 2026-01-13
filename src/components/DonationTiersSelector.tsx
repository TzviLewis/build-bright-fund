import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BaseCrudService } from '@/integrations';
import { DonationTiers, Donations, CampaignDetails, Teams } from '@/entities';
import { DollarSign, Plus, Loader2, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDonationStore } from '@/stores/donationStore';

interface DonationTiersSelectorProps {
  campaignId?: string;
  onDonationComplete?: (donation: Donations) => void;
  showCustomAmount?: boolean;
  campaignVideoUrl?: string;
  teams?: Teams[];
}

export default function DonationTiersSelector({
  campaignId,
  onDonationComplete,
  showCustomAmount = true,
  campaignVideoUrl,
  teams = [],
}: DonationTiersSelectorProps) {
  const { addNotification } = useDonationStore();
  const [tiers, setTiers] = useState<DonationTiers[]>([]);
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorMessage, setDonorMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, [campaignId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tiersRes, campaignRes] = await Promise.all([
        BaseCrudService.getAll<DonationTiers>('donationtiers'),
        campaignId ? BaseCrudService.getById<CampaignDetails>('campaigndetails', campaignId) : Promise.resolve(null),
      ]);
      
      const sortedTiers = (tiersRes.items || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setTiers(sortedTiers);
      setCampaign(campaignRes);
      
      // Auto-select recommended tier
      const recommended = sortedTiers.find(t => t.isRecommended);
      if (recommended) {
        setSelectedTierId(recommended._id);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load donation options');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedAmount = (): number => {
    if (customAmount && showCustomAmount) {
      return parseFloat(customAmount);
    }
    if (selectedTierId) {
      const tier = tiers.find(t => t._id === selectedTierId);
      return tier?.amount || 0;
    }
    return 0;
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = getSelectedAmount();
    if (amount <= 0) {
      setError('Please select or enter a valid donation amount');
      return;
    }

    if (!isAnonymous && !donorEmail) {
      setError('Please enter your email address');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const donation: Donations = {
        _id: crypto.randomUUID(),
        // campaignId: campaignId, // Property doesn't exist in Donations type
        donorName: isAnonymous ? 'Anonymous' : donorName || 'Donor',
        donorEmail: isAnonymous ? '' : donorEmail,
        amount,
        donationDate: new Date(),
        isAnonymous,
        donorMessage: donorMessage || undefined,
        status: 'completed',
        teamId: selectedTeamId || undefined,
      };

      await BaseCrudService.create('donations', donation);
      
      setSuccess(true);
      setSelectedTierId(null);
      setCustomAmount('');
      setDonorName('');
      setDonorEmail('');
      setDonorMessage('');
      setIsAnonymous(false);
      setSelectedTeamId(null);

      // Add notification with video URL if available
      const videoUrl = campaignVideoUrl || campaign?.campaignVideo;
      addNotification({
        ...donation,
        videoUrl,
      });

      onDonationComplete?.(donation);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process donation';
      setError(errorMsg);
      console.error('Error processing donation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-secondary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="font-paragraph text-sm text-red-800">{error}</p>
        </motion.div>
      )}

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-heading font-semibold text-green-800">Thank you for your donation!</p>
            <p className="font-paragraph text-sm text-green-700 mt-1">
              Your contribution will make a real difference.
            </p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmitDonation} className="space-y-6">
        {/* Team Selection */}
        {teams.length > 0 && (
          <div className="space-y-3">
            <label className="font-heading font-semibold text-primary flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary" />
              Select a Team (optional)
            </label>
            <select
              value={selectedTeamId || ''}
              onChange={(e) => setSelectedTeamId(e.target.value || null)}
              className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30 font-paragraph text-primary"
            >
              <option value="">No Team - Donate to Campaign</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.teamName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Donation Tiers */}
        {tiers.length > 0 && (
          <div className="space-y-3">
            <label className="font-heading font-semibold text-primary flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-secondary" />
              Select Donation Amount
            </label>
            <div className="grid grid-cols-2 gap-3">
              {tiers.map((tier) => (
                <motion.button
                  key={tier._id}
                  type="button"
                  onClick={() => {
                    setSelectedTierId(tier._id);
                    setCustomAmount('');
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    selectedTierId === tier._id
                      ? 'border-secondary bg-secondary/10'
                      : 'border-primary/20 bg-white hover:border-secondary/50'
                  }`}
                >
                  <div className="font-heading font-bold text-lg text-secondary">
                    £{tier.amount}
                  </div>
                  <div className="font-paragraph text-xs text-primary/70 mt-1">
                    {tier.tierName}
                  </div>
                  {tier.description && (
                    <div className="font-paragraph text-xs text-primary/60 mt-1 line-clamp-2">
                      {tier.description}
                    </div>
                  )}
                  {tier.isRecommended && (
                    <div className="mt-2 inline-block px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-semibold">
                      Recommended
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Amount */}
        {showCustomAmount && (
          <div className="space-y-2">
            <label className="font-heading font-semibold text-primary">
              Or enter a custom amount
            </label>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg text-primary">£</span>
              <Input
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedTierId(null);
                }}
                className="flex-1 border-primary/20 focus:border-secondary"
              />
            </div>
          </div>
        )}

        {/* Donor Information */}
        <div className="space-y-3 pt-4 border-t border-primary/10">
          <label className="font-heading font-semibold text-primary flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-primary/20 text-secondary focus:ring-secondary"
            />
            Donate anonymously
          </label>

          {!isAnonymous && (
            <>
              <div>
                <label className="font-paragraph text-sm text-primary/70 block mb-2">
                  Your Name (optional)
                </label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="border-primary/20 focus:border-secondary"
                />
              </div>

              <div>
                <label className="font-paragraph text-sm text-primary/70 block mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  required
                  className="border-primary/20 focus:border-secondary"
                />
              </div>
            </>
          )}

          <div>
            <label className="font-paragraph text-sm text-primary/70 block mb-2">
              Message (optional)
            </label>
            <textarea
              placeholder="Share why you're supporting this campaign..."
              value={donorMessage}
              onChange={(e) => setDonorMessage(e.target.value)}
              className="w-full p-3 border border-primary/20 rounded-lg focus:border-secondary focus:outline-none resize-none font-paragraph text-sm"
              rows={3}
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={submitting || getSelectedAmount() <= 0}
          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50 py-3 font-semibold flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Donate £{getSelectedAmount().toFixed(2)}
            </>
          )}
        </Button>

        <p className="font-paragraph text-xs text-primary/60 text-center">
          Your donation is secure and will be processed immediately.
        </p>
      </form>
    </div>
  );
}
