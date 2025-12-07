import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BaseCrudService } from '@/integrations';
import { Teams, Donations } from '@/entities';
import { ArrowLeft, Heart, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';

export default function TeamPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Teams | null>(null);
  const [donations, setDonations] = useState<Donations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      
      // Fetch team by ID
      const teamData = await BaseCrudService.getById<Teams>('teams', teamId || '');
      setTeam(teamData);

      // Fetch all donations
      const { items: donationItems } = await BaseCrudService.getAll<Donations>('donations');
      
      // Filter donations for this team
      const teamDonations = donationItems.filter(d => d.teamId === teamId && d.status === 'completed');
      setDonations(teamDonations);
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary font-heading text-2xl">Loading...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background border-b border-primary/10 shadow-sm">
          <div className="max-w-[120rem] mx-auto px-8 py-6">
            <Link to="/">
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full px-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaign
              </Button>
            </Link>
          </div>
        </header>
        <div className="max-w-[120rem] mx-auto px-8 py-20 text-center">
          <h1 className="font-heading text-4xl font-bold text-primary mb-4">Team Not Found</h1>
          <p className="font-paragraph text-lg text-primary/80 mb-8">
            The team you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/">
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-8 py-6 text-lg font-semibold">
              Return to Campaign
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalRaised = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const progressPercentage = team.fundraisingGoal 
    ? Math.min((totalRaised / team.fundraisingGoal) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-primary/10 shadow-sm">
        <div className="max-w-[120rem] mx-auto px-8 py-6 flex justify-between items-center">

          <Link to="/">
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </header>
      {/* Team Hero Section */}
      <section className="w-full max-w-[120rem] mx-auto px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Team Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="font-heading text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-primary block">{team.teamName}</span>
                <span className="text-secondary block italic">Team</span>
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4">

              <div className="bg-secondary/10 rounded-lg p-6">
                <p className="font-paragraph text-sm text-primary/60 mb-2">Total Raised</p>
                <p className="font-heading text-4xl font-bold text-secondary">
                  £{totalRaised.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Team Logo */}
          {team.teamLogo && (
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-lg overflow-hidden shadow-2xl">
                <Image 
                  src={team.teamLogo}
                  alt={team.teamName || 'Team logo'}
                  className="w-full h-[600px] object-cover"
                  width={800}
                />
              </div>
            </motion.div>
          )}
        </div>
      </section>
      {/* Progress Section */}
      <section className="w-full bg-primary/5 py-20">
        <div className="max-w-[120rem] mx-auto px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-background rounded-lg p-10 space-y-6 border-2 border-primary/10"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-10 h-10 text-secondary" />
              <h2 className="font-heading text-3xl font-bold text-primary">Fundraising Progress</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="font-heading text-5xl font-bold text-secondary">
                  £{totalRaised.toLocaleString()}
                </span>
                <span className="font-paragraph text-xl text-primary/70">
                  of £{team.fundraisingGoal?.toLocaleString() || '0'} goal
                </span>
              </div>
              
              <div className="w-full bg-primary/10 rounded-full h-6 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${progressPercentage}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="bg-secondary h-full rounded-full"
                />
              </div>
              
              <p className="font-paragraph text-lg text-primary/80">
                <span className="font-bold text-secondary">{progressPercentage.toFixed(1)}%</span> of goal achieved with the support of <span className="font-bold">{donations.length}</span> generous donor{donations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Donors Section */}
      <section className="w-full max-w-[120rem] mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="font-heading text-5xl font-bold text-primary mb-4">
            Team <span className="text-secondary italic">Supporters</span>
          </h2>

        </div>

        {donations.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-primary/30 mx-auto mb-4" />
            <p className="font-paragraph text-lg text-primary/60">
              No donations yet. Be the first to support this team!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((donation, index) => (
              <motion.div
                key={donation._id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-primary/5 rounded-lg p-6 space-y-3 border-2 border-primary/10 hover:border-secondary/30 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-heading text-xl font-bold text-primary">
                      {donation.donorName || 'Anonymous Supporter'}
                    </p>
                    <p className="font-paragraph text-sm text-primary/60">
                      {donation.donationDate ? new Date(donation.donationDate).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <p className="font-heading text-2xl font-bold text-secondary">
                    £{donation.amount?.toLocaleString()}
                  </p>
                </div>
                {donation.donorMessage && (
                  <p className="font-paragraph text-base text-primary/70 italic border-l-4 border-secondary pl-4">
                    "{donation.donorMessage}"
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </section>
      {/* Call to Action */}
      <section className="w-full bg-primary py-20">
        <div className="max-w-[120rem] mx-auto px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="font-heading text-5xl font-bold text-primary-foreground mb-4">
              Support <span className="italic text-secondary">{team.teamName}</span>
            </h2>

            <Link to="/#donate">
              <Button 
                size="lg" 
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-8 py-6 text-lg font-semibold"
              >
                Make a Donation
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16 border-t border-primary/20">
        <div className="max-w-[120rem] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-4">

            </div>

            <div className="space-y-4">
              <h4 className="font-heading text-xl font-bold">Quick Links</h4>
              <nav className="flex flex-col gap-3">
                <Link to="/" className="font-paragraph text-base text-primary-foreground/80 hover:text-secondary transition-colors">
                  Campaign Details
                </Link>
                <Link to="/#donate" className="font-paragraph text-base text-primary-foreground/80 hover:text-secondary transition-colors">
                  Make a Donation
                </Link>
                <Link to="/#progress" className="font-paragraph text-base text-primary-foreground/80 hover:text-secondary transition-colors">
                  View Progress
                </Link>
              </nav>
            </div>

            <div className="space-y-4">

            </div>
          </div>

          <div className="pt-8 border-t border-primary-foreground/20 text-center">
            <p className="font-paragraph text-sm text-primary-foreground/70">
              © {new Date().getFullYear()} School Fundraising Campaign. All rights reserved. | Secure & Trusted Donations
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
