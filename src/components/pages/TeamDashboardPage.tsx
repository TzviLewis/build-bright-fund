import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BaseCrudService } from '@/integrations';
import { Donations, Teams } from '@/entities';
import { LogOut, DollarSign, MessageSquare, AlertCircle, CheckCircle, Loader2, TrendingUp, Users, Heart, BarChart3, Send, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface DonationReply {
  id: string;
  message: string;
  timestamp: string;
}

export default function TeamDashboardPage() {
  const navigate = useNavigate();
  const [teamId, setTeamId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [donations, setDonations] = useState<Donations[]>([]);
  const [team, setTeam] = useState<Teams | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [savingReply, setSavingReply] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const storedTeamId = sessionStorage.getItem('teamId');
    const storedTeamName = sessionStorage.getItem('teamName');

    if (!storedTeamId) {
      navigate('/team-login', { replace: true });
      return;
    }

    setTeamId(storedTeamId);
    setTeamName(storedTeamName || '');
    loadData(storedTeamId);
  }, [navigate]);

  const loadData = async (tId: string) => {
    try {
      setLoading(true);
      const [teamData, allDonations] = await Promise.all([
        BaseCrudService.getById<Teams>('teams', tId),
        BaseCrudService.getAll<Donations>('donations'),
      ]);

      setTeam(teamData);
      // Filter donations for this team
      const teamDonations = allDonations.items.filter(d => d.teamId === tId);
      setDonations(teamDonations);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (donationId: string) => {
    if (!replyMessage.trim()) {
      setError('Please enter a reply message');
      return;
    }

    setSavingReply(true);
    setError('');

    try {
      const donation = donations.find(d => d._id === donationId);
      if (!donation) return;

      const newReply: DonationReply = {
        id: crypto.randomUUID(),
        message: replyMessage,
        timestamp: new Date().toISOString(),
      };

      const existingReplies = donation.replies ? JSON.parse(donation.replies) : [];
      const updatedReplies = [...existingReplies, newReply];

      await BaseCrudService.update<Donations>('donations', {
        _id: donationId,
        replies: JSON.stringify(updatedReplies),
      });

      setSuccessMessage('Reply sent successfully!');
      setReplyingTo(null);
      setReplyMessage('');

      // Reload donations
      await loadData(teamId);

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to send reply');
      console.error(err);
    } finally {
      setSavingReply(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('teamAuth');
    sessionStorage.removeItem('teamId');
    sessionStorage.removeItem('teamName');
    navigate('/team-login');
  };

  const getReplies = (donationId: string): DonationReply[] => {
    const donation = donations.find(d => d._id === donationId);
    if (!donation || !donation.replies) return [];
    try {
      return JSON.parse(donation.replies);
    } catch {
      return [];
    }
  };

  const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="text-primary" size={48} />
          <p className="font-heading text-primary text-lg">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="bg-white border-b border-primary/10 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <h1 className="font-heading text-3xl font-bold text-primary">{teamName}</h1>
            <p className="font-paragraph text-sm text-primary/60">Team Management Dashboard</p>
          </motion.div>
          <Button
            onClick={handleLogout}
            className="bg-primary hover:bg-primary/90 text-white font-heading flex items-center gap-2 rounded-lg px-6 py-2"
          >
            <LogOut size={18} />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl border border-primary/10 p-8 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="font-paragraph text-sm text-primary/60">Total Donations</p>
                <p className="font-heading text-4xl font-bold text-primary">
                  £{totalDonations.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="w-14 h-14 rounded-lg bg-secondary/10 flex items-center justify-center">
                <DollarSign className="text-secondary" size={28} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl border border-primary/10 p-8 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="font-paragraph text-sm text-primary/60">Total Donors</p>
                <p className="font-heading text-4xl font-bold text-primary">{donations.length}</p>
              </div>
              <div className="w-14 h-14 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Users className="text-secondary" size={28} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl border border-primary/10 p-8 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="font-paragraph text-sm text-primary/60">Avg. Donation</p>
                <p className="font-heading text-4xl font-bold text-primary">
                  £{donations.length > 0 ? (totalDonations / donations.length).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}
                </p>
              </div>
              <div className="w-14 h-14 rounded-lg bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="text-secondary" size={28} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl border border-primary/10 shadow-sm overflow-hidden"
        >
          <Tabs defaultValue="donations" className="w-full">
            <TabsList className="w-full justify-start border-b border-primary/10 bg-primary/5 rounded-none px-6 py-0">
              <TabsTrigger value="donations" className="font-heading font-semibold text-base py-4 px-6 border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-transparent rounded-none">
                <Heart size={18} className="mr-2" />
                Donations
              </TabsTrigger>
              <TabsTrigger value="analytics" className="font-heading font-semibold text-base py-4 px-6 border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-transparent rounded-none">
                <BarChart3 size={18} className="mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="donations" className="p-8 space-y-6">
              {donations.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                  <p className="font-heading text-2xl font-bold text-primary mb-2">No donations yet</p>
                  <p className="font-paragraph text-primary/60">Donations will appear here as supporters contribute to your campaign</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {donations.map((donation, index) => {
                    const replies = getReplies(donation._id);
                    return (
                      <motion.div
                        key={donation._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border border-primary/10 rounded-lg overflow-hidden hover:border-secondary/30 transition-all"
                      >
                        {/* Donation Header */}
                        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 border-b border-primary/10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                                <Heart className="w-6 h-6 text-secondary" />
                              </div>
                              <div className="flex-1">
                                <p className="font-heading text-lg font-bold text-primary">
                                  {donation.isAnonymous ? 'Anonymous Supporter' : donation.donorName}
                                </p>
                                <p className="font-paragraph text-sm text-primary/60">
                                  {donation.donationDate ? new Date(donation.donationDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date unknown'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-heading text-3xl font-bold text-secondary">
                                £{donation.amount?.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Message */}
                        {donation.donorMessage && (
                          <div className="px-6 py-4 bg-primary/5 border-b border-primary/10">
                            <p className="font-paragraph text-base text-primary/80 italic border-l-4 border-secondary pl-4">
                              "{donation.donorMessage}"
                            </p>
                          </div>
                        )}

                        {/* Replies */}
                        {replies.length > 0 && (
                          <div className="px-6 py-4 bg-secondary/5 border-b border-secondary/10 space-y-4">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-5 h-5 text-secondary" />
                              <p className="font-heading font-bold text-secondary">Team Response{replies.length > 1 ? 's' : ''}</p>
                            </div>
                            <div className="space-y-3">
                              {replies.map((reply) => (
                                <div key={reply.id} className="bg-white rounded-lg p-4 border border-secondary/20">
                                  <p className="font-paragraph text-base text-primary/80 mb-2">{reply.message}</p>
                                  <p className="font-paragraph text-xs text-primary/50">
                                    {new Date(reply.timestamp).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Reply Form */}
                        <div className="px-6 py-4 bg-background">
                          {replyingTo === donation._id ? (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-4"
                            >
                              <Textarea
                                placeholder="Write your reply to this donor..."
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                disabled={savingReply}
                                className="font-paragraph text-base border-primary/20 focus:border-secondary focus:ring-secondary min-h-[120px]"
                              />
                              <div className="flex gap-3">
                                <Button
                                  onClick={() => handleReply(donation._id)}
                                  disabled={savingReply || !replyMessage.trim()}
                                  className="bg-secondary hover:bg-secondary/90 text-white font-heading flex items-center gap-2 rounded-lg px-6"
                                >
                                  {savingReply ? (
                                    <>
                                      <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                      />
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      <Send size={16} />
                                      Send Reply
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyMessage('');
                                  }}
                                  disabled={savingReply}
                                  className="border-primary/20 text-primary hover:bg-primary/5 font-heading rounded-lg px-6"
                                >
                                  <X size={16} className="mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </motion.div>
                          ) : (
                            <Button
                              onClick={() => setReplyingTo(donation._id)}
                              className="bg-primary/10 hover:bg-primary/20 text-primary font-heading flex items-center gap-2 rounded-lg px-6"
                              variant="outline"
                            >
                              <MessageSquare size={16} />
                              Reply to Donor
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="font-heading text-xl font-bold text-primary">Donation Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
                      <span className="font-paragraph text-primary/70">Total Donations</span>
                      <span className="font-heading font-bold text-primary">{donations.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-secondary/5 rounded-lg">
                      <span className="font-paragraph text-primary/70">Anonymous Donations</span>
                      <span className="font-heading font-bold text-secondary">{donations.filter(d => d.isAnonymous).length}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
                      <span className="font-paragraph text-primary/70">Named Donations</span>
                      <span className="font-heading font-bold text-primary">{donations.filter(d => !d.isAnonymous).length}</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  <h3 className="font-heading text-xl font-bold text-primary">Engagement</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
                      <span className="font-paragraph text-primary/70">Donations with Messages</span>
                      <span className="font-heading font-bold text-primary">{donations.filter(d => d.donorMessage).length}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-secondary/5 rounded-lg">
                      <span className="font-paragraph text-primary/70">Total Replies Sent</span>
                      <span className="font-heading font-bold text-secondary">
                        {donations.reduce((sum, d) => sum + getReplies(d._id).length, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
                      <span className="font-paragraph text-primary/70">Avg. Donation Amount</span>
                      <span className="font-heading font-bold text-primary">
                        £{donations.length > 0 ? (totalDonations / donations.length).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
