import { authApiService } from './authApi';

/**
 * Service for creating automatic notifications for various system events
 */
class NotificationService {
  constructor() {
    this.isEnabled = true;
  }

  // Enable or disable automatic notifications
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  // Create task assignment notification
  async notifyTaskAssigned(taskData, assigneeId, assignedByUserId) {
    if (!this.isEnabled || !assigneeId) return null;

    try {
      const mentionData = {
        mentionedUserIds: [assigneeId],
        message: `You have been assigned to task "${taskData.title}"`,
        context: `Task Assignment - ${taskData.title}`,
        relatedEntityId: taskData.id,
        relatedEntityType: 'Task',
        actionUrl: `/projects/${taskData.projectId}/tasks/${taskData.id}`,
        priority: 'Normal'
      };

      return await authApiService.createMentionNotification(mentionData);
    } catch (error) {
      console.error('Failed to create task assignment notification:', error);
      return null;
    }
  }

  // Create task status change notification
  async notifyTaskStatusChanged(taskData, oldStatus, newStatus, changedByUserId) {
    if (!this.isEnabled || !taskData.assigneeId || taskData.assigneeId === changedByUserId) {
      return null; // Don't notify if no assignee or if assignee changed it themselves
    }

    try {
      const statusLabels = {
        'todo': 'To Do',
        'in-progress': 'In Progress', 
        'review': 'Review',
        'completed': 'Completed'
      };

      const mentionData = {
        mentionedUserIds: [taskData.assigneeId],
        message: `Task "${taskData.title}" status changed from ${statusLabels[oldStatus]} to ${statusLabels[newStatus]}`,
        context: `Task Status Change - ${taskData.title}`,
        relatedEntityId: taskData.id,
        relatedEntityType: 'Task',
        actionUrl: `/projects/${taskData.projectId}/tasks/${taskData.id}`,
        priority: newStatus === 'completed' ? 'High' : 'Normal'
      };

      return await authApiService.createMentionNotification(mentionData);
    } catch (error) {
      console.error('Failed to create task status change notification:', error);
      return null;
    }
  }

  // Create task submitted for review notification
  async notifyTaskSubmittedForReview(taskData, submittedByUserId, reviewerIds = []) {
    if (!this.isEnabled) return null;

    try {
      // If no specific reviewers, notify project members with review permissions
      let mentionedUserIds = reviewerIds;
      
      if (mentionedUserIds.length === 0) {
        // Get project members who can review (project leads, etc.)
        const membersResponse = await authApiService.getProjectMembers(taskData.projectId, { isActive: true });
        if (membersResponse.success) {
          // For now, notify all project members - in real app you'd filter by permissions
          mentionedUserIds = membersResponse.data
            .filter(member => member.userId !== submittedByUserId)
            .map(member => member.userId);
        }
      }

      if (mentionedUserIds.length === 0) return null;

      const mentionData = {
        mentionedUserIds,
        message: `Task "${taskData.title}" has been submitted for review`,
        context: `Task Review Request - ${taskData.title}`,
        relatedEntityId: taskData.id,
        relatedEntityType: 'Task',
        actionUrl: `/projects/${taskData.projectId}/tasks/${taskData.id}`,
        priority: 'High'
      };

      return await authApiService.createMentionNotification(mentionData);
    } catch (error) {
      console.error('Failed to create task review notification:', error);
      return null;
    }
  }

  // Create task completed notification
  async notifyTaskCompleted(taskData, completedByUserId) {
    if (!this.isEnabled) return null;

    try {
      // Notify project members about task completion
      const membersResponse = await authApiService.getProjectMembers(taskData.projectId, { isActive: true });
      if (!membersResponse.success) return null;

      const mentionedUserIds = membersResponse.data
        .filter(member => member.userId !== completedByUserId)
        .map(member => member.userId);

      if (mentionedUserIds.length === 0) return null;

      const mentionData = {
        mentionedUserIds,
        message: `Task "${taskData.title}" has been completed`,
        context: `Task Completion - ${taskData.title}`,
        relatedEntityId: taskData.id,
        relatedEntityType: 'Task',
        actionUrl: `/projects/${taskData.projectId}/tasks/${taskData.id}`,
        priority: 'Normal'
      };

      return await authApiService.createMentionNotification(mentionData);
    } catch (error) {
      console.error('Failed to create task completion notification:', error);
      return null;
    }
  }

  // Create project invitation notification
  async notifyProjectInvitation(projectData, invitedUserId, invitedByUserId) {
    if (!this.isEnabled) return null;

    try {
      const mentionData = {
        mentionedUserIds: [invitedUserId],
        message: `You have been invited to join the project "${projectData.title}"`,
        context: `Project Invitation - ${projectData.title}`,
        relatedEntityId: projectData.id,
        relatedEntityType: 'Project',
        actionUrl: `/projects/${projectData.id}`,
        priority: 'High'
      };

      return await authApiService.createMentionNotification(mentionData);
    } catch (error) {
      console.error('Failed to create project invitation notification:', error);
      return null;
    }
  }

  // Create project milestone notification
  async notifyProjectMilestone(projectData, milestoneMessage, priority = 'Normal') {
    if (!this.isEnabled) return null;

    try {
      // Notify all project members
      const membersResponse = await authApiService.getProjectMembers(projectData.id, { isActive: true });
      if (!membersResponse.success) return null;

      const mentionedUserIds = membersResponse.data.map(member => member.userId);
      if (mentionedUserIds.length === 0) return null;

      const mentionData = {
        mentionedUserIds,
        message: milestoneMessage,
        context: `Project Milestone - ${projectData.title}`,
        relatedEntityId: projectData.id,
        relatedEntityType: 'Project',
        actionUrl: `/projects/${projectData.id}`,
        priority
      };

      return await authApiService.createMentionNotification(mentionData);
    } catch (error) {
      console.error('Failed to create project milestone notification:', error);
      return null;
    }
  }

  // Create mention notification (for comments, etc.)
  async notifyMention(mentionedUserIds, message, context, relatedEntityId, relatedEntityType, actionUrl, priority = 'Normal') {
    if (!this.isEnabled || !mentionedUserIds.length) return null;

    try {
      const mentionData = {
        mentionedUserIds,
        message,
        context,
        relatedEntityId,
        relatedEntityType,
        actionUrl,
        priority
      };

      return await authApiService.createMentionNotification(mentionData);
    } catch (error) {
      console.error('Failed to create mention notification:', error);
      return null;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService; 