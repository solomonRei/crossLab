import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/Tabs";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/Avatar";
import { Copilot } from "../components/Copilot";
import { TaskBoard } from "../components/TaskBoard";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  MessageSquare,
  FileText,
  Video,
  Star,
  Award,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  DollarSign,
  Briefcase,
  Loader2,
} from "lucide-react";
import { authApiService } from "../services/authApi";
import { formatDate, formatProgress, getAvatarFallback } from "../lib/utils";
import { CreateTeamForm } from "../components/CreateTeamForm";
import { InviteMemberForm } from "../components/InviteMemberForm";

const getStatusString = (status) => {
  if (typeof status === "string") {
    return status.toLowerCase().replace(/_/g, "-");
  }
  if (typeof status === "number") {
    const mapping = { 0: "recruiting", 1: "in-progress", 2: "completed" };
    return mapping[status] || "recruiting";
  }
  return "recruiting";
};

export function ProjectView() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("tasks");
  const [copilotOpen, setCopilotOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const response = await authApiService.getProjectById(id);
        if (response.success) {
          setProject(response.data);
        } else {
          throw new Error(
            response.message || "Failed to fetch project details"
          );
        }
      } catch (err) {
        console.error("Full error details:", err);
        setError(err.message || "Failed to load project");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  const handleTeamCreated = (newTeam) => {
    setProject((prevProject) => ({
      ...prevProject,
      team: newTeam,
    }));
  };

  const handleMemberInvited = (newMember) => {
    setProject((prevProject) => ({
      ...prevProject,
      team: {
        ...prevProject.team,
        members: [...prevProject.team.members, newMember],
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Project not found.</p>
      </div>
    );
  }

  const tasks = project?.tasks || [];
  const sprints = project?.sprints || [];

  const teamMembers = project.team
    ? project.team.members.map((member) => ({
        ...member.user,
        id: member.user.id,
        role: member.role,
        progress: member.progress,
      }))
    : [];

  const currentSprint =
    sprints.find((s) => getStatusString(s.status) === "in-progress") || {};
  const completedSprints = sprints.filter(
    (s) => getStatusString(s.status) === "completed"
  ).length;

  return (
    <motion.div
      className="container mx-auto p-4 md:p-6 lg:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <Badge variant="secondary" className="bg-blue-500 text-white">
                {getStatusString(project.status).replace("-", " ")}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-4">{project.description}</p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-6">
              <div className="flex items-center" title="Application Deadline">
                <Calendar className="h-4 w-4 mr-1.5" />
                Due {formatDate(project.deadline)}
              </div>
              <div className="flex items-center" title="Project Duration">
                <Clock className="h-4 w-4 mr-1.5" />
                {project.durationInWeeks} weeks
              </div>
              <div className="flex items-center" title="Team Size">
                <Users className="h-4 w-4 mr-1.5" />
                {project.team?.members?.length || 0} / {project.maxParticipants}{" "}
                members
              </div>
              <div className="flex items-center" title="Project Budget">
                <DollarSign className="h-4 w-4 mr-1.5" />
                {project.budget
                  ? `$${project.budget.toLocaleString()}`
                  : "Not specified"}
              </div>
              {project.company && (
                <div className="flex items-center" title="Company">
                  <Briefcase className="h-4 w-4 mr-1.5" />
                  {project.company}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Team Chat
            </Button>
            <Button>
              <Video className="h-4 w-4 mr-2" />
              Join Demo
            </Button>
          </div>
        </div>

        {/* Sprint Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Sprint Progress
              <Badge variant="outline">
                {completedSprints}/{sprints.length} Completed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{formatProgress(project.progress)}%</span>
              </div>
              <Progress value={project.progress || 0} className="mb-6" />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {sprints.map((sprint, index) => (
                  <motion.div
                    key={sprint.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      getStatusString(sprint.status) === "completed"
                        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                        : getStatusString(sprint.status) === "in-progress"
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                        : "bg-muted"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      {getStatusString(sprint.status) === "completed" ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : getStatusString(sprint.status) === "in-progress" ? (
                        <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground mr-2" />
                      )}
                      <span className="font-medium text-sm">{sprint.name}</span>
                    </div>
                    {getStatusString(sprint.status) === "in-progress" && (
                      <Badge variant="secondary" className="text-xs">
                        Current Sprint
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-4 border rounded-lg"
                >
                  <Avatar>
                    <AvatarImage
                      src={member.avatarUrl}
                      alt={member.firstName}
                    />
                    <AvatarFallback>
                      {getAvatarFallback(
                        `${member.firstName} ${member.lastName}`
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.role}
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{formatProgress(member.progress)}%</span>
                      </div>
                      <Progress
                        value={formatProgress(member.progress)}
                        className="h-2"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="tasks" active={activeTab === "tasks"}>
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="docs" active={activeTab === "docs"}>
                  Docs
                </TabsTrigger>
                <TabsTrigger value="demo" active={activeTab === "demo"}>
                  Demo
                </TabsTrigger>
                <TabsTrigger value="review" active={activeTab === "review"}>
                  Review
                </TabsTrigger>
                <TabsTrigger value="team" active={activeTab === "team"}>
                  Team
                </TabsTrigger>
                <TabsTrigger value="details" active={activeTab === "details"}>
                  Details
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab}>
              <TabsContent value="tasks">
                <TaskBoard 
                  projectId={id} 
                  sprintId={currentSprint?.id || null}
                />
              </TabsContent>

              <TabsContent value="docs">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      Project Documentation
                    </h3>
                    <Button size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      New Doc
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        name: "Project Requirements",
                        type: "Google Doc",
                        updated: "2 hours ago",
                      },
                      {
                        name: "API Documentation",
                        type: "Notion",
                        updated: "1 day ago",
                      },
                      {
                        name: "User Research",
                        type: "Figma",
                        updated: "3 days ago",
                      },
                      {
                        name: "Technical Specs",
                        type: "GitHub",
                        updated: "1 week ago",
                      },
                    ].map((doc, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <Badge variant="outline" className="text-xs">
                            {doc.type}
                          </Badge>
                        </div>
                        <h4 className="font-medium mb-1">{doc.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Updated {doc.updated}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="demo">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Demo Preparation</h3>
                    <Button size="sm">
                      <Video className="h-4 w-4 mr-2" />
                      Record Demo
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Demo Checklist
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {[
                          { task: "Prepare demo script", completed: true },
                          { task: "Set up demo environment", completed: true },
                          {
                            task: "Create presentation slides",
                            completed: false,
                          },
                          { task: "Test demo flow", completed: false },
                          { task: "Prepare Q&A responses", completed: false },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            {item.completed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span
                              className={
                                item.completed
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }
                            >
                              {item.task}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Demo Schedule</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span>Internal Review</span>
                            <Badge variant="outline">Tomorrow 2 PM</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span>Client Presentation</span>
                            <Badge variant="outline">Friday 10 AM</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="review">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Peer Reviews</h3>
                    <Button size="sm">
                      <Star className="h-4 w-4 mr-2" />
                      Start Review
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamMembers.map((member, index) => (
                      <Card key={member.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={member.avatarUrl}
                                alt={member.firstName}
                              />
                              <AvatarFallback>
                                {getAvatarFallback(
                                  `${member.firstName} ${member.lastName}`
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {member.role}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Technical Skills</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <Star
                                    key={i}
                                    className="h-3 w-3 fill-yellow-400 text-yellow-400"
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Collaboration</span>
                              <div className="flex">
                                {[1, 2, 3, 4].map((i) => (
                                  <Star
                                    key={i}
                                    className="h-3 w-3 fill-yellow-400 text-yellow-400"
                                  />
                                ))}
                                <Star className="h-3 w-3 text-muted-foreground" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="team" className="space-y-6">
                {!project.team ? (
                  <CreateTeamForm
                    projectId={project.id}
                    onTeamCreated={handleTeamCreated}
                  />
                ) : (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>{project.team.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Manage your team members and roles.
                        </p>
                      </div>
                      <InviteMemberForm
                        teamId={project.team.id}
                        onMemberInvited={handleMemberInvited}
                      />
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {teamMembers.map((member, index) => (
                          <motion.div
                            key={member.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-3 p-4 border rounded-lg"
                          >
                            <Avatar>
                              <AvatarImage
                                src={member.avatarUrl}
                                alt={member.firstName}
                              />
                              <AvatarFallback>
                                {getAvatarFallback(
                                  `${member.firstName} ${member.lastName}`
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {member.role}
                              </p>
                              <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Progress</span>
                                  <span>
                                    {formatProgress(member.progress)}%
                                  </span>
                                </div>
                                <Progress
                                  value={formatProgress(member.progress)}
                                  className="h-2"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Requirements</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {project.requirements ||
                          "No specific requirements listed."}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {(project.tags || []).map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {teamMembers.map((member, index) => (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-3 p-4 border rounded-lg"
                        >
                          <Avatar>
                            <AvatarImage
                              src={member.avatarUrl}
                              alt={member.firstName}
                            />
                            <AvatarFallback>
                              {getAvatarFallback(
                                `${member.firstName} ${member.lastName}`
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.role}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* AI Copilot */}
        <Copilot
          isOpen={copilotOpen}
          onToggle={() => setCopilotOpen(!copilotOpen)}
        />
      </div>
    </motion.div>
  );
}
