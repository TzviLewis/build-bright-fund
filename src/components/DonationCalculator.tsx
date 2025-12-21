import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';
import { Heart, TrendingUp } from 'lucide-react';

interface DonationCalculatorProps {
  campaignGoal: number;
  currentFunded: number;
  matchingPercentage?: number;
  onDonate?: (amount: number) => void;
}

export default function DonationCalculator({
  campaignGoal,
  currentFunded,
  matchingPercentage = 0,
  onDonate,
}: DonationCalculatorProps) {
  const [amount, setAmount] = useState(50);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const presetAmounts = [10, 25, 50, 100, 250, 500];

  const calculations = useMemo(() => {
    const matchedAmount = (amount * matchingPercentage) / 100;
    const totalImpact = amount + matchedAmount;
    const newTotal = currentFunded + totalImpact;
    const percentageOfGoal = (newTotal / campaignGoal) * 100;
    const remainingToGoal = Math.max(0, campaignGoal - newTotal);

    return {
      matchedAmount,
      totalImpact,
      newTotal,
      percentageOfGoal,
      remainingToGoal,
    };
  }, [amount, matchingPercentage, currentFunded, campaignGoal]);

  const handlePresetClick = (preset: number) => {
    setAmount(preset);
    setSelectedPreset(preset);
  };

  const handleSliderChange = (value: number[]) => {
    setAmount(value[0]);
    setSelectedPreset(null);
  };

  const progressPercentage = Math.min(
    (calculations.newTotal / campaignGoal) * 100,
    100
  );

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">Donation Calculator</h3>
        </div>

        {/* Amount Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Donation Amount
          </label>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">${amount}</span>
            {matchingPercentage > 0 && (
              <span className="text-sm text-green-600 font-medium">
                +${calculations.matchedAmount.toFixed(2)} matched
              </span>
            )}
          </div>

          {/* Slider */}
          <Slider
            value={[amount]}
            onValueChange={handleSliderChange}
            min={1}
            max={5000}
            step={1}
            className="w-full"
          />

          {/* Manual Input */}
          <Input
            type="number"
            value={amount}
            onChange={(e) => {
              const value = Math.max(1, Number(e.target.value));
              setAmount(value);
              setSelectedPreset(null);
            }}
            placeholder="Enter amount"
            className="w-full"
          />
        </div>

        {/* Preset Amounts */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 uppercase">
            Quick Select
          </label>
          <div className="grid grid-cols-3 gap-2">
            {presetAmounts.map((preset) => (
              <motion.button
                key={preset}
                onClick={() => handlePresetClick(preset)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                  selectedPreset === preset
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                }`}
              >
                ${preset}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Impact Summary */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Your Donation</span>
            <span className="font-semibold text-gray-900">${amount.toFixed(2)}</span>
          </div>

          {matchingPercentage > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Matched Amount ({matchingPercentage}%)</span>
                <span className="font-semibold text-green-600">
                  ${calculations.matchedAmount.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Total Impact</span>
                <span className="font-bold text-lg text-blue-600">
                  ${calculations.totalImpact.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Progress Visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Campaign Progress</span>
            <span className="text-xs font-bold text-gray-900">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: `${(currentFunded / campaignGoal) * 100}%` }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>${currentFunded.toLocaleString()} funded</span>
            <span>${calculations.remainingToGoal.toLocaleString()} to go</span>
          </div>
        </div>

        {/* Donate Button */}
        <motion.button
          onClick={() => onDonate?.(amount)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-center gap-2">
            <Heart className="w-5 h-5" />
            Donate ${amount.toFixed(2)}
          </div>
        </motion.button>

        {/* Info Message */}
        {matchingPercentage > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-green-700">
              Your donation will be matched {matchingPercentage}%! Every dollar you give becomes ${(1 + matchingPercentage / 100).toFixed(2)}.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
