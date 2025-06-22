import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Circle, 
  Square, 
  Download, 
  Clock,
  FileVideo,
  Play
} from 'lucide-react';

import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';

export const RecordingControls = ({ 
  isRecording = false,
  recordings = [],
  onStartRecording,
  onStopRecording,
  recordingDuration = 0
}) => {
  const [showRecordings, setShowRecordings] = useState(false);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Recording Toggle Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isRecording ? 'destructive' : 'outline'}
              size="sm"
              onClick={isRecording ? onStopRecording : onStartRecording}
              className={`
                text-white border-gray-600 transition-all duration-200
                ${isRecording 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'hover:bg-gray-700'
                }
              `}
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4 mr-2" />
                  Record
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isRecording ? 'Stop recording the demo' : 'Start recording the demo'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Recording Duration */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 bg-red-600/20 border border-red-600/30 rounded-lg px-3 py-1"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <Clock className="h-4 w-4 text-red-400" />
            <span className="text-red-400 font-mono text-sm">
              {formatDuration(recordingDuration)}
            </span>
          </motion.div>
        )}

        {/* Recordings List Toggle */}
        {recordings.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecordings(!showRecordings)}
                className="text-white border-gray-600 hover:bg-gray-700"
              >
                <FileVideo className="h-4 w-4 mr-2" />
                Recordings
                <Badge variant="secondary" className="ml-2 text-xs">
                  {recordings.length}
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View recorded sessions</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Recordings Dropdown */}
        {showRecordings && recordings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-2 right-0 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 min-w-80 z-50"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold">Previous Recordings</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRecordings(false)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recordings.map((recording, index) => (
                <div
                  key={recording.id || index}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                      <FileVideo className="h-5 w-5 text-gray-300" />
                    </div>
                    
                    <div>
                      <p className="text-white text-sm font-medium">
                        Recording {index + 1}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(recording.duration || 0)}</span>
                        <span>•</span>
                        <span>{recording.quality || 'HD'}</span>
                        <span>•</span>
                        <span>{recording.size || 'Unknown size'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Play recording</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download recording</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
            
            {recordings.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <FileVideo className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recordings yet</p>
                <p className="text-sm">Start recording to save this session</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
}; 