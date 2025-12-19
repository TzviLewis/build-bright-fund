import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BaseCrudService } from '@/integrations';
import { Matchers } from '@/entities';
import { ArrowLeft, Trash2, AlertCircle, CheckCircle, Loader2, Plus, Edit, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface MatcherFormState {
  matcherName: string;
  matchingAmount: string;
  matchingPercentage: string;
  matcherStatus: string;
  contactEmail: string;
  matchingLimit: string;
}

export default function AdminMatchersPage() {
  const navigate = useNavigate();
  const [matchers, setMatchers] = useState<Matchers[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MatcherFormState>({
    matcherName: '',
    matchingAmount: '',
    matchingPercentage: '',
    matcherStatus: 'Active',
    contactEmail: '',
    matchingLimit: '',
  });

  useEffect(() => {
    loadMatchers();
  }, []);

  const loadMatchers = async () => {
    try {
      setLoading(true);
      const { items } = await BaseCrudService.getAll<Matchers>('matchers');
      setMatchers(items);
    } catch (err) {
      setError('Failed to load matchers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.matcherName.trim()) {
      setError('Please enter matcher name');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingId) {
        // Update existing
        await BaseCrudService.update<Matchers>('matchers', {
          _id: editingId,
          matcherName: formData.matcherName,
          matchingAmount: parseFloat(formData.matchingAmount) || 0,
          matchingPercentage: parseFloat(formData.matchingPercentage) || 0,
          status: formData.matcherStatus,
          contactEmail: formData.contactEmail,
          matchingLimit: parseFloat(formData.matchingLimit) || 0,
        });
        setSuccessMessage('Matcher updated successfully');
      } else {
        // Create new
        await BaseCrudService.create('matchers', {
          _id: crypto.randomUUID(),
          matcherName: formData.matcherName,
          matchingAmount: parseFloat(formData.matchingAmount) || 0,
          matchingPercentage: parseFloat(formData.matchingPercentage) || 0,
          status: formData.matcherStatus,
          contactEmail: formData.contactEmail,
          matchingLimit: parseFloat(formData.matchingLimit) || 0,
        });
        setSuccessMessage('Matcher created successfully');
      }

      resetForm();
      await loadMatchers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to save matcher');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (matcher: Matchers) => {
    setFormData({
      matcherName: matcher.matcherName || '',
      matchingAmount: matcher.matchingAmount?.toString() || '',
      matchingPercentage: matcher.matchingPercentage?.toString() || '',
      matcherStatus: matcher.status || 'Active',
      contactEmail: matcher.contactEmail || '',
      matchingLimit: matcher.matchingLimit?.toString() || '',
    });
    setEditingId(matcher._id);
    setShowNewForm(true);
  };

  const handleDelete = async (matcherId: string) => {
    if (!confirm('Are you sure you want to delete this matcher?')) return;

    setDeleting(matcherId);
    setError('');

    try {
      await BaseCrudService.delete('matchers', matcherId);
      setMatchers(matchers.filter(m => m._id !== matcherId));
      setSuccessMessage('Matcher deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete matcher');
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setFormData({
      matcherName: '',
      matchingAmount: '',
      matchingPercentage: '',
      matcherStatus: 'Active',
      contactEmail: '',
      matchingLimit: '',
    });
    setEditingId(null);
    setShowNewForm(false);
  };

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
            <h1 className="text-2xl font-bold text-primary">Matchers Management</h1>
            <p className="text-sm text-gray-600">Manage matching donors and their limits</p>
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

        {/* New/Edit Form */}
        {showNewForm && (
          <Card className="mb-8">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>{editingId ? 'Edit Matcher' : 'Add New Matcher'}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetForm}
              >
                <X size={16} />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Matcher Name</label>
                  <Input
                    name="matcherName"
                    value={formData.matcherName}
                    onChange={handleInputChange}
                    placeholder="e.g., John Smith"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Contact Email</label>
                  <Input
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Matching Amount ($)</label>
                  <Input
                    name="matchingAmount"
                    type="number"
                    value={formData.matchingAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Matching Percentage (%)</label>
                  <Input
                    name="matchingPercentage"
                    type="number"
                    value={formData.matchingPercentage}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Matching Limit ($)</label>
                  <Input
                    name="matchingLimit"
                    type="number"
                    value={formData.matchingLimit}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Status</label>
                  <select
                    name="matcherStatus"
                    value={formData.matcherStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Button */}
        {!showNewForm && (
          <Button
            onClick={() => setShowNewForm(true)}
            className="mb-8 bg-primary hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Matcher
          </Button>
        )}

        {/* Matchers List */}
        <Card>
          <CardHeader>
            <CardTitle>Matchers ({matchers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {matchers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No matchers yet</p>
            ) : (
              <div className="space-y-4">
                {matchers.map((matcher, index) => (
                  <motion.div
                    key={matcher._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{matcher.matcherName}</p>
                        <p className="text-sm text-gray-600">{matcher.contactEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Status</p>
                        <div className="flex items-center gap-2 justify-end mt-1">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              matcher.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          />
                          <p className="font-semibold">{matcher.status}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 p-3 rounded">
                      <div>
                        <p className="text-xs text-gray-600">Matching Amount</p>
                        <p className="font-semibold text-primary">${matcher.matchingAmount?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Matching %</p>
                        <p className="font-semibold text-primary">{matcher.matchingPercentage}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Limit</p>
                        <p className="font-semibold text-primary">${matcher.matchingLimit?.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(matcher)}
                        className="flex items-center gap-2"
                      >
                        <Edit size={14} />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(matcher._id)}
                        disabled={deleting === matcher._id}
                        className="flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        {deleting === matcher._id ? 'Deleting...' : 'Delete'}
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
