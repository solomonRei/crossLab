import React, { useState } from 'react';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const Calendar = ({ 
  mode = "single", 
  selected, 
  onSelect, 
  initialFocus = false,
  className,
  ...props 
}) => {
  const [currentDate, setCurrentDate] = useState(
    selected ? new Date(selected) : new Date()
  );
  
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Create calendar grid
  const calendarDays = [];
  
  // Previous month's trailing days
  const prevMonth = new Date(currentYear, currentMonth - 1, 0);
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonth.getDate() - i,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth - 1, prevMonth.getDate() - i)
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: new Date(currentYear, currentMonth, day)
    });
  }
  
  // Next month's leading days
  const remainingDays = 42 - calendarDays.length; // 6 rows * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth + 1, day)
    });
  }
  
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };
  
  const handleDateClick = (date) => {
    if (mode === "single") {
      onSelect?.(date);
    }
  };
  
  const isSelected = (date) => {
    if (!selected) return false;
    const selectedDate = new Date(selected);
    return date.toDateString() === selectedDate.toDateString();
  };
  
  const isToday = (date) => {
    return date.toDateString() === today.toDateString();
  };
  
  return (
    <div className={cn("p-3", className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth(-1)}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="font-semibold">
          {MONTHS[currentMonth]} {currentYear}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth(1)}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.slice(0, 42).map((calendarDay, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => handleDateClick(calendarDay.date)}
            className={cn(
              "h-9 w-9 p-0 font-normal",
              !calendarDay.isCurrentMonth && "text-muted-foreground opacity-50",
              isSelected(calendarDay.date) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              isToday(calendarDay.date) && !isSelected(calendarDay.date) && "bg-accent text-accent-foreground",
              "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {calendarDay.day}
          </Button>
        ))}
      </div>
    </div>
  );
}; 