import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Scissors, 
  Copy, Download, AlertCircle, CheckCircle, X, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoEditorProps {
  videoUrl: string;
  onSave?: (editedData: VideoEditData) => void;
  onClose?: () => void;
}

interface VideoEditData {
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  volume: number;
  originalUrl: string;
}

export default function VideoEditor({ videoUrl, onSave, onClose }: VideoEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setEndTime(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        const elem = videoRef.current as any;
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        }
      } else {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleReset = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      videoRef.current.pause();
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      setShowError('Please enter a video title');
      return;
    }

    if (startTime >= endTime) {
      setShowError('Start time must be before end time');
      return;
    }

    const editedData: VideoEditData = {
      title,
      description,
      startTime,
      endTime,
      volume,
      originalUrl: videoUrl,
    };

    if (onSave) {
      onSave(editedData);
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      if (onClose) {
        onClose();
      }
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <Card className="border-blue-200 bg-white shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-3">
          <CardTitle className="font-heading text-xl font-bold text-blue-900">
            Video Preview & Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Video Player */}
            <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-auto max-h-96"
                crossOrigin="anonymous"
              />
              
              {/* Play Button Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors cursor-pointer"
                  onClick={togglePlayPause}>
                  <Play className="w-16 h-16 text-white fill-white" />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  onValueChange={(value) => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = value[0];
                      setCurrentTime(value[0]);
                    }
                  }}
                  max={duration}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-blue-600">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-lg">
                <Button
                  onClick={togglePlayPause}
                  size="sm"
                  className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={toggleMute}
                    size="sm"
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-100"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Slider
                    value={[volume]}
                    onValueChange={(value) => handleVolumeChange(value[0])}
                    max={1}
                    step={0.1}
                    className="w-24"
                  />
                </div>

                <Button
                  onClick={handleReset}
                  size="sm"
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-100"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <Button
                  onClick={toggleFullscreen}
                  size="sm"
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-100 ml-auto"
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trim Section */}
      <Card className="border-blue-200 bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-3">
          <CardTitle className="font-heading text-lg font-bold text-blue-900 flex items-center gap-2">
            <Scissors className="w-5 h-5" />
            Trim Video
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="font-paragraph text-sm font-semibold text-blue-900">
                Start Time (seconds)
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={startTime}
                  onChange={(e) => setStartTime(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="border-blue-200 focus:border-blue-600"
                />
                <span className="text-sm text-blue-600 font-semibold min-w-fit">
                  {formatTime(startTime)}
                </span>
              </div>
              <Slider
                value={[startTime]}
                onValueChange={(value) => setStartTime(Math.min(value[0], endTime))}
                max={duration}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <label className="font-paragraph text-sm font-semibold text-blue-900">
                End Time (seconds)
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={endTime}
                  onChange={(e) => setEndTime(Math.min(duration, parseFloat(e.target.value) || duration))}
                  className="border-blue-200 focus:border-blue-600"
                />
                <span className="text-sm text-blue-600 font-semibold min-w-fit">
                  {formatTime(endTime)}
                </span>
              </div>
              <Slider
                value={[endTime]}
                onValueChange={(value) => setEndTime(Math.max(value[0], startTime))}
                max={duration}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-paragraph text-sm text-blue-700">
              <span className="font-semibold">Duration:</span> {formatTime(endTime - startTime)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metadata Section */}
      <Card className="border-blue-200 bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-3">
          <CardTitle className="font-heading text-lg font-bold text-blue-900">
            Video Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="font-paragraph text-sm font-semibold text-blue-900">
              Video Title *
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Campaign Launch Video"
              className="border-blue-200 focus:border-blue-600"
            />
          </div>

          <div className="space-y-2">
            <label className="font-paragraph text-sm font-semibold text-blue-900">
              Description (Optional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your video..."
              className="border-blue-200 focus:border-blue-600 min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <label className="font-paragraph text-sm font-semibold text-blue-900">
              Volume Level
            </label>
            <div className="flex items-center gap-4">
              <Slider
                value={[volume]}
                onValueChange={(value) => handleVolumeChange(value[0])}
                max={1}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm font-semibold text-blue-600 min-w-fit">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 border-2 border-green-400 rounded-lg flex items-start gap-3"
        >
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-paragraph font-semibold text-green-700">
              Video saved successfully!
            </p>
          </div>
        </motion.div>
      )}

      {showError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border-2 border-red-400 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-paragraph font-semibold text-red-700">
              {showError}
            </p>
          </div>
          <button
            onClick={() => setShowError(null)}
            className="text-red-600 hover:text-red-700 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button
          onClick={handleSave}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-lg py-3 font-semibold"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Save Video
        </Button>
        {onClose && (
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg py-3 font-semibold"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
