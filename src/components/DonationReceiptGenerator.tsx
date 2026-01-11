import { useState } from 'react';
import { Download, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Donations } from '@/entities';

interface DonationReceiptGeneratorProps {
  donation: Donations;
  campaignTitle?: string;
  organizationName?: string;
  taxId?: string;
  onDownload?: () => void;
  onEmail?: () => void;
}

/**
 * Generates and manages donation receipts for tax purposes
 */
export default function DonationReceiptGenerator({
  donation,
  campaignTitle = 'Campaign Donation',
  organizationName = 'Build Bright Fund',
  taxId = 'XX-XXXXXXX',
  onDownload,
  onEmail,
}: DonationReceiptGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [receiptGenerated, setReceiptGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const donationDate = donation.donationDate
    ? new Date(donation.donationDate)
    : new Date();

  const generateReceiptHTML = (): string => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donation Receipt</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #0066ff;
      padding-bottom: 20px;
    }
    
    .header h1 {
      color: #1a1a1a;
      font-size: 28px;
      margin-bottom: 10px;
    }
    
    .header p {
      color: #666;
      font-size: 14px;
    }
    
    .receipt-number {
      text-align: right;
      color: #666;
      font-size: 12px;
      margin-bottom: 20px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      color: #1a1a1a;
      font-weight: bold;
      font-size: 14px;
      text-transform: uppercase;
      margin-bottom: 15px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    
    .section-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    .field {
      margin-bottom: 15px;
    }
    
    .field-label {
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    
    .field-value {
      color: #1a1a1a;
      font-size: 16px;
      font-weight: 500;
    }
    
    .donation-details {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 6px;
      border-left: 4px solid #0066ff;
    }
    
    .donation-details .field {
      margin-bottom: 10px;
    }
    
    .amount {
      font-size: 32px;
      color: #0066ff;
      font-weight: bold;
      text-align: center;
      padding: 20px 0;
    }
    
    .tax-notice {
      background: #f0f7ff;
      border: 1px solid #0066ff;
      border-radius: 6px;
      padding: 15px;
      margin-top: 30px;
      font-size: 12px;
      color: #333;
      line-height: 1.6;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 12px;
    }
    
    .print-only {
      display: none;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .print-only {
        display: block;
      }
      
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Donation Receipt</h1>
      <p>Tax-Deductible Contribution Receipt</p>
    </div>
    
    <div class="receipt-number">
      Receipt #: ${donation._id.substring(0, 8).toUpperCase()}
    </div>
    
    <div class="section">
      <div class="section-title">Donor Information</div>
      <div class="section-content">
        <div>
          <div class="field">
            <div class="field-label">Donor Name</div>
            <div class="field-value">${donation.isAnonymous ? 'Anonymous Donor' : (donation.donorName || 'N/A')}</div>
          </div>
        </div>
        <div>
          <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value">${donation.donorEmail || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Donation Details</div>
      <div class="donation-details">
        <div class="field">
          <div class="field-label">Campaign</div>
          <div class="field-value">${campaignTitle}</div>
        </div>
        <div class="field">
          <div class="field-label">Donation Date</div>
          <div class="field-value">${donationDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}</div>
        </div>
        <div class="field">
          <div class="field-label">Donation Type</div>
          <div class="field-value">${donation.status === 'completed' ? 'Completed' : 'Pending'}</div>
        </div>
        <div class="amount">$${(donation.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Organization Information</div>
      <div class="section-content">
        <div>
          <div class="field">
            <div class="field-label">Organization</div>
            <div class="field-value">${organizationName}</div>
          </div>
        </div>
        <div>
          <div class="field">
            <div class="field-label">Tax ID (EIN)</div>
            <div class="field-value">${taxId}</div>
          </div>
        </div>
      </div>
    </div>
    
    ${donation.donorMessage ? `
    <div class="section">
      <div class="section-title">Donor Message</div>
      <div class="field">
        <div class="field-value">"${donation.donorMessage}"</div>
      </div>
    </div>
    ` : ''}
    
    <div class="tax-notice">
      <strong>Tax Deductibility Notice:</strong> This donation is tax-deductible to the extent permitted by law. 
      ${organizationName} is a qualified 501(c)(3) organization. No goods or services were provided in exchange 
      for this contribution. Please retain this receipt for your tax records. For questions about the deductibility 
      of your donation, consult a tax professional.
    </div>
    
    <div class="footer">
      <p>Thank you for your generous support!</p>
      <p style="margin-top: 10px;">Generated on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const html = generateReceiptHTML();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `donation-receipt-${donation._id.substring(0, 8)}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setReceiptGenerated(true);
      onDownload?.();

      setTimeout(() => setReceiptGenerated(false), 3000);
    } catch (err) {
      setError('Failed to generate receipt. Please try again.');
      console.error('Error generating receipt:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmail = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // In a real implementation, this would send the receipt via email
      // For now, we'll just show a success message
      const subject = `Donation Receipt - ${campaignTitle}`;
      const body = `Your donation receipt has been generated. Please download it from your donor profile.`;

      // Open email client
      const mailtoLink = `mailto:${donation.donorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;

      setReceiptGenerated(true);
      onEmail?.();

      setTimeout(() => setReceiptGenerated(false), 3000);
    } catch (err) {
      setError('Failed to send receipt. Please try again.');
      console.error('Error sending receipt:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="font-paragraph text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {receiptGenerated && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="font-paragraph text-sm text-green-700">
            Receipt generated successfully!
          </p>
        </motion.div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Receipt
        </Button>

        <Button
          onClick={handleEmail}
          disabled={isGenerating}
          variant="outline"
          className="flex-1 border-secondary text-secondary hover:bg-secondary/10 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Email Receipt
        </Button>
      </div>

      <p className="font-paragraph text-xs text-primary/60 text-center">
        Your receipt is ready for download. Keep it for your tax records.
      </p>
    </motion.div>
  );
}
