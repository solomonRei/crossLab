import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar';
import { useToast } from './ui/Toast';
import { 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle2,
  Play,
  Eye,
  MoreHorizontal,
  Flag,
  MessageSquare
} from 'lucide-react';
import { authApiService } from '../services/authApi';
import { notificationService } from '../services/notificationService';
import { formatDate, getAvatarFallback, getDisplayName } from '../lib/utils';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskDetailModal } from './TaskDetailModal';

const TASK_COLUMNS = {
  'todo': {
    id: 'todo',
    title: 'To Do',
    icon: AlertCircle,
    color: 'bg-gray-100 dark:bg-gray-800',
    badgeColor: 'bg-gray-500'
  },
  'in-progress': {
    id: 'in-progress',
    title: 'In Progress',
    icon: Play,
    color: 'bg-blue-50 dark:bg-blue-950',
    badgeColor: 'bg-blue-500'
  },
  'review': {
    id: 'review',
    title: 'Review',
    icon: Eye,
    color: 'bg-yellow-50 dark:bg-yellow-950',
    badgeColor: 'bg-yellow-500'
  },
  'completed': {
    id: 'completed',
    title: 'Completed',
    icon: CheckCircle2,
    color: 'bg-green-50 dark:bg-green-950',
    badgeColor: 'bg-green-500'
  }
};

