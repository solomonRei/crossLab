import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, MonitorOff } from 'lucide-react';

export const ScreenShare = ({ 
  screenStream, 
  screenVideoRef, 
  isPresenter = false 
}) => {
  useEffect(() => {
    if (screenVideoRef?.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream, screenVideoRef]);

  if (!screenStream) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-gray-400">
          <MonitorOff className="h-16 w-16 mx-auto mb-4" />
          <p className="text-lg">No screen being shared</p>
          <p className="text-sm">Waiting for presenter to share their screen...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full relative bg-black"
    >
      <video
        ref={screenVideoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain"
      />
      
      {/* Screen share indicator */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center gap-2 bg-blue-600/90 backdrop-blur-sm rounded-full px-3 py-2 text-white text-sm">
          <Monitor className="h-4 w-4" />
          <span>Screen Share Active</span>
        </div>
      </div>
    </motion.div>
  );
}; 