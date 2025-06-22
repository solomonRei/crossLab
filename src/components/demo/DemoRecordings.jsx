import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Download, 
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Calendar,
  Clock,
  FileVideo,
  Eye,
  Share2,
  Trash2,
  RefreshCw
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { authApiService } from '../../services/authApi';

// Authenticated Video Player Component
const AuthenticatedVideoPlayer = ({ videoUrl, onError, className = "" }) => {
  const videoRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);

  useEffect(() => {
    if (!videoUrl) return;

    const loadVideo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = authApiService.getToken();
        console.log('🎬 Loading video with auth token:', videoUrl);
        
        const response = await fetch(videoUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          const contentLength = response.headers.get('content-length');
          
          console.log('📊 Response headers:', {
            contentType,
            contentLength,
            status: response.status
          });

          const blob = await response.blob();
          console.log('📦 Blob created:', {
            size: blob.size,
            type: blob.type,
            actualContentType: contentType
          });

          // Set proper MIME type if not set
          let finalBlob = blob;
          if (!blob.type && contentType) {
            finalBlob = new Blob([blob], { type: contentType });
            console.log('🔧 Fixed blob type:', finalBlob.type);
          }

          const url = URL.createObjectURL(finalBlob);
          setVideoSrc(url);
          setVideoInfo({
            size: blob.size,
            type: finalBlob.type,
            contentType: contentType
          });
          
          console.log('✅ Video blob created successfully');
        } else {
          throw new Error(`Failed to load video: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.error('❌ Error loading video:', err);
        setError(err.message);
        if (onError) onError(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();

    // Cleanup function
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoUrl, onError]);

  const handleVideoError = (e) => {
    const video = e.target;
    const error = video.error;
    
    console.error('🎥 Video element error details:', {
      code: error?.code,
      message: error?.message,
      networkState: video.networkState,
      readyState: video.readyState,
      currentSrc: video.currentSrc,
      videoInfo
    });

    let errorMessage = 'Video playback error';
    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = 'Video playback was aborted';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error while loading video';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = 'Video format not supported or corrupted';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video format not supported by browser';
          break;
        default:
          errorMessage = `Video error (code: ${error.code})`;
      }
    }
    
    setError(errorMessage);
    if (onError) onError(e);
  };

  const handleVideoCanPlay = () => {
    console.log('✅ Video can play');
  };

  const handleVideoLoadedData = () => {
    console.log('📹 Video data loaded');
  };

  if (isLoading) {
    return (
      <div className={`w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full h-64 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <FileVideo className="h-12 w-12 mx-auto mb-2 text-red-500" />
          <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-2">
            {error}
          </p>
          {videoInfo && (
            <div className="text-xs text-red-500 dark:text-red-400 space-y-1">
              <p>Size: {(videoInfo.size / 1024).toFixed(1)} KB</p>
              <p>Type: {videoInfo.type || 'Unknown'}</p>
              <p>Content-Type: {videoInfo.contentType || 'Unknown'}</p>
            </div>
          )}
          <Button 
            onClick={() => window.location.reload()}
            className="mt-3"
            size="sm"
            variant="outline"
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <video
        ref={videoRef}
        controls
        className={`w-full rounded-lg bg-black ${className}`}
        src={videoSrc}
        onError={handleVideoError}
        onCanPlay={handleVideoCanPlay}
        onLoadedData={handleVideoLoadedData}
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
      
      {videoInfo && (
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
          <div className="grid grid-cols-2 gap-2">
            <span>Size: {(videoInfo.size / 1024 / 1024).toFixed(2)} MB</span>
            <span>Type: {videoInfo.type || 'Unknown'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const RecordingCard = ({ recording, onPlay, onDownload, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 'Unknown') return 'Unknown';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      await onDownload(recording);
    } catch (error) {
      console.error('Error downloading recording:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="w-full"
    >
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileVideo className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {recording.fileName || `Recording ${recording.id?.slice(-8)}`}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {formatDate(recording.startedAt || recording.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {recording.quality || 'Unknown'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {recording.status || 'Unknown'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Recording Info */}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(recording.duration)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileVideo className="h-4 w-4" />
                <span>{formatFileSize(recording.fileSize || 0)}</span>
              </div>
              {recording.viewCount && (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{recording.viewCount} views</span>
                </div>
              )}
            </div>

            {/* Video Thumbnail/Preview */}
            <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 h-32">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <Button
                  onClick={() => onPlay(recording)}
                  className="bg-white/90 hover:bg-white text-gray-900 rounded-full w-12 h-12 p-0 shadow-lg"
                >
                  <Play className="h-5 w-5 ml-0.5" />
                </Button>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {formatFileSize(recording.fileSize || 0)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button 
                onClick={() => onPlay(recording)}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Play
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleDownload}
                disabled={isLoading}
                title="Download Recording"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>

              <Button 
                variant="outline" 
                onClick={() => {
                  // Copy recording URL to clipboard
                  if (recording.downloadUrl) {
                    const fullUrl = recording.downloadUrl.startsWith('http') 
                      ? recording.downloadUrl 
                      : `${window.location.origin}${recording.downloadUrl}`;
                    navigator.clipboard.writeText(fullUrl);
                  }
                }}
                title="Copy Link"
              >
                <Share2 className="h-4 w-4" />
              </Button>

              {onDelete && (
                <Button 
                  variant="outline" 
                  onClick={() => onDelete(recording)}
                  className="text-red-600 hover:text-red-700"
                  title="Delete Recording"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const DemoRecordings = ({ sessionId, isOpen, onClose }) => {
  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [videoError, setVideoError] = useState(null);
  const { toast } = useToast();

  // Helper function to get full URL for video playback
  const getVideoUrl = (recording) => {
    if (!recording.downloadUrl && !recording.id) return null;
    
    // If downloadUrl is provided and it's already a full URL, return as is
    if (recording.downloadUrl && recording.downloadUrl.startsWith('http')) {
      return recording.downloadUrl;
    }
    
    // Get the API base URL from the auth service
    const apiInfo = authApiService.getApiInfo();
    const baseUrl = apiInfo.baseUrl;
    
    // If downloadUrl is provided as relative path, use it
    if (recording.downloadUrl) {
      return `${baseUrl}${recording.downloadUrl}`;
    }
    
    // Otherwise, construct the download URL using the recording ID
    return `${baseUrl}/api/v1/recordings/${recording.id}/download`;
  };

  // Load recordings
  const loadRecordings = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading recordings for session:', sessionId);
      const response = await authApiService.getDemoRecordings(sessionId);
      
      if (response.success) {
        setRecordings(response.data || []);
        console.log('Recordings loaded:', response.data?.length || 0);
        console.log('Recording data:', response.data);
      } else {
        setError(response.message || 'Failed to load recordings');
        console.error('Failed to load recordings:', response.message);
      }
    } catch (error) {
      console.error('Error loading recordings:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load recordings when component opens
  useEffect(() => {
    if (isOpen && sessionId) {
      loadRecordings();
    }
  }, [isOpen, sessionId]);

  // Handle play recording
  const handlePlayRecording = (recording) => {
    setSelectedRecording(recording);
    setVideoError(null);
    console.log('Playing recording:', recording);
    console.log('Video URL:', getVideoUrl(recording));
  };

  // Handle download recording
  const handleDownloadRecording = async (recording) => {
    try {
      const videoUrl = getVideoUrl(recording);
      if (videoUrl) {
        // Get auth token for authenticated download
        const token = authApiService.getToken();
        
        // Create a fetch request with auth headers
        const response = await fetch(videoUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          
          // Create a temporary link and trigger download
          const link = document.createElement('a');
          link.href = url;
          link.download = recording.fileName || `recording-${recording.id}.webm`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up
          window.URL.revokeObjectURL(url);
          
          toast.success('Download Started', 'Recording download has started');
        } else {
          throw new Error(`Download failed: ${response.status} ${response.statusText}`);
        }
      } else {
        toast.error('Download Error', 'Recording download URL not available');
      }
    } catch (error) {
      console.error('Error downloading recording:', error);
      toast.error('Download Error', 'Failed to download recording: ' + error.message);
    }
  };

  // Handle delete recording
  const handleDeleteRecording = async (recording) => {
    if (!window.confirm('Are you sure you want to delete this recording? This action cannot be undone.')) {
      return;
    }

    try {
      // TODO: Implement delete recording API call
      console.log('Deleting recording:', recording.id);
      
      // For now, just remove from local state
      setRecordings(prev => prev.filter(r => r.id !== recording.id));
      toast.success('Recording Deleted', 'Recording has been deleted successfully');
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast.error('Delete Error', 'Failed to delete recording');
    }
  };

  // Handle video load error
  const handleVideoError = (error) => {
    console.error('Video load error:', error);
    const errorMessage = 'Failed to load video. The file may be corrupted or the server may be unavailable.';
    setVideoError(errorMessage);
    
    // Show detailed error in toast
    toast.error('Video Playback Error', 
      `Unable to play video. Try downloading the file instead. Error details logged to console.`
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Demo Recordings
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View and manage recordings for this demo session ({recordings.length} recordings)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadRecordings}
                disabled={isLoading}
                title="Refresh Recordings"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" onClick={onClose} title="Close">
                ×
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Recordings List */}
            <div className="flex-1 p-6 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600 dark:text-gray-400">Loading recordings...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <Video className="h-12 w-12 mx-auto mb-4 text-red-500" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Failed to Load Recordings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                  <Button onClick={loadRecordings}>
                    Try Again
                  </Button>
                </div>
              ) : recordings.length === 0 ? (
                <div className="text-center py-12">
                  <FileVideo className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Recordings Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Recordings from this demo session will appear here
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recordings.map((recording) => (
                    <RecordingCard
                      key={recording.id}
                      recording={recording}
                      onPlay={handlePlayRecording}
                      onDownload={handleDownloadRecording}
                      onDelete={handleDeleteRecording}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Video Player */}
            {selectedRecording && (
              <div className="w-1/2 border-l border-gray-200 dark:border-gray-700 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {selectedRecording.fileName || `Recording ${selectedRecording.id?.slice(-8)}`}
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>Started: {new Date(selectedRecording.startedAt).toLocaleString()}</p>
                    {selectedRecording.completedAt && (
                      <p>Completed: {new Date(selectedRecording.completedAt).toLocaleString()}</p>
                    )}
                    <p>Status: {selectedRecording.status}</p>
                    <p>Size: {(selectedRecording.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                
                {getVideoUrl(selectedRecording) ? (
                  <div className="space-y-4">
                    <AuthenticatedVideoPlayer
                      videoUrl={getVideoUrl(selectedRecording)}
                      onError={handleVideoError}
                    />
                    
                    {/* Alternative playback options */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          // Try to open video in new tab
                          const videoUrl = getVideoUrl(selectedRecording);
                          window.open(videoUrl, '_blank');
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Open in New Tab
                      </Button>
                      
                      <Button
                        onClick={() => handleDownloadRecording(selectedRecording)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download File
                      </Button>
                    </div>
                    
                    {/* Video URL for debugging */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 break-all bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <strong>Video URL:</strong> {getVideoUrl(selectedRecording)}
                    </div>
                    
                    {/* File info */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      <div className="grid grid-cols-2 gap-2">
                        <span><strong>File:</strong> {selectedRecording.fileName}</span>
                        <span><strong>Status:</strong> {selectedRecording.status}</span>
                        <span><strong>Started:</strong> {new Date(selectedRecording.startedAt).toLocaleTimeString()}</span>
                        <span><strong>Size:</strong> {(selectedRecording.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FileVideo className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Video URL not available
                      </p>
                      <Button
                        onClick={() => handleDownloadRecording(selectedRecording)}
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Try Download
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              💡 Tip: Click on any recording to preview it. Use download button for offline access.
            </div>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 