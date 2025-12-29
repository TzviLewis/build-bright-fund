import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, AlertTriangle, Loader2, Copy, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails, Donations, Teams, Matchers } from '@/entities';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'warning' | 'error' | 'loading';
  message: string;
  details?: string;
}

export default function DiagnosticPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const newResults: DiagnosticResult[] = [];

    try {
      // Check 1: Campaign exists
      newResults.push({ name: 'Checking campaigns...', status: 'loading', message: 'Loading...' });
      setResults([...newResults]);

      const campaignRes = await BaseCrudService.getAll<CampaignDetails>('campaigndetails');
      const campaigns = campaignRes.items || [];

      if (campaigns.length === 0) {
        newResults[newResults.length - 1] = {
          name: 'Campaigns',
          status: 'warning',
          message: 'No campaigns found',
          details: 'Create a campaign in Admin Dashboard to get started'
        };
      } else {
        newResults[newResults.length - 1] = {
          name: 'Campaigns',
          status: 'success',
          message: `Found ${campaigns.length} campaign(s)`,
          details: campaigns.map(c => `• ${c.campaignTitle} (${c.status})`).join('\n')
        };
      }

      // Check 2: Teams exist
      newResults.push({ name: 'Checking teams...', status: 'loading', message: 'Loading...' });
      setResults([...newResults]);

      const teamsRes = await BaseCrudService.getAll<Teams>('teams');
      const teams = teamsRes.items || [];

      if (teams.length === 0) {
        newResults[newResults.length - 1] = {
          name: 'Teams',
          status: 'warning',
          message: 'No teams found',
          details: 'Create teams in Admin Dashboard'
        };
      } else {
        const teamsWithoutCreds = teams.filter(t => !t.teamId || !t.teamPassword);
        if (teamsWithoutCreds.length > 0) {
          newResults[newResults.length - 1] = {
            name: 'Teams',
            status: 'warning',
            message: `Found ${teams.length} team(s), ${teamsWithoutCreds.length} missing credentials`,
            details: `Teams without credentials: ${teamsWithoutCreds.map(t => t.teamName).join(', ')}`
          };
        } else {
          newResults[newResults.length - 1] = {
            name: 'Teams',
            status: 'success',
            message: `Found ${teams.length} team(s) with credentials`,
            details: teams.map(t => `• ${t.teamName} (ID: ${t.teamId})`).join('\n')
          };
        }
      }

      // Check 3: Donations exist
      newResults.push({ name: 'Checking donations...', status: 'loading', message: 'Loading...' });
      setResults([...newResults]);

      const donationsRes = await BaseCrudService.getAll<Donations>('donations');
      const donations = donationsRes.items || [];

      if (donations.length === 0) {
        newResults[newResults.length - 1] = {
          name: 'Donations',
          status: 'warning',
          message: 'No donations found',
          details: 'Donations will appear after donors contribute'
        };
      } else {
        const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
        newResults[newResults.length - 1] = {
          name: 'Donations',
          status: 'success',
          message: `Found ${donations.length} donation(s)`,
          details: `Total: £${totalAmount.toLocaleString()}`
        };
      }

      // Check 4: API endpoint
      newResults.push({ name: 'Checking email API...', status: 'loading', message: 'Loading...' });
      setResults([...newResults]);

      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'test@example.com',
            subject: 'Test',
            html: '<p>Test</p>'
          })
        });

        if (response.status === 400 || response.status === 200) {
          newResults[newResults.length - 1] = {
            name: 'Email API',
            status: 'success',
            message: 'Email API endpoint is accessible',
            details: 'Ready to send emails'
          };
        } else {
          newResults[newResults.length - 1] = {
            name: 'Email API',
            status: 'error',
            message: `API returned status ${response.status}`,
            details: 'Check server logs for details'
          };
        }
      } catch (err) {
        newResults[newResults.length - 1] = {
          name: 'Email API',
          status: 'error',
          message: 'Email API endpoint not accessible',
          details: err instanceof Error ? err.message : 'Unknown error'
        };
      }

      // Check 5: Admin auth
      newResults.push({ name: 'Checking admin auth...', status: 'loading', message: 'Loading...' });
      setResults([...newResults]);

      const adminAuth = sessionStorage.getItem('adminAuth');
      if (adminAuth === 'true') {
        newResults[newResults.length - 1] = {
          name: 'Admin Authentication',
          status: 'success',
          message: 'Admin is logged in',
          details: 'You have access to Admin Dashboard'
        };
      } else {
        newResults[newResults.length - 1] = {
          name: 'Admin Authentication',
          status: 'warning',
          message: 'Admin is not logged in',
          details: 'Go to /admin-login to access Admin Dashboard'
        };
      }

      setResults(newResults);
    } catch (error) {
      newResults.push({
        name: 'Diagnostics',
        status: 'error',
        message: 'Error running diagnostics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      setResults(newResults);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  const getBgColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'loading':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Open Diagnostic Panel"
      >
        <AlertCircle className="w-6 h-6" />
      </motion.button>

      {/* Diagnostic Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-8 w-96 max-h-[600px] overflow-y-auto z-50"
          >
            <Card className="shadow-2xl border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center">
                <CardTitle className="font-heading text-lg">System Diagnostics</CardTitle>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-blue-500 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {results.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="font-paragraph text-gray-600 mb-4">
                      Click "Run Diagnostics" to check system status
                    </p>
                    <Button
                      onClick={runDiagnostics}
                      disabled={loading}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        'Run Diagnostics'
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {results.map((result, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg border ${getBgColor(result.status)}`}
                        >
                          <div className="flex items-start gap-3">
                            {getIcon(result.status)}
                            <div className="flex-1">
                              <p className="font-heading font-semibold text-sm text-gray-900">
                                {result.name}
                              </p>
                              <p className="font-paragraph text-xs text-gray-700 mt-1">
                                {result.message}
                              </p>
                              {result.details && (
                                <p className="font-paragraph text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                                  {result.details}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <Button
                      onClick={runDiagnostics}
                      disabled={loading}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 mt-4"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        'Run Again'
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
