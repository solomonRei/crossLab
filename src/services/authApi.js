import { logApiRequest, logError, devLog } from "../config/devTools";

// API Configuration
const API_CONFIG = {
  https: {
    baseUrl: process.env.REACT_APP_API_URL || "https://192.168.0.47:7001",
    mode: "https",
    port: 7001,
  },
  http: {
    baseUrl: process.env.REACT_APP_API_URL_HTTP || "http://192.168.0.47:5059",
    mode: "http",
    port: 5059,
  },
};

// Get current API mode from localStorage or environment
const getCurrentApiMode = () => {
  return (
    localStorage.getItem("api_mode") || process.env.REACT_APP_API_MODE || "http"
  );
};

// Custom error class for API errors
export class AuthApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.errors = errors;
  }
}

class AuthApiService {
  constructor() {
    this.currentMode = getCurrentApiMode();
    this.baseUrl = API_CONFIG[this.currentMode].baseUrl;
    this.token = localStorage.getItem("token");
    
    // Log initial configuration
    devLog("AuthApiService initialized:", {
      mode: this.currentMode,
      baseUrl: this.baseUrl,
      hasToken: !!this.token,
    });
    
    // Make service globally available for debugging
    if (process.env.NODE_ENV === "development") {
      window.__CROSSLAB_AUTH_SERVICE__ = this;
    }
  }

  // Get current API configuration
  getApiInfo() {
    return {
      mode: this.currentMode,
      baseUrl: this.baseUrl,
      available: API_CONFIG,
      hasToken: !!this.token,
    };
  }

  // Switch API mode
  switchApiMode(mode) {
    if (!API_CONFIG[mode]) {
      throw new Error(`Invalid API mode: ${mode}`);
    }

    const oldMode = this.currentMode;
    this.currentMode = mode;
    this.baseUrl = API_CONFIG[mode].baseUrl;

    localStorage.setItem("api_mode", mode);
    
    devLog(`API mode switched from ${oldMode} to ${mode}`, {
      oldUrl: API_CONFIG[oldMode].baseUrl,
      newUrl: this.baseUrl,
    });
    
    return this.baseUrl;
  }

