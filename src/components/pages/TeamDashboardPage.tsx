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
import { LogOut, DollarSign, MessageSquare, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">{teamName}</h1>
            <p className="text-sm text-gray-600">Team Dashboard</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Donations</p>
                <p className="text-3xl font-bold text-primary">${totalDonations.toFixed(2)}</p>
              </div>
              <DollarSign className="text-primary/20" size={40} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Number of Donations</p>
                <p className="text-3xl font-bold text-primary">{donations.length}</p>
              </div>
              <MessageSquare className="text-primary/20" size={40} />
            </div>
          </motion.div>
        </div>

        {/* Donations */}
        <Card>
          <CardHeader>
            <CardTitle>Donations & Replies</CardTitle>
          </CardHeader>
          <CardContent>
            {donations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No donations yet</p>
            ) : (
              <div className="space-y-6">
                {donations.map((donation, index) => (
                  <motion.div
                    key={donation._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-lg">
                          {donation.isAnonymous ? 'Anonymous Donor' : donation.donorName}
                        </p>
                        <p className="text-sm text-gray-600">
                          ${donation.amount?.toFixed(2)} • {new Date(donation.donationDate || '').toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${donation.amount?.toFixed(2)}</p>
                      </div>
                    </div>

                    {donation.donorMessage && (
                      <div className="bg-gray-50 rounded p-3 mb-4">
                        <p className="text-sm text-gray-700">{donation.donorMessage}</p>
                      </div>
                    )}

                    {/* Existing Replies */}
                    {getReplies(donation._id).length > 0 && (
                      <div className="bg-blue-50 rounded p-3 mb-4 space-y-2">
                        <p className="text-xs font-semibold text-blue-900">Team Replies:</p>
                        {getReplies(donation._id).map((reply) => (
                          <div key={reply.id} className="text-sm text-blue-800">
                            <p>{reply.message}</p>
                            <p className="text-xs text-blue-600 mt-1">
                              {new Date(reply.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo === donation._id ? (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Write your reply..."
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          disabled={savingReply}
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReply(donation._id)}
                            disabled={savingReply}
                            className="bg-primary hover:bg-primary/90"
                          >
                            {savingReply ? 'Sending...' : 'Send Reply'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyMessage('');
                            }}
                            disabled={savingReply}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReplyingTo(donation._id)}
                        className="flex items-center gap-2"
                      >
                        <MessageSquare size={14} />
                        Reply
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
