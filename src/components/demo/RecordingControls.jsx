import React from 'react';
import { motion } from 'framer-motion';
import { 
  Circle,
  Square,
  Pause,
  Play,
  Download,
  Upload,
  Trash2,
  Clock
} from 'lucide-react';

import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useRecording } from '../../hooks/demo/useRecording';

export const RecordingControls = ({ 
  sessionId, 
  localStream, 
  userRole = 'participant',
  className = '' 
}) => {
  const {
    isRecording,
    recordings,
    recordingDuration,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadRecording,
    uploadRecording,
    deleteRecording,
    formatDuration,
    getQualityOptions
  } = useRecording(sessionId);

  // Check if user can record
  const canRecord = userRole === 'host' || userRole === 'presenter';

  const handleStartRecording = async () => {
    if (!localStream) {
      console.error('No local stream available for recording');
      return;
    }

    const qualityOptions = getQualityOptions('HD');
    await startRecording(localStream, {
      quality: 'HD',
      ...qualityOptions
    });
  };

  const handleStopRecording = async () => {
    await stopRecording();
  };

  const handleUploadRecording = async (recording) => {
    try {
      await uploadRecording(recording);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  if (!canRecord) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Recording Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recording Controls</CardTitle>
            {isRecording && (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-3 h-3 bg-red-500 rounded-full"
                />
                <Badge variant="destructive">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(recordingDuration)}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-3">
            {!isRecording ? (
              <Button
                onClick={handleStartRecording}
                className="bg-red-600 hover:bg-red-700"
                disabled={!localStream}
              >
                <Circle className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleStopRecording}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
                
                <Button
                  onClick={pauseRecording}
                  variant="outline"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                
                <Button
                  onClick={resumeRecording}
                  variant="outline"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              </>
            )}
          </div>
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recordings List */}
      {recordings.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Saved Recordings</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {recordings.map((recording) => (
                <motion.div
                  key={recording.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">
                        {formatDuration(recording.duration)}
                      </Badge>
                      <Badge variant="secondary">
                        {(recording.size / (1024 * 1024)).toFixed(1)} MB
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(recording.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadRecording(recording)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUploadRecording(recording)}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteRecording(recording.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 