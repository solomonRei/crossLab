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

      // Add global debug functions
      window.__DEBUG_DEMO_ROOM__ = async (sessionId) => {
        console.log("=== GLOBAL DEBUG: Demo Room Operations ===");
        console.log("Session ID:", sessionId);

        if (!sessionId) {
          console.error(
            'Please provide a sessionId: __DEBUG_DEMO_ROOM__("your-session-id")'
          );
          return;
        }

        try {
          // Test room status
          console.log("1. Testing room status...");
          const status = await this.getDemoRoomStatus(sessionId);
          console.log("Room status:", status);

          // Test room creation
          console.log("2. Testing room creation...");
          const createResult = await this.createDemoRoom(sessionId, {
            recordingQuality: "HD",
          });
          console.log("Room creation:", createResult);

          // Test room status again
          console.log("3. Testing room status after creation...");
          const status2 = await this.getDemoRoomStatus(sessionId);
          console.log("Room status after creation:", status2);

          return { status, createResult, status2 };
        } catch (error) {
          console.error("Debug error:", error);
          return { error: error.message };
        }
      };

      console.log("Debug functions available:");
      console.log("- __CROSSLAB_AUTH_SERVICE__: Full API service");
      console.log("- __DEBUG_DEMO_ROOM__(sessionId): Test room operations");
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

  async updateUserProfile(profileData) {
    devLog("Updating user profile:", profileData);
    return this.request("/auth/me", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
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
    if (filters.isActive !== undefined)
      queryParams.append("isActive", filters.isActive);
    if (filters.isProjectLead !== undefined)
      queryParams.append("isProjectLead", filters.isProjectLead);

    const queryString = queryParams.toString();
    const url = `/projects/${projectId}/members${
      queryString ? `?${queryString}` : ""
    }`;

    try {
      const response = await this.request(url);

      const members = Array.isArray(response) ? response : response.data || [];

      const transformedMembers = members.map((member) => ({
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
        invitedBy: member.invitedBy,
        invitedByName: member.invitedByName,
        invitedAt: member.invitedAt,
        acceptedAt: member.acceptedAt,
        _memberData: member,
      }));

      return {
        success: true,
        data: transformedMembers,
      };
    } catch (error) {
      devLog("Error fetching project members:", error);
      return {
        success: false,
        data: [],
        message: error.message,
      };
    }
  }

  // Invite user to project (for creators/admins)
  async inviteToProject(projectId, inviteData) {
    devLog(`Inviting user to project: ${projectId}`, inviteData);
    try {
      const response = await this.request(`/projects/${projectId}/invite`, {
        method: "POST",
        body: JSON.stringify(inviteData),
      });
      return response;
    } catch (error) {
      devLog("Error inviting user to project:", error);
      return { success: false, message: error.message };
    }
  }

  // Request to join project (for regular users)
  async requestToJoinProject(projectId, requestData) {
    devLog(`Requesting to join project: ${projectId}`, requestData);
    try {
      const response = await this.request(
        `/projects/${projectId}/members/join`,
        {
          method: "POST",
          body: JSON.stringify(requestData),
        }
      );
      return response;
    } catch (error) {
      devLog("Error requesting to join project:", error);
      return { success: false, message: error.message };
    }
  }

  // Get pending join requests for a project (for creators/admins)
  async getProjectJoinRequests(projectId) {
    devLog(`Fetching join requests for project: ${projectId}`);
    try {
      const response = await this.request(
        `/projects/${projectId}/join-requests`
      );
      return response;
    } catch (error) {
      devLog("Error fetching join requests:", error);
      return { success: false, message: error.message };
    }
  }

  // Approve join request (for creators/admins)
  async approveJoinRequest(projectId, requestId, approvalData = {}) {
    devLog(
      `Approving join request: ${requestId} for project: ${projectId}`,
      approvalData
    );
    try {
      const response = await this.request(
        `/projects/${projectId}/join-requests/${requestId}/approve`,
        {
          method: "POST",
          body: JSON.stringify(approvalData),
        }
      );
      return response;
    } catch (error) {
      devLog("Error approving join request:", error);
      return { success: false, message: error.message };
    }
  }

  // Reject join request (for creators/admins)
  async rejectJoinRequest(projectId, requestId, rejectionData = {}) {
    devLog(
      `Rejecting join request: ${requestId} for project: ${projectId}`,
      rejectionData
    );
    try {
      const response = await this.request(
        `/projects/${projectId}/join-requests/${requestId}/reject`,
        {
          method: "POST",
          body: JSON.stringify(rejectionData),
        }
      );
      return response;
    } catch (error) {
      devLog("Error rejecting join request:", error);
      return { success: false, message: error.message };
    }
  }

  // Remove member from project (for creators/admins)
  async removeProjectMember(projectId, userId) {
    devLog(`Removing member ${userId} from project: ${projectId}`);
    try {
      const response = await this.request(
        `/projects/${projectId}/members/${userId}`,
        {
          method: "DELETE",
        }
      );
      return response;
    } catch (error) {
      devLog("Error removing project member:", error);
      return { success: false, message: error.message };
    }
  }

  // Update member role in project (for creators/admins)
  async updateProjectMemberRole(projectId, userId, roleData) {
    devLog(
      `Updating role for member ${userId} in project: ${projectId}`,
      roleData
    );
    try {
      const response = await this.request(
        `/projects/${projectId}/members/${userId}`,
        {
          method: "PUT",
          body: JSON.stringify(roleData),
        }
      );
      return response;
    } catch (error) {
      devLog("Error updating member role:", error);
      return { success: false, message: error.message };
    }
  }

  // Search users for invitation (with filters)
  async searchUsers(query, filters = {}) {
    devLog(`Searching users with query: ${query}`, filters);
    try {
      const queryParams = new URLSearchParams();
      if (query) queryParams.append("search", query);
      if (filters.role) queryParams.append("role", filters.role);
      if (filters.excludeProjectId)
        queryParams.append("excludeProjectId", filters.excludeProjectId);

      const queryString = queryParams.toString();
      const url = `/users/search${queryString ? `?${queryString}` : ""}`;

      const response = await this.request(url);
      return response;
    } catch (error) {
      devLog("Error searching users:", error);
      return { success: false, message: error.message };
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
    if (filters.sprintId) queryParams.append("sprintId", filters.sprintId);
    if (filters.status !== undefined)
      queryParams.append("status", filters.status);
    if (filters.priority !== undefined)
      queryParams.append("priority", filters.priority);
    if (filters.assigneeId)
      queryParams.append("assigneeId", filters.assigneeId);

    const queryString = queryParams.toString();
    const url = `/tasks/project/${projectId}${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await this.request(url);

    // Map API response to frontend format
    if (response.success && response.data) {
      response.data = response.data.map((task) => ({
        ...task,
        // Map API status enum to frontend format
        status: this.mapTaskStatusFromApi(task.status),
        priority: this.mapTaskPriorityFromApi(task.priority),
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
      response.data = response.data.map((task) => ({
        ...task,
        status: this.mapTaskStatusFromApi(task.status),
        priority: this.mapTaskPriorityFromApi(task.priority),
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
        priority: this.mapTaskPriorityFromApi(response.data.priority),
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
      status: this.mapTaskStatusToApi(taskData.status || "todo"),
      priority: this.mapTaskPriorityToApi(taskData.priority || "medium"),
      // Handle assignee properly - if 'unassigned' or empty, set to null
      assigneeId:
        taskData.assigneeId === "unassigned" || !taskData.assigneeId
          ? null
          : taskData.assigneeId,
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
        priority: this.mapTaskPriorityFromApi(response.data.priority),
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
      assigneeId:
        taskData.assigneeId === "unassigned" || !taskData.assigneeId
          ? null
          : taskData.assigneeId,
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
        priority: this.mapTaskPriorityFromApi(response.data.priority),
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
      return { success: true, message: "Task deleted successfully" };
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
        assigneeId: assigneeId || null, // Allow unassigning by passing null
      }),
    });

    // Map response back to frontend format
    if (response.success && response.data) {
      response.data = {
        ...response.data,
        status: this.mapTaskStatusFromApi(response.data.status),
        priority: this.mapTaskPriorityFromApi(response.data.priority),
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
        status: apiStatus,
      }),
    });

    // Map response back to frontend format
    if (response.success && response.data) {
      response.data = {
        ...response.data,
        status: this.mapTaskStatusFromApi(response.data.status),
        priority: this.mapTaskPriorityFromApi(response.data.priority),
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
        priority: this.mapTaskPriorityFromApi(response.data.priority),
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
        priority: this.mapTaskPriorityFromApi(response.data.priority),
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
      message: "Use getProjectTasks with specific project ID instead",
    };
  }

  // DEPRECATED: Use getProjectTasksByStatus instead
  async getTasksByStatus(status, params = {}) {
    devLog(
      "WARNING: getTasksByStatus is deprecated. Use getProjectTasksByStatus instead."
    );
    return this.getTasks(params);
  }

  // DEPRECATED: Use getUserTasks instead
  async getTasksByAssignee(userId, params = {}) {
    devLog(
      "WARNING: getTasksByAssignee is deprecated. Use getUserTasks instead."
    );
    return this.getUserTasks(userId);
  }

  // DEPRECATED: Use getProjectTasks instead
  async getTasksByProject(projectId, params = {}) {
    devLog(
      "WARNING: getTasksByProject is deprecated. Use getProjectTasks instead."
    );
    return this.getProjectTasks(projectId, params);
  }

  // DEPRECATED: Use getSprintTasks instead
  async getTasksBySprint(sprintId, params = {}) {
    devLog(
      "WARNING: getTasksBySprint is deprecated. Use getSprintTasks instead."
    );
    return {
      success: false,
      message: "Use getSprintTasks with projectId parameter",
    };
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
    return {
      success: false,
      message: "Task dependencies not supported by API",
    };
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
        status: status,
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
      todo: "Todo",
      "in-progress": "InProgress",
      review: "Review",
      completed: "Completed",
    };
    return statusMap[status] || "Todo";
  }

  // Map API string to frontend status
  mapTaskStatusFromApi(status) {
    const statusMap = {
      Todo: "todo",
      InProgress: "in-progress",
      Review: "review",
      Completed: "completed",
    };
    return statusMap[status] || "todo";
  }

  // Map frontend priority to API string format
  mapTaskPriorityToApi(priority) {
    const priorityMap = {
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "Urgent",
    };
    return priorityMap[priority] || "Medium";
  }

  // Map API string to frontend priority
  mapTaskPriorityFromApi(priority) {
    const priorityMap = {
      Low: "low",
      Medium: "medium",
      High: "high",
      Urgent: "urgent",
    };
    return priorityMap[priority] || "medium";
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
      return {
        success: false,
        message: "Project ID is required for sprint tasks",
      };
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
          { value: "todo", label: "To Do", id: 0 },
          { value: "in-progress", label: "In Progress", id: 1 },
          { value: "review", label: "Review", id: 2 },
          { value: "completed", label: "Completed", id: 3 },
        ],
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
          { value: "low", label: "Low", id: 0 },
          { value: "medium", label: "Medium", id: 1 },
          { value: "high", label: "High", id: 2 },
          { value: "urgent", label: "Urgent", id: 3 },
        ],
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
    if (filters.isRead !== undefined)
      queryParams.append("isRead", filters.isRead);
    if (filters.type) queryParams.append("type", filters.type);
    if (filters.skip !== undefined) queryParams.append("skip", filters.skip);
    if (filters.take !== undefined) queryParams.append("take", filters.take);

    const queryString = queryParams.toString();
    const url = `/notifications${queryString ? `?${queryString}` : ""}`;

    const response = await this.request(url);

    // Map API response to frontend format if needed
    if (response.success && response.data) {
      response.data = response.data.map((notification) => ({
        ...notification,
        // Map API enum to frontend format if needed
        type: this.mapNotificationTypeFromApi(notification.type),
        priority: this.mapNotificationPriorityFromApi(notification.priority),
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
      response.data = response.data.map((notification) => ({
        ...notification,
        type: this.mapNotificationTypeFromApi(notification.type),
        priority: this.mapNotificationPriorityFromApi(notification.priority),
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
      TaskAssigned: "task_assigned",
      TaskStatusChanged: "task_status_changed",
      TaskSubmittedForReview: "task_review",
      TaskCompleted: "task_completed",
      ProjectInvitation: "team_invite",
      ProjectMilestone: "project_update",
      Mention: "mention",
      PeerReviewRequired: "review_request",
      General: "general",
    };
    return typeMap[type] || type.toLowerCase();
  }

  // Map frontend notification type to API format
  mapNotificationTypeToApi(type) {
    const typeMap = {
      task_assigned: "TaskAssigned",
      task_status_changed: "TaskStatusChanged",
      task_review: "TaskSubmittedForReview",
      task_completed: "TaskCompleted",
      team_invite: "ProjectInvitation",
      project_update: "ProjectMilestone",
      mention: "Mention",
      review_request: "PeerReviewRequired",
      general: "General",
    };
    return typeMap[type] || "General";
  }

  // Map API notification priority to frontend format
  mapNotificationPriorityFromApi(priority) {
    const priorityMap = {
      Low: "low",
      Normal: "normal",
      High: "high",
      Urgent: "urgent",
    };
    return priorityMap[priority] || "normal";
  }

  // Map frontend notification priority to API format
  mapNotificationPriorityToApi(priority) {
    const priorityMap = {
      low: "Low",
      normal: "Normal",
      high: "High",
      urgent: "Urgent",
    };
    return priorityMap[priority] || "Normal";
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
      type: this.mapNotificationTypeToApi(type),
    });
  }

  // Get high priority notifications
  async getHighPriorityNotifications(filters = {}) {
    // Note: API doesn't seem to support priority filtering directly
    // We'll filter on frontend side after getting notifications
    const response = await this.getNotifications(filters);
    if (response.success && response.data) {
      response.data = response.data.filter(
        (n) => n.priority === "high" || n.priority === "urgent"
      );
    }
    return response;
  }

  // ===== DEMO SESSIONS API =====

  // Create demo session
  async createDemoSession(sessionData) {
    try {
      const response = await this.request("/Demo/sessions", {
        method: "POST",
        body: JSON.stringify(sessionData),
      });
      return response;
    } catch (error) {
      console.error("Create demo session error:", error);
      return { success: false, message: error.message };
    }
  }

  // Get demo sessions
  async getDemoSessions(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);

      const url = `/Demo/sessions${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
      const response = await this.request(url);
      return response;
    } catch (error) {
      console.error("Get demo sessions error:", error);
      return { success: false, message: error.message };
    }
  }

  // Get demo session by ID
  async getDemoSession(sessionId) {
    try {
      const response = await this.request(`/Demo/sessions/${sessionId}`);
      return response;
    } catch (error) {
      console.error("Get demo session error:", error);
      return { success: false, message: error.message };
    }
  }

  // Start demo session
  async startDemoSession(sessionId) {
    try {
      const response = await this.request(`/Demo/sessions/${sessionId}/start`, {
        method: "POST",
      });
      return response;
    } catch (error) {
      console.error("Start demo session error:", error);
      return { success: false, message: error.message };
    }
  }

  // End demo session
  async endDemoSession(sessionId) {
    try {
      const response = await this.request(`/Demo/sessions/${sessionId}/end`, {
        method: "POST",
      });
      return response;
    } catch (error) {
      console.error("End demo session error:", error);
      return { success: false, message: error.message };
    }
  }

  // Invite participants to demo session
  async inviteDemoParticipants(sessionId, inviteData) {
    try {
      const response = await this.request(
        `/Demo/sessions/${sessionId}/invite`,
        {
          method: "POST",
          body: JSON.stringify(inviteData),
        }
      );
      return response;
    } catch (error) {
      console.error("Invite demo participants error:", error);
      return { success: false, message: error.message };
    }
  }

  // Start recording
  async startDemoRecording(sessionId, recordingData) {
    try {
      const response = await this.request(
        `/Demo/sessions/${sessionId}/recording/start`,
        {
          method: "POST",
          body: JSON.stringify(recordingData),
        }
      );
      return response;
    } catch (error) {
      console.error("Start demo recording error:", error);
      return { success: false, message: error.message };
    }
  }

  // Stop recording
  async stopDemoRecording(sessionId) {
    try {
      const response = await this.request(
        `/Demo/sessions/${sessionId}/recording/stop`,
        {
          method: "POST",
        }
      );
      return response;
    } catch (error) {
      console.error("Stop demo recording error:", error);
      return { success: false, message: error.message };
    }
  }

  // Get demo recordings
  async getDemoRecordings(sessionId) {
    try {
      const response = await this.request(
        `/Demo/sessions/${sessionId}/recordings`
      );
      return response;
    } catch (error) {
      console.error("Get demo recordings error:", error);
      return { success: false, message: error.message };
    }
  }

  // Delete demo recording
  async deleteDemoRecording(recordingId) {
    devLog("Deleting recording:", recordingId);
    return await this.request(`/recordings/${recordingId}`, {
      method: "DELETE",
    });
  }

  // Upload demo recording
  async uploadDemoRecording(sessionId, formData) {
    try {
      console.log("API: Starting upload for sessionId:", sessionId);
      console.log("API: FormData type:", typeof formData);
      console.log("API: FormData constructor:", formData.constructor.name);

      // Log FormData contents
      if (formData instanceof FormData) {
        console.log("API: FormData entries:");
        for (let [key, value] of formData.entries()) {
          if (key === "recording") {
            console.log(
              `API: ${key}: File (${value.size} bytes, ${value.type}, ${value.name})`
            );
          } else {
            console.log(`API: ${key}: ${value}`);
          }
        }
      }

      const response = await this.request(
        `/Demo/sessions/${sessionId}/recordings/upload`,
        {
          method: "POST",
          body: formData,
          headers: {}, // Remove Content-Type to let browser set it for FormData
        }
      );

      console.log("API: Upload response received:", response);
      return response;
    } catch (error) {
      console.error("Upload demo recording error:", error);
      console.error("Upload error details:", {
        sessionId,
        errorMessage: error.message,
        errorStack: error.stack,
      });
      return { success: false, message: error.message };
    }
  }

  // Join demo session
  async joinDemoSession(sessionId) {
    try {
      const response = await this.request(`/Demo/sessions/${sessionId}/join`, {
        method: "POST",
      });
      return response;
    } catch (error) {
      console.error("Join demo session error:", error);
      return { success: false, message: error.message };
    }
  }

  // Leave demo session
  async leaveDemoSession(sessionId) {
    try {
      const response = await this.request(`/Demo/sessions/${sessionId}/leave`, {
        method: "POST",
      });
      return response;
    } catch (error) {
      console.error("Leave demo session error:", error);
      return { success: false, message: error.message };
    }
  }

  // Get demo participants
  async getDemoParticipants(sessionId) {
    try {
      const response = await this.request(
        `/Demo/sessions/${sessionId}/participants`
      );
      return response;
    } catch (error) {
      console.error("Get demo participants error:", error);
      return { success: false, message: error.message };
    }
  }

  // Send demo signal (for WebRTC signaling)
  async sendDemoSignal(sessionId, signalData) {
    try {
      const response = await this.request(
        `/Demo/sessions/${sessionId}/signal`,
        {
          method: "POST",
          body: JSON.stringify(signalData),
        }
      );
      return response;
    } catch (error) {
      console.error("Send demo signal error:", error);
      return { success: false, message: error.message };
    }
  }

  // Get demo signals (for WebRTC signaling polling)
  async getDemoSignals(sessionId, since = null) {
    try {
      const queryParams = new URLSearchParams();
      if (since) queryParams.append("since", since);

      const url = `/Demo/sessions/${sessionId}/signals${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
      const response = await this.request(url);
      return response;
    } catch (error) {
      console.error("Get demo signals error:", error);
      return { success: false, message: error.message };
    }
  }

  // Create demo room
  async createDemoRoom(sessionId, roomData = {}) {
    try {
      console.log("API: Creating demo room for sessionId:", sessionId);
      const response = await this.request(
        `/Demo/sessions/${sessionId}/create-room`,
        {
          method: "POST",
          body: JSON.stringify(roomData),
        }
      );
      console.log("API: Create room response:", response);
      return response;
    } catch (error) {
      console.error("Create demo room error:", error);
      return { success: false, message: error.message };
    }
  }

  // Get demo room status
  async getDemoRoomStatus(sessionId) {
    try {
      console.log("API: Checking room status for sessionId:", sessionId);
      const response = await this.request(
        `/Demo/sessions/${sessionId}/room-status`
      );
      console.log("API: Room status response:", response);
      return response;
    } catch (error) {
      console.error("Get demo room status error:", error);
      return { success: false, message: error.message };
    }
  }

  // Get demo session by public link/invite code
  async getDemoSessionByInvite(inviteCode) {
    try {
      console.log("API: Getting demo session by invite code:", inviteCode);
      const response = await this.request(
        `/Demo/sessions/invite/${inviteCode}`
      );
      console.log("API: Session by invite response:", response);
      return response;
    } catch (error) {
      console.error("Get demo session by invite error:", error);
      return { success: false, message: error.message };
    }
  }

  // Generate invite link for demo session
  async generateDemoInvite(sessionId, inviteData = {}) {
    try {
      console.log("API: Generating invite for sessionId:", sessionId);
      const response = await this.request(
        `/Demo/sessions/${sessionId}/invite`,
        {
          method: "POST",
          body: JSON.stringify({
            expiresAt: inviteData.expiresAt,
            maxUses: inviteData.maxUses || 50,
            role: inviteData.role || "participant",
            ...inviteData,
          }),
        }
      );
      console.log("API: Generate invite response:", response);
      return response;
    } catch (error) {
      console.error("Generate demo invite error:", error);
      return { success: false, message: error.message };
    }
  }

  // Get all invites for a session
  async getDemoInvites(sessionId) {
    try {
      console.log("API: Getting invites for sessionId:", sessionId);
      const response = await this.request(
        `/Demo/sessions/${sessionId}/invites`
      );
      return response;
    } catch (error) {
      console.error("Get demo invites error:", error);
      return { success: false, message: error.message };
    }
  }

  // Revoke/delete invite
  async revokeDemoInvite(sessionId, inviteId) {
    try {
      console.log("API: Revoking invite:", inviteId, "for session:", sessionId);
      const response = await this.request(
        `/Demo/sessions/${sessionId}/invites/${inviteId}`,
        {
          method: "DELETE",
        }
      );
      return response;
    } catch (error) {
      console.error("Revoke demo invite error:", error);
      return { success: false, message: error.message };
    }
  }

  // =================================================================
  // User Invitations API Endpoints
  // =================================================================

  /**
   * Get all pending invitations for current user
   * Endpoint: GET /api/v1/users/invitations
   * @returns {Promise} API response with invitations array
   */
  async getUserInvitations() {
    try {
      console.log("API: Getting user invitations");
      const response = await this.request("/users/invitations");
      console.log("API: User invitations response:", response);
      return response;
    } catch (error) {
      console.error("Get user invitations error:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Accept project invitation
   * Endpoint: POST /api/v1/users/invitations/{invitationId}/accept
   * @param {string} invitationId - The invitation ID
   * @returns {Promise} API response confirming acceptance
   */
  async acceptProjectInvitation(invitationId) {
    try {
      console.log("API: Accepting project invitation:", invitationId);
      const response = await this.request(
        `/users/invitations/${invitationId}/accept`,
        {
          method: "POST",
        }
      );
      console.log("API: Accept invitation response:", response);
      return response;
    } catch (error) {
      console.error("Accept project invitation error:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Decline project invitation
   * Endpoint: POST /api/v1/users/invitations/{invitationId}/decline
   * @param {string} invitationId - The invitation ID
   * @returns {Promise} API response confirming decline
   */
  async declineProjectInvitation(invitationId) {
    try {
      console.log("API: Declining project invitation:", invitationId);
      const response = await this.request(
        `/users/invitations/${invitationId}/decline`,
        {
          method: "POST",
        }
      );
      console.log("API: Decline invitation response:", response);
      return response;
    } catch (error) {
      console.error("Decline project invitation error:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Accept team invitation
   * Endpoint: POST /api/v1/users/team-invitations/{invitationId}/accept
   * @param {string} invitationId - The team invitation ID
   * @returns {Promise} API response confirming acceptance
   */
  async acceptTeamInvitation(invitationId) {
    try {
      console.log("API: Accepting team invitation:", invitationId);
      const response = await this.request(
        `/users/team-invitations/${invitationId}/accept`,
        {
          method: "POST",
        }
      );
      console.log("API: Accept team invitation response:", response);
      return response;
    } catch (error) {
      console.error("Accept team invitation error:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Decline team invitation
   * Endpoint: POST /api/v1/users/team-invitations/{invitationId}/decline
   * @param {string} invitationId - The team invitation ID
   * @returns {Promise} API response confirming decline
   */
  async declineTeamInvitation(invitationId) {
    try {
      console.log("API: Declining team invitation:", invitationId);
      const response = await this.request(
        `/users/team-invitations/${invitationId}/decline`,
        {
          method: "POST",
        }
      );
      console.log("API: Decline team invitation response:", response);
      return response;
    } catch (error) {
      console.error("Decline team invitation error:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get notifications with invitation filtering
   * Endpoint: GET /api/v1/notifications?isRead=false&type=ProjectInvitation
   * @param {Object} filters - Notification filters
   * @returns {Promise} API response with notifications
   */
  async getInvitationNotifications(filters = {}) {
    try {
      console.log(
        "API: Getting invitation notifications with filters:",
        filters
      );

      const queryParams = new URLSearchParams();
      if (filters.isRead !== undefined)
        queryParams.append("isRead", filters.isRead);
      if (filters.type) queryParams.append("type", filters.type);

      const url = `/notifications${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
      const response = await this.request(url);

      console.log("API: Invitation notifications response:", response);
      return response;
    } catch (error) {
      console.error("Get invitation notifications error:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Mark notification as read
   * Endpoint: POST /api/v1/notifications/{notificationId}/mark-as-read
   * @param {string} notificationId - The notification ID
   * @returns {Promise} API response confirming read status
   */
  async markNotificationAsRead(notificationId) {
    try {
      console.log("API: Marking notification as read:", notificationId);
      const response = await this.request(
        `/notifications/${notificationId}/mark-as-read`,
        {
          method: "POST",
        }
      );
      console.log("API: Mark notification as read response:", response);
      return response;
    } catch (error) {
      console.error("Mark notification as read error:", error);
      return { success: false, message: error.message };
    }
  }

  // =================================================================
  // User Invitations Utility Methods
  // =================================================================

  /**
   * Get pending project invitations only
   * @returns {Promise} API response with project invitations
   */
  async getPendingProjectInvitations() {
    try {
      const response = await this.getUserInvitations();
      if (response.success && response.data) {
        const projectInvitations = response.data.filter(
          (invitation) =>
            invitation.relatedEntityType === "Project" &&
            invitation.isActive === false
        );
        return {
          success: true,
          data: projectInvitations,
          message: `Found ${projectInvitations.length} pending project invitations`,
        };
      }
      return response;
    } catch (error) {
      console.error("Get pending project invitations error:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get pending team invitations only
   * @returns {Promise} API response with team invitations
   */
  async getPendingTeamInvitations() {
    try {
      const response = await this.getUserInvitations();
      if (response.success && response.data) {
        const teamInvitations = response.data.filter(
          (invitation) =>
            invitation.relatedEntityType === "Team" &&
            invitation.isActive === false
        );
        return {
          success: true,
          data: teamInvitations,
          message: `Found ${teamInvitations.length} pending team invitations`,
        };
      }
      return response;
    } catch (error) {
      console.error("Get pending team invitations error:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get count of pending invitations
   * @returns {Promise} Object with counts
   */
  async getInvitationsCount() {
    try {
      const response = await this.getUserInvitations();
      if (response.success && response.data) {
        const projectCount = response.data.filter(
          (inv) => inv.relatedEntityType === "Project" && inv.isActive === false
        ).length;
        const teamCount = response.data.filter(
          (inv) => inv.relatedEntityType === "Team" && inv.isActive === false
        ).length;

        return {
          success: true,
          data: {
            total: projectCount + teamCount,
            projects: projectCount,
            teams: teamCount,
          },
        };
      }
      return { success: true, data: { total: 0, projects: 0, teams: 0 } };
    } catch (error) {
      console.error("Get invitations count error:", error);
      return { success: false, data: { total: 0, projects: 0, teams: 0 } };
    }
  }
}

// Export singleton instance
export const authApiService = new AuthApiService();
export default authApiService;
