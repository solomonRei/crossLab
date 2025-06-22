import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import { 
  X, 
  Calendar as CalendarIcon,
  Users,
  Clock,
  Video,
  Settings
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { useToast } from '../ui/Toast';
import { DEMO_SESSION_TYPE, RECORDING_QUALITY } from '../../hooks/demo/useDemoState';
import { authApiService } from '../../services/authApi';

export const CreateDemoModal = ({ isOpen, onClose, onSessionCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(new Date(Date.now() + 3600000)); // 1 hour from now
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: DEMO_SESSION_TYPE.PRODUCT_DEMO,
    maxParticipants: 50,
    autoRecord: true,
    recordingQuality: RECORDING_QUALITY.HD,
    allowScreenShare: true,
    requireModeration: false,
    isPublic: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const sessionData = {
        ...formData,
        scheduledAt: scheduledAt.toISOString(),
        maxParticipants: parseInt(formData.maxParticipants, 10),
        duration: 120 // 2 hours default
      };

      const response = await authApiService.createDemoSession(sessionData);
      
      if (response.success) {
        toast.success('Demo Session Created', 'Your demo session has been created successfully!');
        onSessionCreated(response.data);
        onClose();
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          type: DEMO_SESSION_TYPE.PRODUCT_DEMO,
          maxParticipants: 50,
          autoRecord: true,
          recordingQuality: RECORDING_QUALITY.HD,
          allowScreenShare: true,
          requireModeration: false,
          isPublic: true
        });
        setScheduledAt(new Date(Date.now() + 3600000));
      } else {
        toast.error('Creation Failed', response.message || 'Failed to create demo session');
      }
    } catch (error) {
      console.error('Error creating demo session:', error);
      toast.error('Creation Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-semibold">Create Demo Session</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Session Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Product Demo - Q4 Features"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe what this demo session will cover..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Session Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Session Type</Label>
                    <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select session type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={DEMO_SESSION_TYPE.PRODUCT_DEMO}>
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Product Demo
                          </div>
                        </SelectItem>
                        <SelectItem value={DEMO_SESSION_TYPE.TRAINING}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Training Session
                          </div>
                        </SelectItem>
                        <SelectItem value={DEMO_SESSION_TYPE.WEBINAR}>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            Webinar
                          </div>
                        </SelectItem>
                        <SelectItem value={DEMO_SESSION_TYPE.CLIENT_PRESENTATION}>
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Client Presentation
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      name="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={handleInputChange}
                      min="1"
                      max="500"
                    />
                  </div>
                </div>

                {/* Scheduling */}
                <div>
                  <Label className="mb-2 block">Scheduled Time</Label>
                  <DatePicker
                    selected={scheduledAt}
                    onChange={(date) => setScheduledAt(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={new Date()}
                    customInput={
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        type="button"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(scheduledAt, "PPP 'at' p")}
                      </Button>
                    }
                  />
                </div>

                {/* Recording Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Recording Settings</h3>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoRecord"
                      name="autoRecord"
                      checked={formData.autoRecord}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="autoRecord">Auto-record session</Label>
                  </div>

                  {formData.autoRecord && (
                    <div>
                      <Label htmlFor="recordingQuality">Recording Quality</Label>
                      <Select 
                        value={formData.recordingQuality} 
                        onValueChange={(value) => handleSelectChange('recordingQuality', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={RECORDING_QUALITY.SD}>SD (480p)</SelectItem>
                          <SelectItem value={RECORDING_QUALITY.HD}>HD (720p)</SelectItem>
                          <SelectItem value={RECORDING_QUALITY.FULL_HD}>Full HD (1080p)</SelectItem>
                          <SelectItem value={RECORDING_QUALITY.UHD}>4K UHD (2160p)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Advanced Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Advanced Settings</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="allowScreenShare"
                        name="allowScreenShare"
                        checked={formData.allowScreenShare}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="allowScreenShare">Allow screen sharing</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requireModeration"
                        name="requireModeration"
                        checked={formData.requireModeration}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="requireModeration">Require moderation for participants</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        name="isPublic"
                        checked={formData.isPublic}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="isPublic">Make session publicly discoverable</Label>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Session'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}; 