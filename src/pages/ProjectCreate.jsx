import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Textarea } from "../components/ui/Textarea";
import { MultiSelect } from "../components/ui/MultiSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import { authApiService } from "../services/authApi";
import { PlusCircle, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../lib/utils";

const popularTags = [
  { value: "javascript", label: "JavaScript" },
  { value: "react", label: "React" },
  { value: "python", label: "Python" },
  { value: "ui-ux", label: "UI/UX" },
  { value: "node-js", label: "Node.js" },
  { value: "data-science", label: "Data Science" },
  { value: "mobile-app", label: "Mobile App" },
];

const availableRoles = [
  { value: "Developer", label: "Developer" },
  { value: "Designer", label: "Designer" },
  { value: "Analyst", label: "Analyst" },
  { value: "Legal", label: "Legal" },
  { value: "Marketing", label: "Marketing" },
];

export function ProjectCreate() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [deadline, setDeadline] = useState();
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    company: "",
    budget: "",
    requirements: "",
    maxParticipants: 5,
    difficulty: "Easy",
    durationInWeeks: 4,
    isPublic: true,
  });

  const [rewards, setRewards] = useState({
    xp: 0,
    certificates: false,
    recommendations: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRewardsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRewards((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const projectData = {
      ...formData,
      tags: selectedTags.map((tag) => tag.label),
      rolesNeeded: selectedRoles.map((role) => role.value),
      maxParticipants: parseInt(formData.maxParticipants, 10),
      durationInWeeks: parseInt(formData.durationInWeeks, 10),
      budget: parseFloat(formData.budget) || 0,
      deadline: deadline ? deadline.toISOString() : undefined,
      rewards,
    };

    try {
      const response = await authApiService.createProject(projectData);
      if (response.success && response.data?.id) {
        toast.success("Project created successfully!");
        navigate(`/projects/${response.data.id}`);
      } else {
        throw new Error(response.message || "Failed to create project");
      }
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred.");
      console.error("Error creating project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create a New Project</h1>
            <p className="text-muted-foreground">
              Fill out the details to get your project started.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., AI-Powered Personal Finance App"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    placeholder="A brief, one-sentence summary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your project in detail..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  placeholder="List any specific skills, tools, or technologies required."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company">
                    Company / Organization (Optional)
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g., Acme Corporation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (USD, Optional)</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="e.g., 5000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <MultiSelect
                    options={popularTags}
                    selected={selectedTags}
                    onChange={setSelectedTags}
                    placeholder="Select tags..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rolesNeeded">Roles Needed</Label>
                  <MultiSelect
                    options={availableRoles}
                    selected={selectedRoles}
                    onChange={setSelectedRoles}
                    placeholder="Select roles..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Team Size</Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      handleInputChange({
                        target: { name: "difficulty", value },
                      })
                    }
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationInWeeks">Duration (in weeks)</Label>
                  <Input
                    id="durationInWeeks"
                    name="durationInWeeks"
                    type="number"
                    value={formData.durationInWeeks}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Rewards Section */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium">Rewards & Recognition</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="xp">XP Points</Label>
                    <Input
                      id="xp"
                      name="xp"
                      type="number"
                      value={rewards.xp}
                      onChange={handleRewardsChange}
                      placeholder="e.g., 100"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="certificates"
                      name="certificates"
                      checked={rewards.certificates}
                      onChange={handleRewardsChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="certificates">Offer Certificate</Label>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="recommendations"
                      name="recommendations"
                      checked={rewards.recommendations}
                      onChange={handleRewardsChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="recommendations">
                      Offer Recommendation
                    </Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="mb-2 block">
                    Application Deadline
                  </Label>
                  <DatePicker
                    selected={deadline}
                    onChange={(date) => setDeadline(date)}
                    className="w-full"
                    customInput={
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deadline ? (
                          format(deadline, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    }
                  />
                </div>
                <div className="flex items-center space-x-2 self-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isPublic">Make this project public</Label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                  )}
                  Create Project
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
