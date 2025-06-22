import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/Dialog';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar';
import { Textarea } from './ui/Textarea';
import { Input } from './ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { useToast } from './ui/Toast';
import { 
  Calendar, 
  Clock, 
  User, 
  Flag,
  Hash,
  Target,
  MessageSquare,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle2,
  Eye,
  RotateCcw,
  Link,
  Send,
  FileText,
  History,
  Settings,
  Users,
  AlertTriangle,
  ChevronRight,
  X
} from 'lucide-react';
import { authApiService } from '../services/authApi';
import { formatDate, getAvatarFallback } from '../lib/utils';
import { CreateTaskModal } from './CreateTaskModal';

const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300'
};

const STATUS_COLORS = {
  'todo': 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border-blue-300',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300',
  'review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300',
  'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300'
};

const STATUS_ACTIONS = {
  'todo': [
    { action: 'start', label: 'Start Task', icon: Play, variant: 'default', color: 'bg-blue-600 hover:bg-blue-700' },
    { action: 'review', label: 'Submit for Review', icon: Eye, variant: 'outline' }
  ],
  'in-progress': [
    { action: 'complete', label: 'Mark Complete', icon: CheckCircle2, variant: 'default', color: 'bg-green-600 hover:bg-green-700' },
    { action: 'review', label: 'Submit for Review', icon: Eye, variant: 'outline' }
  ],
  'review': [
    { action: 'complete', label: 'Approve & Complete', icon: CheckCircle2, variant: 'default', color: 'bg-green-600 hover:bg-green-700' },
    { action: 'reopen', label: 'Request Changes', icon: RotateCcw, variant: 'outline' }
  ],
  'completed': [
    { action: 'reopen', label: 'Reopen Task', icon: RotateCcw, variant: 'outline' }
  ]
};

