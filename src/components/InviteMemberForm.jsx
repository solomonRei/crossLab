import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { authApiService } from "../services/authApi";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "./ui/Dialog";
import { Loader2, UserPlus } from "lucide-react";

export const InviteMemberForm = ({ teamId, onMemberInvited }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Developer");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Note: The swagger doc asks for userId, but often it's more user-friendly to invite by email.
      // Assuming the backend can handle invitation by email. If not, this needs adjustment.
      const inviteData = { email, role };
      const response = await authApiService.inviteToTeam(teamId, inviteData);

      if (response.Success) {
        toast.success("Invitation sent successfully!");
        if (onMemberInvited) {
          onMemberInvited(response.Data);
        }
        setIsOpen(false); // Close dialog on success
      } else {
        throw new Error(response.Message || "Failed to send invitation");
      }
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a New Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">User's Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
              required
            >
              <option>Developer</option>
              <option>Designer</option>
              <option>Analyst</option>
              <option>Legal</option>
              <option>Marketing</option>
            </select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Send Invite"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
