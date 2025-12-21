import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseCrudService } from '@/integrations';
import { CampaignDetails } from '@/entities';
import { ArrowLeft, AlertCircle, Loader2, CheckCircle, X, Upload, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoEditor from '@/components/VideoEditor';
import { Input } from '@/components/ui/input';

interface VideoEditData {
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  volume: number;
  originalUrl: string;
}

export default function VideoEditorPage() {
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');

  useEffect(() => {
    loadCampaign();
  }, []);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      setError(null);
      const { items } = await BaseCrudService.getAll<CampaignDetails>('campaigndetails');
      
      if (items.length === 0) {
        setError('No campaign found. Please create a campaign first.');
        return;
      }

      const campaignData = items[0];
      setCampaign(campaignData);
      setVideoUrl(campaignData.video || campaignData.campaignVideo || '');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load campaign';
      setError(`Error loading campaign: ${errorMsg}`);
      console.error('Error loading campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSave = async (editedData: VideoEditData) => {
    if (!campaign) {
      setError('Campaign not found');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Update campaign with edited video data
      const updatedCampaign: CampaignDetails = {
        ...campaign,
        video: editedData.originalUrl,
        campaignTitle: editedData.title || campaign.campaignTitle,
        projectDescription: editedData.description || campaign.projectDescription,
      };

      await BaseCrudService.update('campaigndetails', updatedCampaign);
      
      setCampaign(updatedCampaign);
      setSuccessMessage('✓ Video saved successfully! Your campaign video has been updated.');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save video';
      setError(`Error saving video: ${errorMsg}`);
      console.error('Error saving video:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddVideoUrl = () => {
    if (!tempUrl.trim()) {
      setError('Please enter a valid video URL');
      return;
    }

    setVideoUrl(tempUrl);
    setTempUrl('');
    setShowUrlInput(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto mb-4" />
          <p className="font-heading text-lg text-primary">Loading video editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-b border-blue-800 shadow-lg sticky top-0 z-50">
        <div className="max-w-[120rem] mx-auto px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-heading text-4xl font-bold flex items-center gap-3">
                <Film className="w-8 h-8" />
                Video Editor
              </h1>
              <p className="font-paragraph text-base text-blue-100 mt-2">
                Edit and manage your campaign video
              </p>
            </div>
            <Link to="/admin">
              <Button 
                className="bg-white text-blue-600 hover:bg-blue-50 rounded-full px-6 py-2 font-semibold shadow-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[120rem] mx-auto px-8 py-12">
        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border-2 border-red-400 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-paragraph font-semibold text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-700 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 border-2 border-green-400 rounded-lg flex items-start gap-3"
            >
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-paragraph font-semibold text-green-700">{successMessage}</p>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-green-600 hover:text-green-700 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Campaign Info */}
        {campaign && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
                <CardTitle className="font-heading text-xl font-bold text-blue-900">
                  Campaign Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-paragraph text-sm text-blue-600 uppercase tracking-wider mb-1">
                      Campaign Title
                    </p>
                    <p className="font-heading text-lg font-bold text-blue-900">
                      {campaign.campaignTitle || 'Untitled Campaign'}
                    </p>
                  </div>
                  <div>
                    <p className="font-paragraph text-sm text-blue-600 uppercase tracking-wider mb-1">
                      Fundraising Goal
                    </p>
                    <p className="font-heading text-lg font-bold text-blue-900">
                      £{(campaign.fundraisingGoal || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-paragraph text-sm text-blue-600 uppercase tracking-wider mb-1">
                      Project Description
                    </p>
                    <p className="font-paragraph text-base text-blue-800">
                      {campaign.projectDescription || 'No description provided'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Video URL Input */}
        {!videoUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
                <CardTitle className="font-heading text-xl font-bold text-blue-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Add Video
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {!showUrlInput ? (
                  <Button
                    onClick={() => setShowUrlInput(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg py-3 font-semibold"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add Video URL
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-semibold text-blue-900">
                        Video URL
                      </label>
                      <Input
                        type="text"
                        value={tempUrl}
                        onChange={(e) => setTempUrl(e.target.value)}
                        placeholder="https://example.com/video.mp4"
                        className="border-blue-200 focus:border-blue-600"
                      />
                      <p className="font-paragraph text-xs text-blue-600">
                        Supported formats: MP4, WebM, OGG, MOV, AVI
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <Button
                        onClick={handleAddVideoUrl}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg font-semibold"
                      >
                        Add Video
                      </Button>
                      <Button
                        onClick={() => {
                          setShowUrlInput(false);
                          setTempUrl('');
                        }}
                        variant="outline"
                        className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-semibold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Video Editor */}
        {videoUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <VideoEditor
              videoUrl={videoUrl}
              onSave={handleVideoSave}
              onClose={() => {
                setVideoUrl('');
                setTempUrl('');
              }}
            />
          </motion.div>
        )}

        {/* Help Section */}
        {!videoUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
                <CardTitle className="font-heading text-xl font-bold text-blue-900">
                  How to Use the Video Editor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
                        <span className="font-bold text-blue-600">1</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-blue-900 mb-1">Add Your Video</h3>
                      <p className="font-paragraph text-blue-700">
                        Click "Add Video URL" and paste your video link. The video will be loaded into the editor.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
                        <span className="font-bold text-blue-600">2</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-blue-900 mb-1">Preview & Edit</h3>
                      <p className="font-paragraph text-blue-700">
                        Use the video player to preview your video. Adjust playback speed, volume, and position.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
                        <span className="font-bold text-blue-600">3</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-blue-900 mb-1">Trim Video</h3>
                      <p className="font-paragraph text-blue-700">
                        Set start and end times to trim your video. The duration will be calculated automatically.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
                        <span className="font-bold text-blue-600">4</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-blue-900 mb-1">Add Information</h3>
                      <p className="font-paragraph text-blue-700">
                        Enter a title and description for your video. These will be displayed on your campaign page.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
                        <span className="font-bold text-blue-600">5</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-blue-900 mb-1">Save Changes</h3>
                      <p className="font-paragraph text-blue-700">
                        Click "Save Video" to save your edits. Your campaign video will be updated immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
