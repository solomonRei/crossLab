import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { authApiService } from "../services/authApi";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/Card";
import { Loader2 } from "lucide-react";

export const CreateTeamForm = ({ projectId, onTeamCreated }) => {
  const [teamName, setTeamName] = useState("");
  const [maxMembers, setMaxMembers] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const teamData = {
        name: teamName,
        maxMembers: parseInt(maxMembers, 10),
      };
      const response = await authApiService.createTeam(projectId, teamData);

      if (response.Success) {
        toast.success("Team created successfully!");
        if (onTeamCreated) {
          onTeamCreated(response.Data);
        }
      } else {
        throw new Error(response.Message || "Failed to create team");
      }
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Team</CardTitle>
        <CardDescription>
          This project doesn't have a team yet. Create one to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g., The A-Team"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxMembers">Max Members</Label>
            <Input
              id="maxMembers"
              type="number"
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
              min="2"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Create Team"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
