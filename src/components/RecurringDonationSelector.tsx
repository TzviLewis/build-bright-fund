import { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export type RecurrenceFrequency = 'one-time' | 'monthly' | 'quarterly' | 'yearly';

interface RecurringDonationOption {
  frequency: RecurrenceFrequency;
  label: string;
  description: string;
  badge?: string;
  icon: React.ReactNode;
}

interface RecurringDonationSelectorProps {
  amount: number;
  onFrequencyChange: (frequency: RecurrenceFrequency) => void;
  selectedFrequency?: RecurrenceFrequency;
  onProceed: () => void;
  isLoading?: boolean;
}

const RECURRENCE_OPTIONS: RecurringDonationOption[] = [
  {
    frequency: 'one-time',
    label: 'One-Time Donation',
    description: 'Make a single donation now',
    icon: '💰',
  },
  {
    frequency: 'monthly',
    label: 'Monthly Donation',
    description: 'Recurring donation every month',
    badge: 'Most Popular',
    icon: '📅',
  },
  {
    frequency: 'quarterly',
    label: 'Quarterly Donation',
    description: 'Recurring donation every 3 months',
    icon: '📊',
  },
  {
    frequency: 'yearly',
    label: 'Yearly Donation',
    description: 'Recurring donation every year',
    badge: 'Best Value',
    icon: '🎯',
  },
];

export default function RecurringDonationSelector({
  amount,
  onFrequencyChange,
  selectedFrequency = 'one-time',
  onProceed,
  isLoading = false,
}: RecurringDonationSelectorProps) {
  const [showDetails, setShowDetails] = useState(false);

  const calculateAnnualAmount = (frequency: RecurrenceFrequency): number => {
    switch (frequency) {
      case 'one-time':
        return amount;
      case 'monthly':
        return amount * 12;
      case 'quarterly':
        return amount * 4;
      case 'yearly':
        return amount;
      default:
        return amount;
    }
  };

  const getFrequencyLabel = (frequency: RecurrenceFrequency): string => {
    switch (frequency) {
      case 'one-time':
        return 'One-Time';
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      case 'yearly':
        return 'Yearly';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="font-heading text-2xl font-bold text-primary">
          Choose Your Donation Frequency
        </h3>
        <p className="font-paragraph text-primary/70">
          Select how often you'd like to support this campaign
        </p>
      </div>

      {/* Recurrence Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RECURRENCE_OPTIONS.map((option, index) => (
          <motion.button
            key={option.frequency}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onFrequencyChange(option.frequency)}
            className={`relative p-6 rounded-lg border-2 transition-all duration-300 text-left group ${
              selectedFrequency === option.frequency
                ? 'border-secondary bg-secondary/5'
                : 'border-primary/10 bg-white hover:border-primary/30'
            }`}
          >
            {/* Badge */}
            {option.badge && (
              <div className="absolute top-3 right-3 px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs font-bold">
                {option.badge}
              </div>
            )}

            {/* Check Icon */}
            {selectedFrequency === option.frequency && (
              <div className="absolute top-3 left-3 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-secondary-foreground" />
              </div>
            )}

            {/* Content */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{option.icon}</span>
                <div className="flex-1">
                  <h4 className="font-heading font-bold text-primary text-lg">
                    {option.label}
                  </h4>
                  <p className="font-paragraph text-sm text-primary/60 mt-1">
                    {option.description}
                  </p>
                </div>
              </div>

              {/* Amount Info */}
              <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                <p className="font-paragraph text-xs text-primary/60 mb-1">
                  {option.frequency === 'one-time' ? 'Total Amount' : 'Per Payment'}
                </p>
                <p className="font-heading text-xl font-bold text-primary">
                  ${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </p>
                {option.frequency !== 'one-time' && (
                  <p className="font-paragraph text-xs text-primary/60 mt-2">
                    Annual Impact: ${calculateAnnualAmount(option.frequency).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Details Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-primary/5 rounded-lg p-6 border border-primary/10 space-y-4"
      >
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between font-heading font-bold text-primary hover:text-secondary transition-colors"
        >
          <span>Recurring Donation Details</span>
          <span className={`transition-transform ${showDetails ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-4 border-t border-primary/10"
          >
            <div className="space-y-2">
              <h4 className="font-heading font-bold text-primary">How It Works</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-secondary font-bold">✓</span>
                  <span className="font-paragraph text-primary/70">
                    Your card will be charged automatically on your selected frequency
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary font-bold">✓</span>
                  <span className="font-paragraph text-primary/70">
                    You can cancel or modify your donation anytime from your donor profile
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary font-bold">✓</span>
                  <span className="font-paragraph text-primary/70">
                    You'll receive a receipt after each donation for tax purposes
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary font-bold">✓</span>
                  <span className="font-paragraph text-primary/70">
                    Your recurring donations are secure and encrypted
                  </span>
                </li>
              </ul>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-white rounded-lg p-4 border border-primary/10 space-y-2">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-heading font-bold text-primary text-sm">
                    Easy Cancellation
                  </h5>
                  <p className="font-paragraph text-xs text-primary/60 mt-1">
                    You can cancel your recurring donation at any time without penalty. No questions asked.
                  </p>
                </div>
              </div>
            </div>

            {/* Impact Summary */}
            <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20 space-y-2">
              <h5 className="font-heading font-bold text-secondary">Your Impact</h5>
              <p className="font-paragraph text-sm text-secondary/80">
                With a {getFrequencyLabel(selectedFrequency)} donation of{' '}
                <span className="font-bold">
                  ${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </span>
                , you'll contribute{' '}
                <span className="font-bold">
                  ${calculateAnnualAmount(selectedFrequency).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>{' '}
                annually to this campaign.
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Action Button */}
      <Button
        onClick={onProceed}
        disabled={isLoading}
        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg py-3 font-bold text-lg disabled:opacity-70"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          `Proceed to Payment - $${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
        )}
      </Button>

      {/* Security Notice */}
      <div className="text-center">
        <p className="font-paragraph text-xs text-primary/60">
          🔒 Your payment information is secure and encrypted
        </p>
      </div>
    </div>
  );
}