  // Set token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
      devLog("Token set in localStorage");
    } else {
      localStorage.removeItem("token");
      devLog("Token removed from localStorage");
    }
  }

  // Get token
  getToken() {
    return this.token;
  }

  // HTTP client with automatic token handling
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/api/v1${endpoint}`;
    
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    // Log API request
    logApiRequest(
      config.method || "GET",
      url,
      options.body ? JSON.parse(options.body) : null
    );

    try {
      devLog(`Making ${config.method || "GET"} request to:`, url);

      const response = await fetch(url, config);
      
      // Check if response has content
      const contentType = response.headers.get("content-type");
      const hasJsonContent =
        contentType && contentType.includes("application/json");
      
      let data = null;
      
      // Only try to parse JSON if response has content and is JSON
      if (hasJsonContent && response.headers.get("content-length") !== "0") {
        try {
          const text = await response.text();
          if (text.trim()) {
            data = JSON.parse(text);
          } else {
            data = { success: false, message: "Empty response from server" };
          }
        } catch (parseError) {
          devLog("Failed to parse JSON response:", parseError);
          data = { 
            success: false, 
            message: `Invalid JSON response: ${parseError.message}`,
            status: response.status,
          };
        }
      } else {
        // No JSON content or empty response
        data = { 
          success: false, 
          message: `HTTP ${response.status}${
            response.statusText ? ": " + response.statusText : ""
          }`,
          status: response.status,
        };
      }

      // Log response
      devLog(`API Response (${response.status}):`, data);

      if (!response.ok) {
        // Handle different error formats
        const errorMessage =
          data.message || data.error || `HTTP ${response.status}`;
        const errors = data.errors || data.validationErrors || [];

        logError(
          new Error(errorMessage),
          `API ${config.method || "GET"} ${endpoint}`
        );
        throw new AuthApiError(errorMessage, response.status, errors);
      }

      return data;
    } catch (error) {
      if (error instanceof AuthApiError) {
        throw error;
      }

      logError(error, `API ${config.method || "GET"} ${endpoint}`);
      throw new AuthApiError(error.message || "Network error", 0, []);
    }
  }

  // =================================================================
  // Authentication endpoints
  // =================================================================
  async login(credentials) {
    devLog("Attempting login for:", credentials.email);
    
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // Store token if login successful
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async register(userData) {
    devLog("Attempting registration for:", userData.email);
    
    return await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    devLog("Fetching current user data");
    
    return await this.request("/auth/me");
  }

  async getAllUsers() {
    devLog("Fetching all users");
    
    return await this.request("/auth/users");
  }

  async getUserById(id) {
    devLog("Fetching user by ID:", id);
    
    return await this.request(`/auth/users/${id}`);
  }

  // Logout - clear token
  logout() {
    devLog("User logging out");
    this.setToken(null);
  }

  // =================================================================
  // Projects API Endpoints
  // =================================================================
  async getProjectById(projectId) {
    devLog(`Fetching project data for ID: ${projectId}`);
    return this.request(`/projects/${projectId}`);
  }

  async getProjects(params = {}) {
    devLog("Fetching all projects with params:", params);
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/projects?${queryString}`);
  }

  async createProject(projectData) {
    devLog("Creating new project:", projectData);
    return this.request("/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    });
  }

  async updateProjectProgress(projectId, progressData) {
    devLog(`Updating progress for project ID: ${projectId}`, progressData);
    return this.request(`/projects/${projectId}/progress`, {
      method: "PUT",
      body: JSON.stringify(progressData),
    });
  }

  async updateProjectVisibility(projectId, visibilityData) {
    devLog(`Updating visibility for project ID: ${projectId}`, visibilityData);
    return this.request(`/projects/${projectId}/visibility`, {
      method: "PUT",
      body: JSON.stringify(visibilityData),
    });
  }

  async deleteProject(projectId) {
    devLog(`Deleting project ID: ${projectId}`);
    return this.request(`/projects/${projectId}`, {
      method: "DELETE",
    });
  }

  // Get project members
  async getProjectMembers(projectId, filters = {}) {
    devLog(`Fetching members for project: ${projectId}`, filters);
    
    const queryParams = new URLSearchParams();
    if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);
    if (filters.isProjectLead !== undefined) queryParams.append('isProjectLead', filters.isProjectLead);
    
    const queryString = queryParams.toString();
    const url = `/projects/${projectId}/members${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await this.request(url);
      
      const members = Array.isArray(response) ? response : (response.data || []);
  
      const transformedMembers = members.map(member => ({
        id: member.userId,
        firstName: member.userFirstName,
        lastName: member.userLastName,
        email: member.userEmail,
        userName: member.userName,
        preferredRole: member.userPreferredRole,
        projectRole: member.role,
        isActive: member.isActive,
        isProjectLead: member.isProjectLead,
        joinedAt: member.joinedAt,
        progress: member.progress,
        _memberData: member
      }));
      
      return {
        success: true,
        data: transformedMembers
      };
    } catch (error) {
      devLog('Error fetching project members:', error);
      return {
        success: false,
        data: [],
        message: error.message
      };
    }
  }

  // =================================================================
  // Task Management API - Complete Integration with Swagger Endpoints
  // =================================================================
  
  /**
   * Get tasks for a specific project with optional filters
   * Endpoint: GET /api/v1/Tasks/project/{projectId}
   * @param {string} projectId - The project ID
   * @param {Object} filters - Optional filters (sprintId, status, priority, assigneeId)
   * @returns {Promise} API response with tasks array
   */
  async getProjectTasks(projectId, filters = {}) {
    devLog(`Fetching tasks for project: ${projectId}`, filters);
    
    const queryParams = new URLSearchParams();
    if (filters.sprintId) queryParams.append('sprintId', filters.sprintId);
    if (filters.status !== undefined) queryParams.append('status', filters.status);
    if (filters.priority !== undefined) queryParams.append('priority', filters.priority);
    if (filters.assigneeId) queryParams.append('assigneeId', filters.assigneeId);
    
    const queryString = queryParams.toString();
    const url = `/tasks/project/${projectId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request(url);
    
    // Map API response to frontend format
    if (response.success && response.data) {
      response.data = response.data.map(task => ({
        ...task,
        // Map API status enum to frontend format
        status: this.mapTaskStatusFromApi(task.status),
        priority: this.mapTaskPriorityFromApi(task.priority)
      }));
    }
    
    return response;
  }

  /**
   * Get tasks assigned to a specific user
   * Endpoint: GET /api/v1/Tasks/user/{userId}
   * @param {string} userId - The user ID
   * @returns {Promise} API response with tasks array
   */
  async getUserTasks(userId) {
    devLog(`Fetching tasks for user: ${userId}`);
    const response = await this.request(`/tasks/user/${userId}`);
    
    // Map API response to frontend format
    if (response.success && response.data) {
      response.data = response.data.map(task => ({
        ...task,
        status: this.mapTaskStatusFromApi(task.status),
        priority: this.mapTaskPriorityFromApi(task.priority)
      }));
    }
    
    return response;
  }

  /**
   * Get a single task by ID
   * Endpoint: GET /api/v1/Tasks/{id}
   * @param {string} taskId - The task ID
   * @returns {Promise} API response with task object
   */
  async getTaskById(taskId) {
    devLog(`Fetching task by ID: ${taskId}`);
    const response = await this.request(`/tasks/${taskId}`);
    
    // Map API response to frontend format
    if (response.success && response.data) {
      response.data = {
        ...response.data,
        status: this.mapTaskStatusFromApi(response.data.status),
        priority: this.mapTaskPriorityFromApi(response.data.priority)
      };
    }
    
    return response;
  }

  /**
   * Create a new task
   * Endpoint: POST /api/v1/Tasks
   * @param {Object} taskData - Task data object
   * @returns {Promise} API response with created task
   */
  async createTask(taskData) {
    devLog("Creating new task:", taskData);
    
    // Map frontend format to API format
    const apiTaskData = {
      ...taskData,
      status: this.mapTaskStatusToApi(taskData.status || 'todo'),
      priority: this.mapTaskPriorityToApi(taskData.priority || 'medium'),
      // Handle assignee properly - if 'unassigned' or empty, set to null
      assigneeId: (taskData.assigneeId === 'unassigned' || !taskData.assigneeId) ? null : taskData.assigneeId
    };
    
    devLog("Mapped task data for API:", apiTaskData);
    
    const response = await this.request("/tasks", {
      method: "POST",
      body: JSON.stringify(apiTaskData),
    });
    
    // Map response back to frontend format
    if (response.success && response.data) {
      response.data = {
        ...response.data,
        status: this.mapTaskStatusFromApi(response.data.status),
        priority: this.mapTaskPriorityFromApi(response.data.priority)
      };
      devLog("Mapped response data from API:", response.data);
    }
    
    return response;
  }

  /**
   * Update an existing task
   * Endpoint: PUT /api/v1/Tasks/{id}
   * @param {string} taskId - The task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise} API response with updated task
   */
  async updateTask(taskId, taskData) {
    devLog(`Updating task ${taskId}:`, taskData);
    
    // Map frontend format to API format
    const apiTaskData = {
      ...taskData,
      id: taskId,
      status: this.mapTaskStatusToApi(taskData.status),
      priority: this.mapTaskPriorityToApi(taskData.priority),
      // Handle assignee properly - if 'unassigned' or empty, set to null
      assigneeId: (taskData.assigneeId === 'unassigned' || !taskData.assigneeId) ? null : taskData.assigneeId
    };
    
    devLog("Mapped task data for API:", apiTaskData);
    
    const response = await this.request(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(apiTaskData),
    });
    
    // Map response back to frontend format
    if (response.success && response.data) {
      response.data = {
        ...response.data,
        status: this.mapTaskStatusFromApi(response.data.status),
        priority: this.mapTaskPriorityFromApi(response.data.priority)
      };
      devLog("Mapped response data from API:", response.data);
    }
    
    return response;
  }

  /**
   * Delete a task
   * Endpoint: DELETE /api/v1/Tasks/{id}
   * @param {string} taskId - The task ID
   * @returns {Promise} API response confirming deletion
   */
  async deleteTask(taskId) {
    devLog(`Deleting task: ${taskId}`);
    const response = await this.request(`/tasks/${taskId}`, {
      method: "DELETE",
    });
    
    // The API returns 200 OK for successful deletion according to Swagger
    if (response || response === null || response === undefined) {
      return { success: true, message: 'Task deleted successfully' };
    }
    
    return response;
  }

  /**
   * Assign a task to a user
   * Endpoint: PATCH /api/v1/Tasks/{id}/assign
   * @param {string} taskId - The task ID
   * @param {string|null} assigneeId - The user ID to assign to, or null to unassign
   * @returns {Promise} API response with updated task
   */
  async assignTask(taskId, assigneeId) {
    devLog(`Assigning task ${taskId} to user ${assigneeId}`);
    
    const response = await this.request(`/tasks/${taskId}/assign`, {
      method: "PATCH",
      body: JSON.stringify({
        assigneeId: assigneeId || null // Allow unassigning by passing null
      }),
    });
    
    // Map response back to frontend format
    if (response.success && response.data) {
      response.data = {
        ...response.data,
        status: this.mapTaskStatusFromApi(response.data.status),
        priority: this.mapTaskPriorityFromApi(response.data.priority)
      };
    }
    
    return response;
  }

  /**
   * Update task status
   * Endpoint: PATCH /api/v1/Tasks/{id}/status
   * @param {string} taskId - The task ID
   * @param {Object} statusData - Status update data
   * @returns {Promise} API response with updated task
   */
  async updateTaskStatus(taskId, statusData) {
    devLog(`Updating task ${taskId} status:`, statusData);
    
    // Map frontend status to API format and send just the status string
    const apiStatus = this.mapTaskStatusToApi(statusData.status);
    
    devLog(`Sending status update: ${apiStatus} for task: ${taskId}`);
    
    const response = await this.request(`/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status: apiStatus
      }),
    });
    
    // Map response back to frontend format
    if (response.success && response.data) {
      response.data = {
        ...response.data,
        status: this.mapTaskStatusFromApi(response.data.status),
        priority: this.mapTaskPriorityFromApi(response.data.priority)
      };
    }
    
    return response;
  }

  /**
   * Start working on a task (dedicated endpoint)
   * Endpoint: PATCH /api/v1/Tasks/{id}/start
   * @param {string} taskId - The task ID
   * @returns {Promise} API response with updated task
   */
  async startTask(taskId) {
    devLog(`Starting task: ${taskId}`);
    const response = await this.request(`/tasks/${taskId}/start`, {
      method: "PATCH",
    });
    
    // Map response back to frontend format
    if (response.success && response.data) {
      response.data = {
        ...response.data,
        status: this.mapTaskStatusFromApi(response.data.status),
        priority: this.mapTaskPriorityFromApi(response.data.priority)
      };
    }
    
    return response;
  }

  /**
   * Submit task for review (dedicated endpoint)
   * Endpoint: PATCH /api/v1/Tasks/{id}/submit-for-review
   * @param {string} taskId - The task ID
   * @returns {Promise} API response with updated task
   */
  async submitTaskForReview(taskId) {
    devLog(`Submitting task for review: ${taskId}`);
    const response = await this.request(`/tasks/${taskId}/submit-for-review`, {
      method: "PATCH",
    });
    
    // Map response back to frontend format
    if (response.success && response.data) {
      response.data = {
        ...response.data,
        status: this.mapTaskStatusFromApi(response.data.status),
        priority: this.mapTaskPriorityFromApi(response.data.priority)
      };
    }
    
    return response;
  }

  // =================================================================
  // Helper Methods - Legacy Support (Deprecated)
  // =================================================================
  
  // DEPRECATED: Use getProjectTasks instead
  async getTasks(params = {}) {
    devLog("WARNING: getTasks is deprecated. Use getProjectTasks instead.");
    return {
      success: true,
      data: [],
      message: "Use getProjectTasks with specific project ID instead"
    };
  }

  // DEPRECATED: Use getProjectTasksByStatus instead
  async getTasksByStatus(status, params = {}) {
    devLog("WARNING: getTasksByStatus is deprecated. Use getProjectTasksByStatus instead.");
    return this.getTasks(params);
  }

  // DEPRECATED: Use getUserTasks instead
  async getTasksByAssignee(userId, params = {}) {
    devLog("WARNING: getTasksByAssignee is deprecated. Use getUserTasks instead.");
    return this.getUserTasks(userId);
  }

  // DEPRECATED: Use getProjectTasks instead
  async getTasksByProject(projectId, params = {}) {
    devLog("WARNING: getTasksByProject is deprecated. Use getProjectTasks instead.");
    return this.getProjectTasks(projectId, params);
  }

  // DEPRECATED: Use getSprintTasks instead
  async getTasksBySprint(sprintId, params = {}) {
    devLog("WARNING: getTasksBySprint is deprecated. Use getSprintTasks instead.");
    return { success: false, message: "Use getSprintTasks with projectId parameter" };
  }

  // Not supported by API
  async bulkUpdateTasks(taskIds, updateData) {
    devLog("WARNING: Bulk update tasks endpoint not available in API");
    return { success: false, message: "Bulk update not supported by API" };
  }

  // Not supported by API
  async getTaskDependencies(taskId) {
    devLog("WARNING: Task dependencies endpoint not available in API");
    return { success: true, data: [] };
  }

  // Not supported by API
  async updateTaskDependencies(taskId, dependencies) {
    devLog("WARNING: Update task dependencies endpoint not available in API");
    return { success: false, message: "Task dependencies not supported by API" };
  }

  // =================================================================
  // Sprints API Endpoints (Based on Swagger API)
  // =================================================================
  async getSprintById(sprintId) {
    devLog(`Fetching sprint by ID: ${sprintId}`);
    return this.request(`/sprints/${sprintId}`);
  }

  async getProjectSprints(projectId) {
    devLog(`Fetching sprints for project ID: ${projectId}`);
    return this.request(`/sprints/project/${projectId}`);
  }

  async createSprint(sprintData) {
    devLog("Creating new sprint:", sprintData);
    return this.request("/sprints", {
      method: "POST",
      body: JSON.stringify(sprintData),
    });
  }

  async updateSprint(sprintId, sprintData) {
    devLog(`Updating sprint ID: ${sprintId}`, sprintData);
    return this.request(`/sprints/${sprintId}`, {
      method: "PUT",
      body: JSON.stringify(sprintData),
    });
  }

  async deleteSprint(sprintId) {
    devLog(`Deleting sprint ID: ${sprintId}`);
    return this.request(`/sprints/${sprintId}`, {
      method: "DELETE",
    });
  }

  async updateSprintStatus(sprintId, status) {
    devLog(`Updating status for sprint ID: ${sprintId}`, status);
    return this.request(`/sprints/${sprintId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        sprintId: sprintId,
        status: status
      }),
    });
  }

  // =================================================================
  // Teams API Endpoints (Swagger + BRD)
  // =================================================================
  async createTeam(projectId, teamData) {
    devLog(`Creating team for project ID: ${projectId}`, teamData);
    return this.request(`/teams/projects/${projectId}`, {
      method: "POST",
      body: JSON.stringify(teamData),
    });
  }

  async getTeamById(id) {
    devLog(`Fetching team by ID: ${id}`);
    return this.request(`/teams/${id}`);
  }

  async updateTeam(id, teamData) {
    devLog(`Updating team ID: ${id}`, teamData);
    return this.request(`/teams/${id}`, {
      method: "PUT",
      body: JSON.stringify(teamData),
    });
  }

  async inviteToTeam(teamId, inviteData) {
    devLog(`Inviting user to team ID: ${teamId}`, inviteData);
    return this.request(`/teams/${teamId}/invite`, {
      method: "POST",
      body: JSON.stringify(inviteData),
    });
  }

  async joinTeam(teamId, joinData) {
    devLog(`Joining team ID: ${teamId}`, joinData);
    return this.request(`/teams/${teamId}/join`, {
      method: "POST",
      body: JSON.stringify(joinData),
    });
  }

  async removeTeamMember(teamId, userId) {
    devLog(`Removing user ${userId} from team ID: ${teamId}`);
    return this.request(`/teams/${teamId}/members/${userId}`, {
      method: "DELETE",
    });
  }

  async updateMemberRole(teamId, userId, roleData) {
    devLog(`Updating role for user ${userId} in team ID: ${teamId}`, roleData);
    return this.request(`/teams/${teamId}/members/${userId}`, {
      method: "PUT",
      body: JSON.stringify(roleData),
    });
  }

  // =================================================================
  // Helper Methods for Status/Priority Mapping
  // =================================================================
  
  // Map frontend status to API string format
  mapTaskStatusToApi(status) {
    const statusMap = {
      'todo': 'Todo',
      'in-progress': 'InProgress',  
      'review': 'Review',
      'completed': 'Completed'
    };
    return statusMap[status] || 'Todo';
  }
  
  // Map API string to frontend status
  mapTaskStatusFromApi(status) {
    const statusMap = {
      'Todo': 'todo',
      'InProgress': 'in-progress',
      'Review': 'review', 
      'Completed': 'completed'
    };
    return statusMap[status] || 'todo';
  }
  
  // Map frontend priority to API string format
  mapTaskPriorityToApi(priority) {
    const priorityMap = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'urgent': 'Urgent'
    };
    return priorityMap[priority] || 'Medium';
  }
  
  // Map API string to frontend priority
  mapTaskPriorityFromApi(priority) {
    const priorityMap = {
      'Low': 'low',
      'Medium': 'medium',
      'High': 'high',
      'Urgent': 'urgent'
    };
    return priorityMap[priority] || 'medium';
  }

  // =================================================================
  // Task Status Management - Utility Methods
  // =================================================================
  
  // Move task to different status with validation (using general status endpoint)
  async moveTaskToStatus(taskId, newStatus, comment = null) {
    const statusData = { status: newStatus };
    if (comment) {
      statusData.comment = comment;
    }
    return this.updateTaskStatus(taskId, statusData);
  }

  // Complete task (using status endpoint)
  async completeTask(taskId, comment = null) {
    return this.moveTaskToStatus(taskId, "completed", comment);
  }

  // Move task back to in-progress from review (using status endpoint)
  async reopenTask(taskId, comment = null) {
    return this.moveTaskToStatus(taskId, "in-progress", comment);
  }

  // =================================================================
  // Enhanced Task Assignment Utilities
  // =================================================================
  
  // Unassign task (assign to null)
  async unassignTask(taskId) {
    devLog(`Unassigning task: ${taskId}`);
    return this.assignTask(taskId, null);
  }

  // Reassign task from one user to another
  async reassignTask(taskId, fromUserId, toUserId) {
    devLog(`Reassigning task ${taskId} from ${fromUserId} to ${toUserId}`);
    return this.assignTask(taskId, toUserId);
  }

  // =================================================================
  // Task Filtering and Search Utilities
  // =================================================================
  
  // Get tasks for a specific sprint (using project tasks with sprint filter)
  async getSprintTasks(sprintId, projectId) {
    if (!projectId) {
      devLog("WARNING: getSprintTasks requires projectId");
      return { success: false, message: "Project ID is required for sprint tasks" };
    }
    return this.getProjectTasks(projectId, { sprintId });
  }

  // Get current user's tasks
  async getMyTasks(params = {}) {
    devLog("Fetching current user's tasks:", params);
    
    try {
      // Get current user first
      const userResponse = await this.getCurrentUser();
      if (userResponse.success && userResponse.data?.id) {
        return this.getUserTasks(userResponse.data.id);
      }
      return { success: false, message: "Unable to get current user" };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  // Get tasks by status for a project
  async getProjectTasksByStatus(projectId, status) {
    return this.getProjectTasks(projectId, { status });
  }

  // Get tasks by priority for a project
  async getProjectTasksByPriority(projectId, priority) {
    return this.getProjectTasks(projectId, { priority });
  }

  // Get tasks assigned to a specific user in a project
  async getProjectTasksByAssignee(projectId, assigneeId) {
    return this.getProjectTasks(projectId, { assigneeId });
  }

  // =================================================================
  // Task CRUD Operations - Enhanced
  // =================================================================

  // =================================================================
  // Task Status and Priority Utilities
  // =================================================================
  
  // Get available task statuses from API
  async getTaskStatuses() {
    devLog("Fetching available task statuses");
    try {
      const response = await this.request("/tasks/statuses");
      return response;
    } catch (error) {
      // Fallback to hardcoded values if endpoint fails
      devLog("Task statuses endpoint failed, using fallback");
      return {
        success: true,
        data: [
          { value: 'todo', label: 'To Do', id: 0 },
          { value: 'in-progress', label: 'In Progress', id: 1 },
          { value: 'review', label: 'Review', id: 2 },
          { value: 'completed', label: 'Completed', id: 3 }
        ]
      };
    }
  }

  // Get available task priorities from API
  async getTaskPriorities() {
    devLog("Fetching available task priorities");
    try {
      const response = await this.request("/tasks/priorities");
      return response;
    } catch (error) {
      // Fallback to hardcoded values if endpoint fails
      devLog("Task priorities endpoint failed, using fallback");
      return {
        success: true,
        data: [
          { value: 'low', label: 'Low', id: 0 },
          { value: 'medium', label: 'Medium', id: 1 },
          { value: 'high', label: 'High', id: 2 },
          { value: 'urgent', label: 'Urgent', id: 3 }
        ]
      };
    }
  }

  // =================================================================
  // Notifications API Endpoints (Based on Swagger API)
  // =================================================================
  
  /**
   * Get user notifications with optional filters
   * Endpoint: GET /api/v1/Notifications
   * @param {Object} filters - Optional filters (isRead, type, skip, take)
   * @returns {Promise} API response with notifications array
   */
  async getNotifications(filters = {}) {
    devLog("Fetching notifications with filters:", filters);
    
    const queryParams = new URLSearchParams();
    if (filters.isRead !== undefined) queryParams.append('isRead', filters.isRead);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.skip !== undefined) queryParams.append('skip', filters.skip);
    if (filters.take !== undefined) queryParams.append('take', filters.take);
    
    const queryString = queryParams.toString();
    const url = `/notifications${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request(url);
    
    // Map API response to frontend format if needed
    if (response.success && response.data) {
      response.data = response.data.map(notification => ({
        ...notification,
        // Map API enum to frontend format if needed
        type: this.mapNotificationTypeFromApi(notification.type),
        priority: this.mapNotificationPriorityFromApi(notification.priority)
      }));
    }
    
    return response;
  }

  /**
   * Create mention notification
   * Endpoint: POST /api/v1/Notifications/mention
   * @param {Object} mentionData - Mention notification data
   * @returns {Promise} API response with created notifications
   */
  async createMentionNotification(mentionData) {
    devLog("Creating mention notification:", mentionData);
    
    const response = await this.request("/notifications/mention", {
      method: "POST",
      body: JSON.stringify(mentionData),
    });
    
    // Map response back to frontend format
    if (response.success && response.data) {
      response.data = response.data.map(notification => ({
        ...notification,
        type: this.mapNotificationTypeFromApi(notification.type),
        priority: this.mapNotificationPriorityFromApi(notification.priority)
      }));
    }
    
    return response;
  }

  /**
   * Mark notification as read
   * Endpoint: PATCH /api/v1/Notifications/{id}/read
   * @param {string} notificationId - The notification ID
   * @returns {Promise} API response confirming read status
   */
  async markNotificationAsRead(notificationId) {
    devLog(`Marking notification as read: ${notificationId}`);
    
    return await this.request(`/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  }

  // =================================================================
  // Notification Type/Priority Mapping
  // =================================================================
  
  // Map API notification type to frontend format
  mapNotificationTypeFromApi(type) {
    const typeMap = {
      'TaskAssigned': 'task_assigned',
      'TaskStatusChanged': 'task_status_changed', 
      'TaskSubmittedForReview': 'task_review',
      'TaskCompleted': 'task_completed',
      'ProjectInvitation': 'team_invite',
      'ProjectMilestone': 'project_update',
      'Mention': 'mention',
      'PeerReviewRequired': 'review_request',
      'General': 'general'
    };
    return typeMap[type] || type.toLowerCase();
  }
  
  // Map frontend notification type to API format
  mapNotificationTypeToApi(type) {
    const typeMap = {
      'task_assigned': 'TaskAssigned',
      'task_status_changed': 'TaskStatusChanged',
      'task_review': 'TaskSubmittedForReview', 
      'task_completed': 'TaskCompleted',
      'team_invite': 'ProjectInvitation',
      'project_update': 'ProjectMilestone',
      'mention': 'Mention',
      'review_request': 'PeerReviewRequired',
      'general': 'General'
    };
    return typeMap[type] || 'General';
  }
  
  // Map API notification priority to frontend format
  mapNotificationPriorityFromApi(priority) {
    const priorityMap = {
      'Low': 'low',
      'Normal': 'normal',
      'High': 'high', 
      'Urgent': 'urgent'
    };
    return priorityMap[priority] || 'normal';
  }
  
  // Map frontend notification priority to API format
  mapNotificationPriorityToApi(priority) {
    const priorityMap = {
      'low': 'Low',
      'normal': 'Normal',
      'high': 'High',
      'urgent': 'Urgent'
    };
    return priorityMap[priority] || 'Normal';
  }

  // =================================================================
  // Notification Utility Methods
  // =================================================================
  
  // Get unread notifications count
  async getUnreadNotificationsCount() {
    try {
      const response = await this.getNotifications({ isRead: false, take: 1 });
      if (response.success) {
        // If API doesn't return count directly, we can estimate or make another call
        return response.data?.length || 0;
      }
      return 0;
    } catch (err) {
      devLog("Failed to get unread notifications count:", err);
      return 0;
    }
  }
  
  // Get notifications by type
  async getNotificationsByType(type, filters = {}) {
    return this.getNotifications({ 
      ...filters, 
      type: this.mapNotificationTypeToApi(type) 
    });
  }
  
  // Get high priority notifications
  async getHighPriorityNotifications(filters = {}) {
    // Note: API doesn't seem to support priority filtering directly
    // We'll filter on frontend side after getting notifications
    const response = await this.getNotifications(filters);
    if (response.success && response.data) {
      response.data = response.data.filter(n => n.priority === 'high' || n.priority === 'urgent');
    }
    return response;
  }
}

// Export singleton instance
export const authApiService = new AuthApiService();
export default authApiService;

