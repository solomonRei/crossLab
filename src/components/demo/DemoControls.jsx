import React from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff,
  Circle,
  Square,
  Settings
} from 'lucide-react';

import { Button } from '../ui/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';

export const DemoControls = ({
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  isRecording,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onToggleRecording,
  userRole,
  canRecord = false,
  isScreenShareSupported = true,
}) => {
  const canControl = userRole === 'host' || userRole === 'presenter';

  const controls = [
    {
      id: 'video',
      icon: isVideoEnabled ? Video : VideoOff,
      label: isVideoEnabled ? 'Turn off camera' : 'Turn on camera',
      onClick: onToggleVideo,
      active: isVideoEnabled,
      disabled: !canControl,
      variant: isVideoEnabled ? 'secondary' : 'outline',
    },
    {
      id: 'audio',
      icon: isAudioEnabled ? Mic : MicOff,
      label: isAudioEnabled ? 'Mute microphone' : 'Unmute microphone',
      onClick: onToggleAudio,
      active: isAudioEnabled,
      disabled: !canControl,
      variant: isAudioEnabled ? 'secondary' : 'outline',
    },
    {
      id: 'screen',
      icon: isScreenSharing ? MonitorOff : Monitor,
      label: isScreenSharing ? 'Stop screen share' : 'Share screen',
      onClick: onToggleScreenShare,
      active: isScreenSharing,
      disabled: !canControl || !isScreenShareSupported,
      variant: isScreenSharing ? 'destructive' : 'outline',
    },
  ];

  // Add recording control for hosts
  if (canRecord) {
    controls.push({
      id: 'record',
      icon: isRecording ? Square : Circle,
      label: isRecording ? 'Stop recording' : 'Start recording',
      onClick: onToggleRecording,
      active: isRecording,
      disabled: false,
      variant: isRecording ? 'destructive' : 'outline',
    });
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-3 bg-gray-800/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-700"
      >
        {controls.map((control) => {
          const Icon = control.icon;
          
          return (
            <Tooltip key={control.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={control.variant}
                  size="lg"
                  onClick={control.onClick}
                  disabled={control.disabled}
                  className={`
                    h-12 w-12 rounded-full p-0 transition-all duration-200
                    ${control.active && control.id !== 'record' 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : ''
                    }
                    ${control.id === 'record' && control.active 
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                      : ''
                    }
                    ${control.disabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:scale-105'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{control.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Settings button for additional options */}
        <div className="w-px h-8 bg-gray-600 mx-2" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-12 rounded-full p-0 text-white border-gray-600 hover:bg-gray-700"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </TooltipProvider>
  );
}; 