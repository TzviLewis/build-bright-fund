import React, { useState } from 'react';
import { Donations } from '@/entities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, MessageCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CampaignReviewsProps {
  campaignId: string;
  donations: Donations[];
  onAddReview?: (review: ReviewData) => void;
}

export interface ReviewData {
  rating: number;
  message: string;
  donorName: string;
}

export default function CampaignReviews({
  campaignId,
  donations,
  onAddReview,
}: CampaignReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [donorName, setDonorName] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');

  const campaignDonations = donations.filter(
    (d) => d.teamId === campaignId && d.donorMessage
  );

  const handleSubmitReview = () => {
    if (message.trim() && donorName.trim()) {
      onAddReview?.({
        rating,
        message,
        donorName,
      });
      setMessage('');
      setDonorName('');
      setRating(5);
      setShowForm(false);
    }
  };

  const averageRating =
    campaignDonations.length > 0
      ? campaignDonations.reduce((sum) => sum + 5, 0) / campaignDonations.length
      : 0;

  const sortedDonations = [...campaignDonations].sort((a, b) => {
    if (sortBy === 'recent') {
      return (
        new Date(b.donationDate || 0).getTime() -
        new Date(a.donationDate || 0).getTime()
      );
    }
    return 0;
  });

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-900">Reviews & Testimonials</h3>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Share Your Story'}
        </Button>
      </div>

      {/* Review Stats */}
      {campaignDonations.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Rating</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-blue-600">
                  {averageRating.toFixed(1)}
                </span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="border-l border-blue-200 pl-6">
              <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
              <p className="text-3xl font-bold text-blue-600">
                {campaignDonations.length}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Add Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-6 bg-gray-50 border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">Share Your Experience</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your thoughts about this campaign..."
                    className="w-full"
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitReview}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Post Review
                  </Button>
                  <Button
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-4">
        {campaignDonations.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">
              No reviews yet. Be the first to share your experience!
            </p>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {sortedDonations.length} review{sortedDonations.length !== 1 ? 's' : ''}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'helpful')}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>

            {sortedDonations.map((donation, index) => (
              <motion.div
                key={donation._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {donation.donorName || 'Anonymous'}
                        </h4>
                        <span className="text-xs text-gray-600">
                          {donation.donationDate
                            ? new Date(donation.donationDate).toLocaleDateString()
                            : 'Recently'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Donor
                        </Badge>
                      </div>
                      <p className="text-gray-700">{donation.donorMessage}</p>
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-blue-600">
                          Donated ${donation.amount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
