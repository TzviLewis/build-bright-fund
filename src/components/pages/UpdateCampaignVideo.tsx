import { useEffect, useState } from 'react';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails } from '@/entities';

/**
 * This component updates the campaign video field with the provided URL
 * It runs once on mount and then navigates back to home
 */
export default function UpdateCampaignVideo() {
  const [status, setStatus] = useState('Updating campaign video...');

  useEffect(() => {
    const updateVideo = async () => {
      try {
        // Get existing campaign
        const { items } = await BaseCrudService.getAll<CampaignDetails>('campaigndetails');
        
        if (items.length === 0) {
          setStatus('No campaign found. Creating new campaign...');
          // Create new campaign if none exists
          const newCampaign: CampaignDetails = {
            _id: crypto.randomUUID(),
            campaignTitle: 'School Fundraising Campaign',
            fundraisingGoal: 500000,
            video: 'https://files.fm/u/4rmx75pxum',
            homepageVideo: 'https://share.zight.com/bLuPqKqG',
          };
          await BaseCrudService.create('campaigndetails', newCampaign);
        } else {
          // Update existing campaign
          const campaign = items[0];
          const updatedCampaign: CampaignDetails = {
            ...campaign,
            video: 'https://files.fm/u/4rmx75pxum',
            homepageVideo: 'https://share.zight.com/bLuPqKqG',
          };
          await BaseCrudService.update('campaigndetails', updatedCampaign);
        }

        setStatus('✓ Campaign video updated successfully!');
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setStatus(`✗ Error updating video: ${errorMsg}`);
        console.error('Error:', error);
      }
    };

    updateVideo();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6 text-6xl">🎬</div>
        <p className="font-heading text-2xl text-blue-900 mb-4">{status}</p>
        <p className="font-paragraph text-blue-700">Redirecting to homepage...</p>
      </div>
    </div>
  );
}
