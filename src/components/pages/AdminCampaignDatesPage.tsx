import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, X, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails } from '@/entities';
import { Link } from 'react-router-dom';

export default function AdminCampaignDatesPage() {
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form state
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    loadCampaign();
  }, []);

  const loadCampaign = async () => {
    try {
      setLoadError(null);
      const { items: campaignItems } = await BaseCrudService.getAll<CampaignDetails>('campaigndetails');
      
      if (campaignItems.length > 0) {
        const campaignData = campaignItems[0];
        setCampaign(campaignData);

        // Format dates and times for input fields
        if (campaignData.campaignStartDate) {
          const startDateObj = new Date(campaignData.campaignStartDate);
          setStartDate(startDateObj.toISOString().split('T')[0]);
        }

        if (campaignData.campaignStartTime) {
          const timeStr = typeof campaignData.campaignStartTime === 'string'
            ? campaignData.campaignStartTime
            : new Date(campaignData.campaignStartTime).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false 
              });
          setStartTime(timeStr);
        }

        if (campaignData.campaignEndDate) {
          const endDateObj = new Date(campaignData.campaignEndDate);
          setEndDate(endDateObj.toISOString().split('T')[0]);
        }

        if (campaignData.campaignEndTime) {
          const timeStr = typeof campaignData.campaignEndTime === 'string'
            ? campaignData.campaignEndTime
            : new Date(campaignData.campaignEndTime).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false 
              });
          setEndTime(timeStr);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error loading campaign:', error);
      setLoadError(`Failed to load campaign data: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    try {
      // Validation
      if (!startDate) {
        setSubmitError('Start date is required');
        setSubmitting(false);
        return;
      }
      if (!endDate) {
        setSubmitError('End date is required');
        setSubmitting(false);
        return;
      }

      if (!campaign?._id) {
        setSubmitError('Campaign not found');
        setSubmitting(false);
        return;
      }

      // Create date objects
      const startDateTime = new Date(startDate);
      if (startTime) {
        const [hours, minutes] = startTime.split(':');
        startDateTime.setHours(parseInt(hours), parseInt(minutes));
      }

      const endDateTime = new Date(endDate);
      if (endTime) {
        const [hours, minutes] = endTime.split(':');
        endDateTime.setHours(parseInt(hours), parseInt(minutes));
      }

      // Validate that end date is after start date
      if (endDateTime <= startDateTime) {
        setSubmitError('End date and time must be after start date and time');
        setSubmitting(false);
        return;
      }

      // Update campaign
      const updateData: Partial<CampaignDetails> = {
        _id: campaign._id,
        campaignStartDate: startDateTime.toISOString(),
        campaignEndDate: endDateTime.toISOString(),
      };

      if (startTime) {
        updateData.campaignStartTime = startTime;
      }
      if (endTime) {
        updateData.campaignEndTime = endTime;
      }

      await BaseCrudService.update<CampaignDetails>('campaigndetails', updateData as CampaignDetails);

      setSubmitSuccess(true);
      await loadCampaign();
      
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update campaign dates. Please try again.';
      console.error('Error updating campaign:', error);
      setSubmitError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary font-heading text-2xl">Loading...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-8">
        <div className="max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <AlertCircle className="w-16 h-16 text-destructive" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-primary mb-4">
            Unable to Load Campaign
          </h1>
          <p className="font-paragraph text-lg text-primary/70 mb-6">
            {loadError}
          </p>
          <Link to="/admin">
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-8 py-3">
              Back to Admin
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-primary/10 shadow-sm">
        <div className="max-w-[120rem] mx-auto px-8 py-6 flex justify-between items-center">
          <Link to="/admin" className="flex items-center gap-2 text-primary hover:text-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-paragraph text-base">Back to Admin</span>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-primary">Campaign Dates Manager</h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Main Content */}
      <section className="w-full max-w-[100rem] mx-auto px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-primary/5 rounded-lg p-12 shadow-lg">
            <h2 className="font-heading text-4xl font-bold text-primary mb-2">
              Update Campaign Dates
            </h2>
            <p className="font-paragraph text-lg text-primary/70 mb-8">
              Set the start and end dates for your fundraising campaign. The countdown timer will automatically update.
            </p>

            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-8 p-4 bg-secondary/10 border-2 border-secondary rounded-lg flex items-start gap-3"
              >
                <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-paragraph font-semibold text-secondary">
                    Campaign Dates Updated Successfully!
                  </p>
                  <p className="font-paragraph text-sm text-secondary/80 mt-1">
                    Your campaign dates have been updated and the countdown timer will reflect the changes.
                  </p>
                </div>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="text-secondary hover:text-secondary/70 flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-8 p-4 bg-destructive/10 border-2 border-destructive rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-paragraph font-semibold text-destructive">
                    Unable to Update Campaign Dates
                  </p>
                  <p className="font-paragraph text-sm text-destructive/80 mt-1">
                    {submitError}
                  </p>
                </div>
                <button
                  onClick={() => setSubmitError(null)}
                  className="text-destructive hover:text-destructive/70 flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Start Date Section */}
              <div className="space-y-6 pb-8 border-b border-primary/10">
                <h3 className="font-heading text-2xl font-bold text-primary">Campaign Start</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-paragraph text-base font-semibold text-primary">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="border-primary/20 focus:border-secondary"
                    />
                    <p className="font-paragraph text-sm text-primary/60">
                      When should the campaign start?
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-base font-semibold text-primary">
                      Start Time (Optional)
                    </label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="border-primary/20 focus:border-secondary"
                    />
                    <p className="font-paragraph text-sm text-primary/60">
                      Format: HH:MM (24-hour)
                    </p>
                  </div>
                </div>

                {startDate && (
                  <div className="bg-background rounded-lg p-4">
                    <p className="font-paragraph text-sm text-primary/60 mb-1">Preview:</p>
                    <p className="font-heading text-lg font-bold text-primary">
                      {new Date(startDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      {startTime && ` at ${startTime}`}
                    </p>
                  </div>
                )}
              </div>

              {/* End Date Section */}
              <div className="space-y-6">
                <h3 className="font-heading text-2xl font-bold text-primary">Campaign End</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-paragraph text-base font-semibold text-primary">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="border-primary/20 focus:border-secondary"
                    />
                    <p className="font-paragraph text-sm text-primary/60">
                      When should the campaign end?
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-base font-semibold text-primary">
                      End Time (Optional)
                    </label>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="border-primary/20 focus:border-secondary"
                    />
                    <p className="font-paragraph text-sm text-primary/60">
                      Format: HH:MM (24-hour)
                    </p>
                  </div>
                </div>

                {endDate && (
                  <div className="bg-background rounded-lg p-4">
                    <p className="font-paragraph text-sm text-primary/60 mb-1">Preview:</p>
                    <p className="font-heading text-lg font-bold text-primary">
                      {new Date(endDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      {endTime && ` at ${endTime}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Duration Info */}
              {startDate && endDate && (
                <div className="bg-secondary/10 rounded-lg p-6 border-2 border-secondary/20">
                  <p className="font-paragraph text-sm text-primary/60 mb-2">Campaign Duration:</p>
                  <p className="font-heading text-xl font-bold text-primary">
                    {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full py-6 text-lg font-bold transition-all disabled:opacity-70"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    'Update Campaign Dates'
                  )}
                </Button>
                <Link to="/admin" className="flex-1">
                  <Button
                    type="button"
                    className="w-full bg-primary/10 text-primary hover:bg-primary/20 rounded-full py-6 text-lg font-bold transition-all border-2 border-primary/20"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