const TaskComment = ({ comment, currentUser }) => {
  const isOwn = comment.authorId === currentUser?.id;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-700">
          <AvatarImage src={comment.author?.avatar} />
          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
            {getAvatarFallback(comment.author?.firstName, comment.author?.lastName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {comment.author?.firstName} {comment.author?.lastName}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                {formatDate(comment.createdAt)}
              </span>
            </div>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed m-0">
              {comment.content}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TaskHeader = ({ task, assignee, onEdit, onDelete, isOverdue }) => {
  const priorityColor = PRIORITY_COLORS[task?.priority] || PRIORITY_COLORS.medium;
  const statusColor = STATUS_COLORS[task?.status] || STATUS_COLORS.todo;

  return (
    <div className="bg-white dark:bg-gray-900 border-b-2 border-gray-100 dark:border-gray-800 pb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-1.5 h-12 rounded-full flex-shrink-0 ${
              task.priority === 'urgent' ? 'bg-red-500' :
              task.priority === 'high' ? 'bg-orange-500' :
              task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-1">
                {task.title || 'Untitled Task'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Task #{task.id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className={`${priorityColor} border px-3 py-1 text-xs font-semibold`}>
              <Flag className="h-3 w-3 mr-1.5" />
              {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)} Priority
            </Badge>
            
            <Badge className={`${statusColor} border px-3 py-1 text-xs font-semibold`}>
              {task.status === 'in-progress' ? 'In Progress' :
               task.status === 'todo' ? 'To Do' :
               task.status?.charAt(0).toUpperCase() + task.status?.slice(1)}
            </Badge>
            
            {isOverdue && (
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-300 px-3 py-1 text-xs font-semibold">
                <AlertTriangle className="h-3 w-3 mr-1.5" />
                Overdue
              </Badge>
            )}
            
            {assignee && (
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Avatar className="h-6 w-6 ring-2 ring-white dark:ring-gray-700">
                  <AvatarImage src={assignee.avatar} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {getAvatarFallback(assignee.firstName, assignee.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                    {assignee.firstName} {assignee.lastName}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {assignee.projectRole || 'Member'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="h-8 px-4 border hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950"
          >
            <Edit className="h-3 w-3 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="h-8 px-3 border text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-950"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const TaskDetails = ({ task, assignee, isOverdue }) => {
  return (
    <div className="space-y-6">
      {/* Description Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Description
          </h3>
        </div>
        <div className="p-4">
          {task.description ? (
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                {task.description}
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <FileText className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                No description provided
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Properties Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-lg">
              <Settings className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            Properties
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Assignee */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Assigned to</span>
                {assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7 ring-2 ring-gray-100 dark:ring-gray-700">
                      <AvatarImage src={assignee.avatar} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {getAvatarFallback(assignee.firstName, assignee.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {assignee.firstName} {assignee.lastName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {assignee.projectRole || 'Member'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    Unassigned
                  </span>
                )}
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Priority</span>
                <Badge className={`${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium} border px-2 py-1`}>
                  <Flag className="h-3 w-3 mr-1" />
                  {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)}
                </Badge>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Status</span>
                <Badge className={`${STATUS_COLORS[task.status] || STATUS_COLORS.todo} border px-2 py-1`}>
                  {task.status === 'in-progress' ? 'In Progress' :
                   task.status === 'todo' ? 'To Do' :
                   task.status?.charAt(0).toUpperCase() + task.status?.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {/* Due Date */}
              {task.dueDate && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Due Date</span>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                    isOverdue 
                      ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900' 
                      : 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800'
                  }`}>
                    <Calendar className="h-3 w-3" />
                    {formatDate(task.dueDate)}
                  </div>
                </div>
              )}

              {/* Estimated Hours */}
              {task.estimatedHours && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Estimated</span>
                  <div className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                    <Clock className="h-3 w-3" />
                    {task.estimatedHours}h
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Created</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                  {formatDate(task.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tags Card */}
      {task.tags && task.tags.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Hash className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              Tags
            </h3>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-lg"
                >
                  <Hash className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskActivity = ({ comments, currentUser, newComment, setNewComment, onAddComment }) => {
  return (
    <div className="space-y-6">
      {/* Activity Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 py-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <History className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              Activity Timeline
            </div>
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </Badge>
          </h3>
        </div>
      </div>
      
      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.map(comment => (
            <TaskComment 
              key={comment.id} 
              comment={comment} 
              currentUser={currentUser}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Add Comment Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Add Comment
          </h4>
        </div>
        <div className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-700">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getAvatarFallback(currentUser?.firstName, currentUser?.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="min-h-[80px] resize-none border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-sm"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={onAddComment}
                  disabled={!newComment.trim()}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 h-8 text-sm"
                >
                  <Send className="h-3 w-3 mr-1.5" />
                  Add Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskActions = ({ task, statusActions, onStatusChange, isLoading }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <Play className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          Quick Actions
        </h3>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {statusActions.map((action, index) => (
            <Button
              key={index}
              onClick={() => onStatusChange(action.action)}
              disabled={isLoading}
              variant={action.variant}
              className={`w-full h-9 justify-start text-left border rounded-lg font-medium text-sm ${action.color || 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <action.icon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="flex-1">{action.label}</span>
              <ChevronRight className="h-3 w-3 ml-2 flex-shrink-0" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TaskDetailModal = ({ task, isOpen, onClose, users = [] }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dependencies, setDependencies] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const { toast } = useToast();

  const assignee = users.find(user => user.id === task?.assigneeId);
  const statusActions = STATUS_ACTIONS[task?.status] || [];
  const isOverdue = task?.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  // Fetch additional data when modal opens
  useEffect(() => {
    if (isOpen && task) {
      fetchTaskDetails();
      fetchCurrentUser();
    }
  }, [isOpen, task]);

  const fetchCurrentUser = async () => {
    try {
      const response = await authApiService.getCurrentUser();
      if (response.success) {
        setCurrentUser(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
    }
  };

  const fetchTaskDetails = async () => {
    try {
      // Fetch task dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        const depPromises = task.dependencies.map(depId => 
          authApiService.getTaskById(depId).catch(() => null)
        );
        const depResults = await Promise.all(depPromises);
        setDependencies(depResults.filter(dep => dep?.success).map(dep => dep.data));
      }

      // Fetch comments (mock for now - would be real API call)
      setComments([
        {
          id: '1',
          content: 'Task created and ready for development.',
          authorId: task.createdBy,
          author: users.find(u => u.id === task.createdBy) || { firstName: 'System', lastName: '' },
          createdAt: task.createdAt || new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error('Failed to fetch task details:', err);
    }
  };

  const handleStatusChange = async (action) => {
    setIsLoading(true);
    try {
      let response;
      let newStatus;
      let actionText;
      
      switch (action) {
        case 'start':
          // Use dedicated start endpoint
          response = await authApiService.startTask(task.id);
          newStatus = 'in-progress';
          actionText = 'started';
          break;
        case 'complete':
          // Use status endpoint for completion
          response = await authApiService.completeTask(task.id);
          newStatus = 'completed';
          actionText = 'completed';
          break;
        case 'review':
          // Use dedicated submit-for-review endpoint
          response = await authApiService.submitTaskForReview(task.id);
          newStatus = 'review';
          actionText = 'submitted for review';
          break;
        case 'reopen':
          // Use status endpoint for reopening
          response = await authApiService.reopenTask(task.id);
          newStatus = 'in-progress';
          actionText = 'reopened';
          break;
        default:
          return;
      }

      if (response.success) {
        // Update local task object with response data
        if (response.data) {
          Object.assign(task, response.data);
        } else {
          // Fallback if no data in response
          task.status = newStatus;
        }
        
        // Add comment about status change
        const comment = {
          id: Date.now().toString(),
          content: `Task ${actionText}`,
          authorId: currentUser?.id,
          author: currentUser,
          createdAt: new Date().toISOString()
        };
        setComments(prev => [...prev, comment]);

        // Show success notification
        toast.success('Task Updated', `Task has been ${actionText} successfully`);
      } else {
        toast.error('Update Failed', response.message || 'Failed to update task status');
      }
      
    } catch (err) {
      toast.error('Update Error', err.message || 'An error occurred while updating the task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      // In real implementation, this would be an API call
      const comment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        authorId: currentUser?.id,
        author: currentUser,
        createdAt: new Date().toISOString()
      };
      
      setComments(prev => [...prev, comment]);
      setNewComment('');
      
      // Show success notification
      toast.success('Comment Added', 'Your comment has been added successfully');
    } catch (err) {
      toast.error('Comment Error', 'Failed to add comment');
    }
  };

  const handleTaskUpdated = (updatedTask) => {
    // Update the task object with new data
    Object.assign(task, updatedTask);
    setIsEditModalOpen(false);
    
    // Show success notification
    toast.success('Task Updated', 'Task details have been updated successfully');
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await authApiService.deleteTask(task.id);
      if (response.success) {
        onClose();
        toast.success('Task Deleted', 'Task has been deleted successfully');
      } else {
        toast.error('Delete Failed', response.message || 'Failed to delete task');
      }
    } catch (err) {
      toast.error('Delete Error', err.message || 'An error occurred while deleting the task');
    }
  };

  if (!task) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-gray-50 dark:bg-gray-950">
          {/* Header */}
          <div className="px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <TaskHeader 
              task={task}
              assignee={assignee}
              onEdit={() => setIsEditModalOpen(true)}
              onDelete={handleDelete}
              isOverdue={isOverdue}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 h-full">
              {/* Main Content */}
              <div className="lg:col-span-3 overflow-y-auto px-6 py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 h-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                    <TabsTrigger value="details" className="flex items-center gap-2 h-8 rounded-md font-medium text-sm">
                      <FileText className="h-3 w-3" />
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex items-center gap-2 h-8 rounded-md font-medium text-sm">
                      <History className="h-3 w-3" />
                      Activity
                      {comments.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-4 text-xs px-1.5">
                          {comments.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="mt-0">
                    <TaskDetails 
                      task={task}
                      assignee={assignee}
                      isOverdue={isOverdue}
                    />
                  </TabsContent>
                  
                  <TabsContent value="activity" className="mt-0">
                    <TaskActivity 
                      comments={comments}
                      currentUser={currentUser}
                      newComment={newComment}
                      setNewComment={setNewComment}
                      onAddComment={handleAddComment}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 bg-gray-100 dark:bg-gray-900 border-l-2 border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                <TaskActions 
                  task={task}
                  statusActions={statusActions}
                  onStatusChange={handleStatusChange}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onTaskCreated={handleTaskUpdated}
        projectId={task.projectId}
        sprintId={task.sprintId}
        users={users}
        task={task}
      />
    </>
  );
}; 