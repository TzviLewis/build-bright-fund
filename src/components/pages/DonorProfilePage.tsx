import { useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { Donations } from '@/entities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Heart, TrendingUp, Calendar } from 'lucide-react';
import moment from 'moment';

export default function DonorProfilePage() {
  const { member } = useMember();
  const [donations, setDonations] = useState<Donations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalDonated, setTotalDonated] = useState(0);
  const [donationCount, setDonationCount] = useState(0);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setIsLoading(true);
        // Fetch all donations and filter by donor email
        const { items } = await BaseCrudService.getAll<Donations>('donations');
        
        // Filter donations by the current member's email
        const memberDonations = items.filter(
          (donation) => donation.donorEmail === member?.loginEmail
        );

        setDonations(memberDonations);
        
        // Calculate total donated amount
        const total = memberDonations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
        setTotalDonated(total);
        setDonationCount(memberDonations.length);
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (member?.loginEmail) {
      fetchDonations();
    }
  }, [member?.loginEmail]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
            Donor Profile
          </h1>
          <p className="text-lg font-paragraph text-muted-foreground">
            Welcome back, {member?.profile?.nickname || member?.contact?.firstName || 'Donor'}!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Donated Card */}
          <Card className="p-6 border border-muted">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-paragraph text-muted-foreground mb-2">
                  Total Donated
                </p>
                <p className="text-3xl font-heading font-bold text-foreground">
                  ${totalDonated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Heart className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </Card>

          {/* Donation Count Card */}
          <Card className="p-6 border border-muted">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-paragraph text-muted-foreground mb-2">
                  Total Donations
                </p>
                <p className="text-3xl font-heading font-bold text-foreground">
                  {donationCount}
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
            </div>
          </Card>

          {/* Average Donation Card */}
          <Card className="p-6 border border-muted">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-paragraph text-muted-foreground mb-2">
                  Average Donation
                </p>
                <p className="text-3xl font-heading font-bold text-foreground">
                  ${donationCount > 0 ? (totalDonated / donationCount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Donation History Section */}
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
            Donation History
          </h2>

          {donations.length === 0 ? (
            <Card className="p-12 border border-muted text-center">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-paragraph text-muted-foreground">
                You haven't made any donations yet.
              </p>
              <p className="text-sm font-paragraph text-muted-foreground mt-2">
                Start making a difference by donating to a campaign today!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <Card
                  key={donation._id}
                  className="p-6 border border-muted hover:border-secondary/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-heading font-semibold text-foreground">
                          ${donation.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        {donation.isAnonymous && (
                          <Badge variant="outline" className="text-xs">
                            Anonymous
                          </Badge>
                        )}
                        {donation.status && (
                          <Badge
                            variant={donation.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                          </Badge>
                        )}
                      </div>
                      {donation.donorMessage && (
                        <p className="text-sm font-paragraph text-muted-foreground mb-3">
                          "{donation.donorMessage}"
                        </p>
                      )}
                      <p className="text-xs font-paragraph text-muted-foreground">
                        {moment(donation.donationDate).format('MMMM D, YYYY [at] h:mm A')}
                      </p>
                    </div>
                    {donation.teamId && (
                      <div className="text-right">
                        <p className="text-xs font-paragraph text-muted-foreground mb-1">
                          Team ID
                        </p>
                        <p className="text-sm font-heading font-semibold text-foreground">
                          {donation.teamId}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Donor Info Section */}
        <div className="mt-12 pt-8 border-t border-muted">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
            Account Information
          </h3>
          <Card className="p-6 border border-muted">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-paragraph text-muted-foreground mb-1">
                  Email
                </p>
                <p className="text-base font-paragraph text-foreground">
                  {member?.loginEmail}
                </p>
              </div>
              {member?.contact?.firstName && (
                <div>
                  <p className="text-sm font-paragraph text-muted-foreground mb-1">
                    Name
                  </p>
                  <p className="text-base font-paragraph text-foreground">
                    {member.contact.firstName} {member.contact.lastName || ''}
                  </p>
                </div>
              )}
              {member?.profile?.nickname && (
                <div>
                  <p className="text-sm font-paragraph text-muted-foreground mb-1">
                    Nickname
                  </p>
                  <p className="text-base font-paragraph text-foreground">
                    {member.profile.nickname}
                  </p>
                </div>
              )}
              {member?._createdDate && (
                <div>
                  <p className="text-sm font-paragraph text-muted-foreground mb-1">
                    Member Since
                  </p>
                  <p className="text-base font-paragraph text-foreground">
                    {moment(member._createdDate).format('MMMM D, YYYY')}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
