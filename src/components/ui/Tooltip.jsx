import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const TooltipProvider = ({ children }) => {
  return <div>{children}</div>;
};

export const TooltipTrigger = ({ children, asChild = false, ...props }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props);
  }
  return <div {...props}>{children}</div>;
};

export const TooltipContent = ({ children, side = 'top', align = 'center', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`
        absolute z-50 px-3 py-1.5 text-xs text-white bg-gray-900 border border-gray-700 
        rounded-md shadow-lg whitespace-nowrap
        ${side === 'top' ? 'bottom-full mb-2' : ''}
        ${side === 'bottom' ? 'top-full mt-2' : ''}
        ${side === 'left' ? 'right-full mr-2' : ''}
        ${side === 'right' ? 'left-full ml-2' : ''}
        ${align === 'center' ? 'left-1/2 transform -translate-x-1/2' : ''}
        ${align === 'start' ? 'left-0' : ''}
        ${align === 'end' ? 'right-0' : ''}
      `}
      {...props}
    >
      {children}
      
      {/* Arrow */}
      <div 
        className={`
          absolute w-2 h-2 bg-gray-900 border-gray-700 transform rotate-45
          ${side === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-r border-b' : ''}
          ${side === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2 border-l border-t' : ''}
          ${side === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 translate-x-1/2 border-t border-r' : ''}
          ${side === 'right' ? 'right-full top-1/2 transform -translate-y-1/2 -translate-x-1/2 border-b border-l' : ''}
        `}
      />
    </motion.div>
  );
};

export const Tooltip = ({ children, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [triggerElement, setTriggerElement] = useState(null);
  const [contentElement, setContentElement] = useState(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(true);
  };

  const hideTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const childrenArray = React.Children.toArray(children);
  const triggerChild = childrenArray.find(child => child.type === TooltipTrigger);
  const contentChild = childrenArray.find(child => child.type === TooltipContent);

  return (
    <div className="relative inline-block" {...props}>
      {triggerChild && React.cloneElement(triggerChild, {
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        onFocus: showTooltip,
        onBlur: hideTooltip,
      })}
      
      <AnimatePresence>
        {isVisible && contentChild && (
          React.cloneElement(contentChild, {
            onMouseEnter: showTooltip,
            onMouseLeave: hideTooltip,
          })
        )}
      </AnimatePresence>
    </div>
  );
}; 