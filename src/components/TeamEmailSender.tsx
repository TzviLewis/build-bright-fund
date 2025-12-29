import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Mail, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Teams } from '@/entities';

interface TeamEmailSenderProps {
  team: Teams;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TeamEmailSender({ team, onClose, onSuccess }: TeamEmailSenderProps) {
  const [email, setEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);

      // Create email content
      const emailContent = `
Team Credentials for: ${team.teamName}

Dear Team Lead,

Your team has been registered for the campaign. Here are your login credentials:

TEAM ID: ${team.teamId}
TEAM PASSWORD: ${team.teamPassword}

Team Details:
- Team Name: ${team.teamName}
- Members: ${team.memberCount}
- Fundraising Goal: £${team.fundraisingGoal?.toLocaleString() || '0'}
- Description: ${team.teamDescription || 'N/A'}

${customMessage ? `\nAdditional Message:\n${customMessage}` : ''}

Please keep these credentials safe and share them only with your team members.

Best regards,
Campaign Administration Team
      `.trim();

      // Send email via API endpoint
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: `Team Credentials: ${team.teamName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a1a;">Team Credentials for: ${team.teamName}</h2>
              <p>Dear Team Lead,</p>
              <p>Your team has been registered for the campaign. Here are your login credentials:</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>TEAM ID:</strong> <code style="background-color: #e0e0e0; padding: 5px 10px; border-radius: 4px;">${team.teamId}</code></p>
                <p><strong>TEAM PASSWORD:</strong> <code style="background-color: #e0e0e0; padding: 5px 10px; border-radius: 4px;">${team.teamPassword}</code></p>
              </div>

              <h3 style="color: #1a1a1a;">Team Details:</h3>
              <ul>
                <li><strong>Team Name:</strong> ${team.teamName}</li>
                <li><strong>Members:</strong> ${team.memberCount}</li>
                <li><strong>Fundraising Goal:</strong> £${team.fundraisingGoal?.toLocaleString() || '0'}</li>
                <li><strong>Description:</strong> ${team.teamDescription || 'N/A'}</li>
              </ul>

              ${customMessage ? `
                <h3 style="color: #1a1a1a;">Additional Message:</h3>
                <p>${customMessage.replace(/\n/g, '<br>')}</p>
              ` : ''}

              <p style="color: #666; margin-top: 30px; font-size: 12px;">
                Please keep these credentials safe and share them only with your team members.
              </p>
              <p style="color: #666; font-size: 12px;">
                Best regards,<br>
                Campaign Administration Team
              </p>
            </div>
          `,
          teamId: team._id,
          teamName: team.teamName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }

      setSuccess(true);
      setEmail('');
      setCustomMessage('');
      
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send email. Please try again.';
      setError(errorMsg);
      console.error('Error sending email:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center border-b border-blue-800">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6" />
            <div>
              <h2 className="font-heading text-2xl font-bold">Send Team Credentials</h2>
              <p className="font-paragraph text-sm text-blue-100 mt-1">{team.teamName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border-2 border-red-300 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="font-paragraph text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 border-2 border-green-300 rounded-lg flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="font-paragraph text-sm text-green-700">
                Email sent successfully! Closing in a moment...
              </p>
            </motion.div>
          )}

          <form onSubmit={handleSendEmail} className="space-y-6">
            {/* Team Info Preview */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-3">
              <h3 className="font-heading font-bold text-blue-900">Team Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-paragraph text-blue-600/60">Team ID</p>
                  <p className="font-heading font-bold text-blue-900">{team.teamId}</p>
                </div>
                <div>
                  <p className="font-paragraph text-blue-600/60">Password</p>
                  <p className="font-heading font-bold text-blue-900">{team.teamPassword}</p>
                </div>
                <div>
                  <p className="font-paragraph text-blue-600/60">Members</p>
                  <p className="font-heading font-bold text-blue-900">{team.memberCount}</p>
                </div>
                <div>
                  <p className="font-paragraph text-blue-600/60">Goal</p>
                  <p className="font-heading font-bold text-blue-900">£{team.fundraisingGoal?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="font-paragraph text-sm font-semibold text-blue-900">
                Recipient Email Address *
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="team-lead@example.com"
                className="border-blue-200 focus:border-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <p className="font-paragraph text-xs text-blue-600/60">
                The team credentials will be sent to this email address
              </p>
            </div>

            {/* Custom Message */}
            <div className="space-y-2">
              <label className="font-paragraph text-sm font-semibold text-blue-900">
                Additional Message (Optional)
              </label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add any additional instructions or welcome message for the team..."
                className="border-blue-200 focus:border-blue-600 focus:ring-blue-500 min-h-[120px]"
                disabled={loading}
              />
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-paragraph text-xs font-semibold text-gray-600 mb-3 uppercase">Email Preview</p>
              <div className="bg-white rounded p-3 border border-gray-200 text-xs font-paragraph text-gray-700 max-h-[200px] overflow-y-auto">
                <p><strong>Subject:</strong> Team Credentials: {team.teamName}</p>
                <p className="mt-2"><strong>To:</strong> {email || 'recipient@example.com'}</p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p>Team Credentials for: {team.teamName}</p>
                  <p className="mt-2">TEAM ID: {team.teamId}</p>
                  <p>TEAM PASSWORD: {team.teamPassword}</p>
                  {customMessage && (
                    <p className="mt-2 italic">Additional Message: {customMessage}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-blue-200">
              <Button
                type="submit"
                disabled={loading || !email}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-lg disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                disabled={loading}
                variant="outline"
                className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg disabled:opacity-70"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
