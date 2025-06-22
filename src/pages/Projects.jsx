import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import {
  Search,
  Filter,
  Calendar,
  Users,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  Palette,
  Scale,
  Megaphone,
  CodeXml,
  BarChartBig,
} from "lucide-react";
import { authApiService } from "../services/authApi";
import { roleTypes } from "../data/mockData";
import { formatDate, formatProgress } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";

const difficultyColors = {
  Easy: "bg-green-500",
  Medium: "bg-yellow-500",
  Hard: "bg-red-500",
};

const statusColors = {
  recruiting: "bg-blue-500",
  "in-progress": "bg-orange-500",
  completed: "bg-green-500",
};

const getStatusString = (status) => {
  if (typeof status === "number") {
    switch (status) {
      case 0:
        return "recruiting";
      case 1:
        return "in-progress";
      case 2:
        return "completed";
      case 3:
        return "cancelled";
      case 4:
        return "draft";
      default:
        return "unknown";
    }
  }
  return status?.toLowerCase() || "unknown";
};

const getDifficultyString = (difficulty) => {
  if (typeof difficulty === "number") {
    switch (difficulty) {
      case 0:
        return "easy";
      case 1:
        return "medium";
      case 2:
        return "hard";
      default:
        return "unknown";
    }
  }
  return difficulty?.toLowerCase() || "unknown";
};

export function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [hideMyProjects, setHideMyProjects] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        SearchTerm: searchTerm,
        Status:
          selectedStatus === "all" ? "" : selectedStatus.replace("-", "_"),
        Difficulty: selectedDifficulty === "all" ? "" : selectedDifficulty,
        Role: selectedRole === "all" ? "" : selectedRole,
        Page: 1,
        PageSize: 20,
      };
      // Remove empty params
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null) {
          delete params[key];
        }
      });

      const response = await authApiService.getProjects(params);
      if (response.success) {
        setProjects(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch projects");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching projects:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedRole, selectedDifficulty, selectedStatus]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const getRoleIcon = (roleId) => {
    const roleIcons = {
      developer: CodeXml,
      designer: Palette,
      analyst: BarChartBig,
      legal: Scale,
      marketing: Megaphone,
    };
    return roleIcons[roleId] || Users;
  };

  const displayedProjects =
    hideMyProjects && user
      ? projects.filter((p) => p.createdById !== user.id)
      : projects;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Project Catalog</h1>
          <p className="text-muted-foreground">
            Find your next collaborative challenge and build something amazing
          </p>
        </div>
        <Link to="/projects/create">
          <Button>Post a Challenge</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Role Needed
              </label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roleTypes.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Difficulty
              </label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="recruiting">Recruiting</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex items-center space-x-2">
            <input
              type="checkbox"
              id="hide-my-projects"
              checked={hideMyProjects}
              onChange={(e) => setHideMyProjects(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor="hide-my-projects"
              className="text-sm font-medium text-muted-foreground"
            >
              Hide my projects
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {isLoading
            ? "Loading..."
            : `${displayedProjects.length} Projects Found`}
        </h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Star className="h-4 w-4" />
          <span>Sorted by relevance</span>
        </div>
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Fetching projects...</p>
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-red-50 dark:bg-red-950 rounded-lg">
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-200">
            Failed to load projects
          </h3>
          <p className="text-red-600 dark:text-red-300 mt-2">{error}</p>
          <Button onClick={fetchProjects} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayedProjects.map((project, index) => {
            const statusString = getStatusString(project.status);
            const difficultyString = getDifficultyString(project.difficulty);

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="card-hover h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {project.title}
                        </CardTitle>
                        <p className="text-muted-foreground text-sm mb-3">
                          {project.description}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          {project.location || "Remote"}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge
                          variant={
                            difficultyString === "easy"
                              ? "easy"
                              : difficultyString === "medium"
                              ? "medium"
                              : "destructive"
                          }
                        >
                          {difficultyString}
                        </Badge>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(project.tags || []).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Roles Needed */}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm font-medium">Roles needed:</span>
                      <div className="flex space-x-1">
                        {(project.rolesNeeded || []).map((role) => {
                          // Support both string IDs and role objects
                          const roleId =
                            typeof role === "object" ? role.id : role;
                          const roleInfo = roleTypes.find(
                            (r) => r.id === roleId || r.name === roleId
                          );
                          const IconComponent = getRoleIcon(roleInfo?.id);
                          return (
                            <div
                              key={roleId}
                              className={`w-8 h-8 rounded-full ${roleInfo?.color} flex items-center justify-center`}
                            >
                              <IconComponent className="h-4 w-4 text-white" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Progress for in-progress projects */}
                    {statusString === "in-progress" && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{formatProgress(project.progress)}%</span>
                        </div>
                        <Progress value={formatProgress(project.progress)} />
                      </div>
                    )}

                    {/* Project Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center mb-6">
                      <div>
                        <div className="flex items-center justify-center text-muted-foreground mb-1">
                          <Users className="h-4 w-4 mr-1" />
                        </div>
                        <div className="text-sm font-medium">
                          {project.currentParticipants || 0}/
                          {project.maxParticipants}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Team Size
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center text-muted-foreground mb-1">
                          <Clock className="h-4 w-4 mr-1" />
                        </div>
                        <div className="text-sm font-medium">
                          {project.durationInWeeks > 0
                            ? `${project.durationInWeeks} weeks`
                            : project.duration || "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Duration
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4 mr-1" />
                        </div>
                        <div className="text-sm font-medium">
                          {formatDate(project.deadline)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Deadline
                        </div>
                      </div>
                    </div>
                    <Link to={`/projects/${project.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
