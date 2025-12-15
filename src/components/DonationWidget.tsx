import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseCrudService } from '@/integrations';
import { Donations } from '@/entities';
import { Plus, Edit, Trash2, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDonationStore } from '@/stores/donationStore';

interface DonationWidgetProps {
  onDonationsChange?: (donations: Donations[]) => void;
  showManagementTools?: boolean;
  maxDisplayCount?: number;
  pageName?: string;
  teams?: Array<{ _id: string; teamName?: string }>;
}

interface DonationFormState {
  donorName: string;
  donorEmail: string;
  amount: string;
  donorMessage: string;
  status: string;
  selectedTeamIds: string[];
}

export default function DonationWidget({ 
  onDonationsChange, 
  showManagementTools = false,
  maxDisplayCount = 9,
  pageName = 'Donation Page',
  teams = []
}: DonationWidgetProps) {
  const [donations, setDonations] = useState<Donations[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'amount'>('recent');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const { addNotification } = useDonationStore();

  const [formData, setFormData] = useState<DonationFormState>({
    donorName: '',
    donorEmail: '',
    amount: '',
    donorMessage: '',
    status: 'completed',
    selectedTeamIds: [],
  });

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const { items } = await BaseCrudService.getAll<Donations>('donations');
      setDonations(items || []);
      onDonationsChange?.(items || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load donations';
      setError(errorMsg);
      console.error('Error loading donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.donorEmail || !formData.amount) {
      setError('Email and amount are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Double the donation amount
      const originalAmount = parseFloat(formData.amount);
      const doubledAmount = originalAmount * 2;

      // If multiple teams selected, create separate donations for each team
      const teamsToProcess = formData.selectedTeamIds.length > 0 
        ? formData.selectedTeamIds 
        : ['']; // Empty string for individual donation

      for (const teamId of teamsToProcess) {
        const donationData: Donations = {
          _id: editingId || crypto.randomUUID(),
          donorName: formData.donorName || 'Anonymous',
          donorEmail: formData.donorEmail,
          amount: doubledAmount,
          originalAmount: originalAmount,
          donationDate: new Date().toISOString(),
          donorMessage: formData.donorMessage,
          status: formData.status,
          teamId: teamId || undefined,
          teamIds: formData.selectedTeamIds.join(','),
        };

        if (editingId && teamsToProcess.length === 1) {
          await BaseCrudService.update('donations', donationData);
          setSuccessMessage('Donation updated successfully!');
        } else {
          await BaseCrudService.create('donations', donationData);
        }
      }

      if (!editingId) {
        setSuccessMessage(`Donation added successfully! Amount doubled: £${originalAmount} → £${doubledAmount}${formData.selectedTeamIds.length > 1 ? ` (split across ${formData.selectedTeamIds.length} teams)` : ''}`);
        
        // Add notification to store for popup display
        addNotification({
          _id: crypto.randomUUID(),
          donorName: formData.donorName || 'Anonymous',
          donorEmail: formData.donorEmail,
          amount: doubledAmount,
          originalAmount: originalAmount,
          donationDate: new Date().toISOString(),
          donorMessage: formData.donorMessage,
          status: formData.status,
          pageName: pageName,
        });
      }

      resetForm();
      await loadDonations();

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save donation';
      setError(errorMsg);
      console.error('Error saving donation:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditDonation = (donation: Donations) => {
    setFormData({
      donorName: donation.donorName || '',
      donorEmail: donation.donorEmail || '',
      amount: donation.originalAmount?.toString() || donation.amount?.toString() || '',
      donorMessage: donation.donorMessage || '',
      status: donation.status || 'completed',
      selectedTeamIds: donation.teamIds ? donation.teamIds.split(',').filter(id => id) : [],
    });
    setEditingId(donation._id);
    setShowForm(true);
  };

  const handleDeleteDonation = async (donationId: string) => {
    if (!confirm('Are you sure you want to delete this donation?')) return;

    try {
      setError(null);
      await BaseCrudService.delete('donations', donationId);
      setSuccessMessage('Donation deleted successfully!');
      await loadDonations();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete donation';
      setError(errorMsg);
      console.error('Error deleting donation:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      donorName: '',
      donorEmail: '',
      amount: '',
      donorMessage: '',
      status: 'completed',
      selectedTeamIds: [],
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Filter and sort donations
  let filteredDonations = donations.filter(d => 
    filterStatus === 'all' ? true : d.status === filterStatus
  );

  if (sortBy === 'recent') {
    filteredDonations = filteredDonations.sort((a, b) => 
      new Date(b.donationDate || 0).getTime() - new Date(a.donationDate || 0).getTime()
    );
  } else if (sortBy === 'amount') {
    filteredDonations = filteredDonations.sort((a, b) => 
      (b.amount || 0) - (a.amount || 0)
    );
  }

  const displayDonations = filteredDonations.slice(0, maxDisplayCount);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-secondary/10 border-2 border-secondary rounded-lg flex items-start gap-3"
          >
            <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-paragraph font-semibold text-secondary">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-secondary hover:text-secondary/70"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-destructive/10 border-2 border-destructive rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-paragraph font-semibold text-destructive">Error</p>
              <p className="font-paragraph text-sm text-destructive/80 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-destructive hover:text-destructive/70"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Management Tools */}
      {showManagementTools && (
        <>
          {/* Add/Edit Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 rounded-lg p-6 border-2 border-primary/20 space-y-6"
            >
              <h3 className="font-heading text-lg font-bold text-primary">
                {editingId ? 'Edit Donation' : 'Add New Donation'}
              </h3>

              <form onSubmit={handleSubmitDonation} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-semibold text-primary">
                      Donor Name
                    </label>
                    <Input
                      type="text"
                      value={formData.donorName}
                      onChange={(e) => setFormData(prev => ({ ...prev, donorName: e.target.value }))}
                      placeholder="John Smith"
                      className="border-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-semibold text-primary">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.donorEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, donorEmail: e.target.value }))}
                      placeholder="john@example.com"
                      required
                      className="border-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-semibold text-primary">
                      Amount (£) *
                    </label>
                    <div className="space-y-1">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="100.00"
                        required
                        className="border-primary/20"
                      />
                      {formData.amount && (
                        <p className="text-xs text-secondary font-semibold">
                          Will be doubled to: £{(parseFloat(formData.amount) * 2).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-semibold text-primary">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:border-secondary focus:outline-none font-paragraph"
                    >
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                {teams.length > 0 && (
                  <div className="space-y-2">
                    <label className="font-paragraph text-sm font-semibold text-primary">
                      Assign to Teams (Optional - select multiple to split donation)
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-primary/20 rounded-lg p-3 bg-primary/2">
                      {teams.map((team) => (
                        <label key={team._id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.selectedTeamIds.includes(team._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  selectedTeamIds: [...prev.selectedTeamIds, team._id]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  selectedTeamIds: prev.selectedTeamIds.filter(id => id !== team._id)
                                }));
                              }
                            }}
                            className="w-4 h-4 rounded border-primary/20 cursor-pointer"
                          />
                          <span className="font-paragraph text-sm text-primary">
                            {team.teamName || 'Unnamed Team'}
                          </span>
                        </label>
                      ))}
                    </div>
                    {formData.selectedTeamIds.length > 0 && (
                      <p className="text-xs text-secondary font-semibold">
                        Donation will be split across {formData.selectedTeamIds.length} team{formData.selectedTeamIds.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="font-paragraph text-sm font-semibold text-primary">
                    Message
                  </label>
                  <Textarea
                    value={formData.donorMessage}
                    onChange={(e) => setFormData(prev => ({ ...prev, donorMessage: e.target.value }))}
                    placeholder="Optional message from the donor..."
                    className="border-primary/20 min-h-[80px]"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        {editingId ? 'Update' : 'Add'} Donation
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={resetForm}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  if (showForm) {
                    resetForm();
                  } else {
                    setShowForm(true);
                  }
                }}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Donation
              </Button>
            </div>

            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'amount')}
                className="px-4 py-2 border border-primary/20 rounded-lg focus:border-secondary focus:outline-none font-paragraph text-sm"
              >
                <option value="recent">Sort by Recent</option>
                <option value="amount">Sort by Amount</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'completed' | 'pending')}
                className="px-4 py-2 border border-primary/20 rounded-lg focus:border-secondary focus:outline-none font-paragraph text-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Donations Display */}
      {filteredDonations.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-paragraph text-lg text-primary/60">
            {showManagementTools ? 'No donations yet. Add one to get started!' : 'No donations yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayDonations.map((donation) => (
            <motion.div
              key={donation._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary/5 rounded-lg p-6 space-y-3 border border-primary/10"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-heading text-xl font-bold text-primary">
                    {donation.donorName || 'Anonymous'}
                  </p>
                  <p className="font-paragraph text-sm text-primary/60">
                    {donation.donationDate ? new Date(donation.donationDate).toLocaleDateString() : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-2xl font-bold text-secondary">
                    £{donation.amount?.toLocaleString()}
                  </p>
                  {donation.originalAmount && donation.originalAmount !== donation.amount && (
                    <p className="font-paragraph text-xs text-primary/60">
                      (£{donation.originalAmount?.toLocaleString()} × 2)
                    </p>
                  )}
                </div>
              </div>

              {donation.donorMessage && (
                <p className="font-paragraph text-base text-primary/70 italic">
                  "{donation.donorMessage}"
                </p>
              )}

              <div className="pt-3 border-t border-primary/10">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  donation.status === 'completed'
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {donation.status || 'pending'}
                </span>
              </div>

              {showManagementTools && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleEditDonation(donation)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteDonation(donation._id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {filteredDonations.length > maxDisplayCount && (
        <div className="text-center pt-6">
          <p className="font-paragraph text-primary/60">
            Showing {displayDonations.length} of {filteredDonations.length} donations
          </p>
        </div>
      )}
    </div>
  );
}
