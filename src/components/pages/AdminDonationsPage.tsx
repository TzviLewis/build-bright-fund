import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BaseCrudService } from '@/integrations';
import { Donations, Teams } from '@/entities';
import { ArrowLeft, Trash2, AlertCircle, CheckCircle, Loader2, DollarSign, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDonationsPage() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donations[]>([]);
  const [teams, setTeams] = useState<Teams[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [donationsData, teamsData] = await Promise.all([
        BaseCrudService.getAll<Donations>('donations'),
        BaseCrudService.getAll<Teams>('teams'),
      ]);
      setDonations(donationsData.items);
      setTeams(teamsData.items);
    } catch (err) {
      setError('Failed to load donations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (donationId: string) => {
    if (!confirm('Are you sure you want to delete this donation?')) return;

    setDeleting(donationId);
    setError('');

    try {
      await BaseCrudService.delete('donations', donationId);
      setDonations(donations.filter(d => d._id !== donationId));
      setSuccessMessage('Donation deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete donation');
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const getTeamName = (teamId?: string) => {
    if (!teamId) return 'Unknown Team';
    const team = teams.find(t => t._id === teamId);
    return team?.teamName || 'Unknown Team';
  };

  const filteredDonations = donations.filter(d => {
    const matchesSearch =
      d.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.donorEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.donorMessage?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTeam = filterTeam === 'all' || d.teamId === filterTeam;

    return matchesSearch && matchesTeam;
  });

  const totalAmount = filteredDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const anonymousDonations = filteredDonations.filter(d => d.isAnonymous).length;

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
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">Donations Management</h1>
            <p className="text-sm text-gray-600">View and manage all donations</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Admin
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Donations</p>
                <p className="text-3xl font-bold text-primary">${totalAmount.toFixed(2)}</p>
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
            <div>
              <p className="text-sm text-gray-600">Number of Donations</p>
              <p className="text-3xl font-bold text-primary">{filteredDonations.length}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div>
              <p className="text-sm text-gray-600">Anonymous Donations</p>
              <p className="text-3xl font-bold text-secondary">{anonymousDonations}</p>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter size={20} />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Search</label>
                <Input
                  placeholder="Search by donor name, email, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Team</label>
                <select
                  value={filterTeam}
                  onChange={(e) => setFilterTeam(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Teams</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>
                      {team.teamName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donations List */}
        <Card>
          <CardHeader>
            <CardTitle>Donations</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDonations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No donations found</p>
            ) : (
              <div className="space-y-4">
                {filteredDonations.map((donation, index) => (
                  <motion.div
                    key={donation._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-lg">
                            {donation.isAnonymous ? 'Anonymous Donor' : donation.donorName}
                          </p>
                          {donation.isAnonymous && (
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              Anonymous
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Team: {getTeamName(donation.teamId)} • {new Date(donation.donationDate || '').toLocaleDateString()}
                        </p>
                        {donation.donorEmail && !donation.isAnonymous && (
                          <p className="text-sm text-gray-600">{donation.donorEmail}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${donation.amount?.toFixed(2)}</p>
                        {donation.status && (
                          <p className="text-xs text-gray-600 mt-1">{donation.status}</p>
                        )}
                      </div>
                    </div>

                    {donation.donorMessage && (
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <p className="text-sm text-gray-700">{donation.donorMessage}</p>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(donation._id)}
                        disabled={deleting === donation._id}
                        className="flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        {deleting === donation._id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
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