const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const SortableTaskCard = ({ task, users, onTaskClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const assignee = users.find(user => user.id === task.assigneeId);
  const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className="mb-3 group flex-shrink-0"
    >
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm ${
          isOverdue ? 'ring-2 ring-red-200 dark:ring-red-800' : ''
        }`}
        onClick={() => onTaskClick(task)}
      >
        <CardContent className="p-5">
          <div className="space-y-4">
            {/* Task Header with Priority Indicator */}
            <div className="flex items-center gap-3">
              {/* Priority Color Bar */}
              <div className={`w-1 h-12 rounded-full flex-shrink-0 ${
                task.priority === 'urgent' ? 'bg-red-500' :
                task.priority === 'high' ? 'bg-orange-500' :
                task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-base leading-tight text-gray-900 dark:text-gray-100">
                  {task.title || 'Untitled Task'}
                </h4>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle task menu
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Task Description */}
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* Task Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {task.tags.slice(0, 3).map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  >
                    {tag}
                  </span>
                ))}
                {task.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    +{task.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Task Metadata Row */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                {/* Priority Badge */}
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'urgent' ? 'bg-red-500' :
                    task.priority === 'high' ? 'bg-orange-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
                    {task.priority || 'medium'}
                  </span>
                </div>

                {/* Estimated Hours */}
                {task.estimatedHours && (
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{task.estimatedHours}h</span>
                  </div>
                )}

                {/* Comments Count */}
                {task.commentsCount > 0 && (
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{task.commentsCount}</span>
                  </div>
                )}
              </div>

              {/* Due Date */}
              {task.dueDate && (
                <div className={`flex items-center gap-1.5 ${
                  isOverdue 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              )}
            </div>

            {/* Assignee Section */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2.5">
                {assignee ? (
                  <>
                    <Avatar className="h-7 w-7 ring-2 ring-white dark:ring-gray-800">
                      <AvatarImage src={assignee.avatar} />
                      <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {getAvatarFallback(assignee.firstName, assignee.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {getDisplayName(assignee)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {assignee.projectRole || 'Member'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
                      <User className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Unassigned
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        No assignee
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Status Indicator */}
              <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                task.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                task.status === 'review' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                {task.status === 'in-progress' ? 'In Progress' :
                 task.status === 'todo' ? 'To Do' :
                 task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const TaskColumn = ({ column, tasks, users, onAddTask, onTaskClick }) => {
  const Icon = column.icon;
  
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });
  
  console.log(`Column ${column.id} has ${tasks.length} tasks:`, tasks.map(t => t.title));
  
  return (
    <div className={`rounded-xl p-5 ${column.color} min-h-[600px] max-h-[800px] flex flex-col transition-all duration-200 ${
      isOver ? 'ring-2 ring-blue-200 dark:ring-blue-800 bg-opacity-70' : ''
    }`}>
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${column.badgeColor} bg-opacity-10`}>
            <Icon className={`h-5 w-5 ${column.badgeColor.replace('bg-', 'text-')}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{column.title}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddTask(column.id)}
          className="h-9 w-9 p-0 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Droppable area that covers the entire column */}
      <div 
        ref={setNodeRef} 
        className="flex-1 min-h-[400px] relative"
      >
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          <div 
            className="overflow-y-auto overflow-x-hidden space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent absolute inset-0"
          >
            <AnimatePresence>
              {tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  users={users}
                  onTaskClick={onTaskClick}
                />
              ))}
            </AnimatePresence>
            
            {/* Empty state for column - also acts as drop target */}
            {tasks.length === 0 && (
              <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Drop tasks here</p>
              </div>
            )}
            
            {/* Extra drop space at the bottom */}
            <div className="h-20 w-full" />
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export const TaskBoard = ({ projectId, sprintId = null }) => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalStatus, setCreateModalStatus] = useState('todo');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch tasks and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Пытаемся получить задачи и участников проекта параллельно
        const [tasksResponse, membersResponse] = await Promise.all([
          sprintId 
            ? authApiService.getProjectTasks(projectId, { sprintId })
            : authApiService.getProjectTasks(projectId),
          authApiService.getProjectMembers(projectId, { isActive: true }).catch(err => {
            console.warn('Failed to fetch project members:', err.message);
            return { success: false, data: [], message: err.message };
          })
        ]);

        if (tasksResponse.success) {
          setTasks(tasksResponse.data || []);
        } else {
          console.warn('Failed to fetch tasks:', tasksResponse.message);
          setTasks([]);
          toast.warning('Tasks Load Warning', 'Could not load tasks. Please refresh the page.');
        }
        
        if (membersResponse.success) {
          setUsers(membersResponse.data || []);
        } else {
          console.warn('Failed to fetch project members:', membersResponse.message);
          setUsers([]);
          toast.warning('Members Load Warning', 'Could not load project members.');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        toast.error('Data Load Error', 'Failed to load project data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId, sprintId]);

  // Handle drag start
  const handleDragStart = (event) => {
    console.log('Drag start:', event.active.id);
    setActiveId(event.active.id);
  };

  // Handle drag end
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      console.log('No drop target found');
      return;
    }

    const activeTask = tasks.find(task => task.id === active.id);
    if (!activeTask) {
      console.log('Active task not found');
      return;
    }

    console.log('Drag end:', { activeId: active.id, overId: over.id, activeTask });

    // Check if dropped over a column (could be the column id directly or a task within a column)
    let targetStatus = over.id;
    
    // If dropped over a task, find which column that task belongs to
    if (!Object.keys(TASK_COLUMNS).includes(over.id)) {
      const overTask = tasks.find(task => task.id === over.id);
      if (overTask) {
        targetStatus = overTask.status;
        console.log('Dropped over task, using its status:', targetStatus);
      } else {
        console.log('Could not determine target status');
        return;
      }
    }
    
    if (targetStatus && activeTask && activeTask.status !== targetStatus) {
      const oldStatus = activeTask.status;
      console.log(`Moving task from ${oldStatus} to ${targetStatus}`);
      
      try {
        let response;
        
        // Use specific endpoints for certain transitions
        if (activeTask.status === 'todo' && targetStatus === 'in-progress') {
          // Use dedicated start endpoint
          response = await authApiService.startTask(active.id);
        } else if (activeTask.status === 'in-progress' && targetStatus === 'review') {
          // Use dedicated submit-for-review endpoint
          response = await authApiService.submitTaskForReview(active.id);
        } else {
          // Use generic status update for other transitions
          response = await authApiService.updateTaskStatus(active.id, {
            status: targetStatus
          });
        }

        if (response.success) {
          // Update local state with response data or fallback to target status
          setTasks(prevTasks => {
            const newTasks = [...prevTasks];
            const taskIndex = newTasks.findIndex(t => t.id === active.id);
            if (taskIndex !== -1) {
              if (response.data) {
                // Use the full task data from the response
                newTasks[taskIndex] = {
                  ...newTasks[taskIndex],
                  ...response.data
                };
              } else {
                // Fallback to just updating the status
                newTasks[taskIndex] = {
                  ...newTasks[taskIndex],
                  status: targetStatus
                };
              }
            }
            return newTasks;
          });

          // Create automatic notifications for status changes
          const updatedTask = response.data || { ...activeTask, status: targetStatus };
          
          // Get current user ID for notification context
          const currentUser = await authApiService.getCurrentUser();
          const currentUserId = currentUser.success ? currentUser.data?.id : null;
          
          // Send appropriate notifications based on status change
          if (targetStatus === 'review') {
            // Notify team members that task needs review
            await notificationService.notifyTaskSubmittedForReview(
              updatedTask, 
              currentUserId
            );
          } else if (targetStatus === 'completed') {
            // Notify team about task completion
            await notificationService.notifyTaskCompleted(
              updatedTask, 
              currentUserId
            );
          } else {
            // General status change notification
            await notificationService.notifyTaskStatusChanged(
              updatedTask,
              oldStatus,
              targetStatus,
              currentUserId
            );
          }

          toast.success(
            'Task Status Updated', 
            `Task "${activeTask.title}" moved to ${TASK_COLUMNS[targetStatus].title}`
          );
        } else {
          console.error('API response failed:', response);
          toast.error('Update Failed', response.message || 'Failed to update task status');
        }
      } catch (err) {
        console.error('Failed to update task status:', err);
        toast.error('Update Failed', 'Failed to update task status');
      }
    } else {
      console.log('No status change needed or invalid drop');
    }
  };

  const handleAddTask = (status) => {
    setCreateModalStatus(status);
    setIsCreateModalOpen(true);
  };

  const handleTaskCreated = (newTask) => {
    console.log('Task created successfully:', newTask);
    
    // Добавляем новую задачу в локальное состояние
    setTasks(prev => {
      const updatedTasks = [...prev, newTask];
      console.log('Updated tasks:', updatedTasks);
      return updatedTasks;
    });
    
    // Закрываем модальное окно
    setIsCreateModalOpen(false);

    toast.success('Task Created', `Task "${newTask.title}" created successfully`);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    const status = task.status || 'todo';
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 dark:bg-red-950 rounded-lg">
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-200">
          Failed to load tasks
        </h3>
        <p className="text-red-600 dark:text-red-300 mt-2">{error}</p>
      </div>
    );
  }

  const activeTask = activeId ? tasks.find(task => task.id === activeId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Task Board</h2>
        <Button onClick={() => handleAddTask('todo')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Показываем сообщение, если нет задач */}
      {!isLoading && tasks.length === 0 && !error && (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            No Tasks Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Get started by creating your first task using the "Add Task" button above.
          </p>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-[calc(100vh-200px)] overflow-hidden">
          {Object.values(TASK_COLUMNS).map(column => (
            <TaskColumn
              key={column.id}
              column={column}
              tasks={tasksByStatus[column.id] || []}
              users={users}
              onAddTask={handleAddTask}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-6 opacity-90">
              <SortableTaskCard
                task={activeTask}
                users={users}
                onTaskClick={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        projectId={projectId}
        sprintId={sprintId}
        initialStatus={createModalStatus}
      />

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          users={users}
        />
      )}
    </div>
  );
}; 