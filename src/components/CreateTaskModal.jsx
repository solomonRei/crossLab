import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/Select';
import { Badge } from './ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/Popover';
import { 
  CalendarIcon, 
  X, 
  Plus,
  User,
  Flag,
  Clock,
  Hash,
  Target
} from 'lucide-react';
import { authApiService } from '../services/authApi';
import { formatDate, getAvatarFallback } from '../lib/utils';
import { cn } from '../lib/utils';
import { useToast } from './ui/Toast';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' }
];

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' }
];

export const CreateTaskModal = ({ 
  isOpen, 
  onClose, 
  onTaskCreated, 
  projectId, 
  sprintId = null,
  initialStatus = 'todo',
  task = null // For editing existing task
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    status: initialStatus,
    priority: 'medium',
    estimatedHours: '',
    dueDate: null,
    tags: [],
    dependencies: []
  });
  
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const { toast } = useToast();

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Editing existing task
        setFormData({
          title: task.title || '',
          description: task.description || '',
          assigneeId: task.assigneeId || '',
          status: task.status || 'todo',
          priority: task.priority || 'medium',
          estimatedHours: task.estimatedHours?.toString() || '',
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          tags: task.tags || [],
          dependencies: task.dependencies || []
        });
      } else {
        // Creating new task
        setFormData({
          title: '',
          description: '',
          assigneeId: '',
          status: initialStatus,
          priority: 'medium',
          estimatedHours: '',
          dueDate: null,
          tags: [],
          dependencies: []
        });
      }
      setError(null);
      
      // Fetch available tasks for dependencies
      fetchAvailableTasks();
      
      // Fetch project members for assignee selection
      fetchProjectMembers();
    }
  }, [isOpen, task, initialStatus, projectId]);

  const fetchAvailableTasks = async () => {
    try {
      // Теперь используем правильный API endpoint для получения задач проекта
      const response = await authApiService.getProjectTasks(projectId);
      if (response.success) {
        const tasks = response.data?.filter(t => t.id !== task?.id) || [];
        setAvailableTasks(tasks);
      } else {
        console.warn('Failed to fetch available tasks:', response.message);
        setAvailableTasks([]);
      }
    } catch (err) {
      console.error('Failed to fetch available tasks:', err);
      setAvailableTasks([]);
    }
  };

  const fetchProjectMembers = async () => {
    try {
      const response = await authApiService.getProjectMembers(projectId, { isActive: true });
      if (response.success) {
        setProjectMembers(response.data || []);
      } else {
        console.warn('Failed to fetch project members:', response.message);
        setProjectMembers([]);
        toast.warning('Members Load Warning', 'Could not load project members. You may need to refresh the page.');
      }
    } catch (err) {
      console.error('Error fetching project members:', err);
      setProjectMembers([]);
      toast.error('Members Load Error', 'Failed to load project members');
    }
  };

  const handleInputChange = (name, value) => {
    // Обрабатываем специальный случай для assigneeId
    if (name === 'assigneeId' && value === 'unassigned') {
      value = '';
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        projectId,
        sprintId: sprintId || null,
        assigneeId: formData.assigneeId || null,
        status: formData.status,
        priority: formData.priority,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : null,
        tags: formData.tags || [],
        dependencies: formData.dependencies || [],
        createdBy: null // Будет установлен на сервере
      };

      console.log('Creating task with data:', taskData);

      let response;
      if (task) {
        // Update existing task
        response = await authApiService.updateTask(task.id, taskData);
      } else {
        // Create new task
        response = await authApiService.createTask(taskData);
      }

      console.log('Task creation response:', response);

      if (response.success && response.data) {
        onTaskCreated(response.data);
        onClose();
        
        toast.success(
          task ? 'Task Updated' : 'Task Created', 
          task ? 'Task has been updated successfully' : 'Task has been created successfully'
        );
      } else {
        setError(response.message || 'Failed to save task');
        toast.error('Save Failed', response.message || 'Failed to save task');
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.message || 'Failed to save task');
      toast.error('Error', err.message || 'An unexpected error occurred while saving the task');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAssignee = projectMembers.find(user => user.id === formData.assigneeId);
  const selectedPriority = PRIORITY_OPTIONS.find(p => p.value === formData.priority);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-700 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title..."
              className="w-full"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the task..."
              rows={4}
              className="w-full"
            />
          </div>

          {/* Row 1: Assignee and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select
                value={formData.assigneeId || 'unassigned'}
                onValueChange={(value) => handleInputChange('assigneeId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee">
                    {selectedAssignee && (
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={selectedAssignee.avatar} />
                          <AvatarFallback className="text-xs">
                            {getAvatarFallback(selectedAssignee.firstName, selectedAssignee.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{selectedAssignee.firstName} {selectedAssignee.lastName}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Unassigned</span>
                    </div>
                  </SelectItem>
                  {projectMembers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xs">
                            {getAvatarFallback(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.firstName} {user.lastName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Priority and Estimated Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {selectedPriority && (
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${selectedPriority.color}`} />
                        <Flag className="h-3 w-3" />
                        <span>{selectedPriority.label}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${priority.color}`} />
                        <span>{priority.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                  placeholder="0.0"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? formatDate(formData.dueDate) : "Select due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => handleInputChange('dueDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1"
              />
              <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Dependencies */}
          {availableTasks.length > 0 && (
            <div className="space-y-2">
              <Label>Dependencies</Label>
              <Select
                onValueChange={(taskId) => {
                  if (taskId && !formData.dependencies.includes(taskId)) {
                    handleInputChange('dependencies', [...formData.dependencies, taskId]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add dependency..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTasks
                    .filter(t => !formData.dependencies.includes(t.id))
                    .map(task => (
                      <SelectItem key={task.id} value={task.id}>
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4" />
                          <span>{task.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              
              {formData.dependencies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.dependencies.map(depId => {
                    const depTask = availableTasks.find(t => t.id === depId);
                    return depTask ? (
                      <Badge key={depId} variant="outline" className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {depTask.title}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => {
                            handleInputChange('dependencies', 
                              formData.dependencies.filter(id => id !== depId)
                            );
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isLoading || !formData.title.trim()}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {task ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              task ? 'Update Task' : 'Create Task'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 