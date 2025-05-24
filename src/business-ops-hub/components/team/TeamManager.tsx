import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";

type TeamMember = {
  id: string;
  email: string;
  role: "admin" | "member" | "viewer";
  invited: boolean;
};

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
];

const TeamManager: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([
    { id: "1", email: "founder@company.com", role: "admin", invited: false },
  ]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "member" });
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Invite dialog handlers
  const openInviteDialog = () => {
    setInviteForm({ email: "", role: "member" });
    setInviteDialogOpen(true);
  };
  const closeInviteDialog = () => setInviteDialogOpen(false);

  const handleInviteEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteForm(prev => ({ ...prev, email: e.target.value }));
  };
  const handleInviteRoleChange = (e: SelectChangeEvent<string>) => {
    setInviteForm(prev => ({ ...prev, role: e.target.value }));
  };

  const handleInvite = () => {
    if (!inviteForm.email.trim()) return;
    setTeam(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        email: inviteForm.email,
        role: inviteForm.role as TeamMember["role"],
        invited: true,
      },
    ]);
    // TODO: Integrate with backend invitation API
    closeInviteDialog();
  };

  // Edit dialog handlers
  const openEditDialog = (member: TeamMember) => {
    setEditingMember(member);
    setEditDialogOpen(true);
  };
  const closeEditDialog = () => {
    setEditingMember(null);
    setEditDialogOpen(false);
  };
  const handleEditRoleChange = (e: SelectChangeEvent<string>) => {
    if (editingMember) {
      setEditingMember({ ...editingMember, role: e.target.value as TeamMember["role"] });
    }
  };
  const handleEditSave = () => {
    if (editingMember) {
      setTeam(prev =>
        prev.map(m => (m.id === editingMember.id ? { ...m, role: editingMember.role } : m))
      );
      // TODO: Integrate with backend role update API
    }
    closeEditDialog();
  };

  const handleRemoveMember = (id: string) => {
    setTeam(prev => prev.filter(m => m.id !== id));
    // TODO: Integrate with backend remove API
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Team Management
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<Add />} onClick={openInviteDialog}>
          Invite Team Member
        </Button>
      </Box>
      <List dense>
        {team.map(member => (
          <ListItem
            key={member.id}
            secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => openEditDialog(member)}>
                  <Edit fontSize="small" />
                </IconButton>
                {member.role !== "admin" && (
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveMember(member.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </>
            }
          >
            <ListItemText
              primary={member.email}
              secondary={`Role: ${ROLE_OPTIONS.find(r => r.value === member.role)?.label}${member.invited ? " (Invited)" : ""}`}
            />
          </ListItem>
        ))}
      </List>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onClose={closeInviteDialog}>
        <DialogTitle>Invite Team Member</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            value={inviteForm.email}
            onChange={handleInviteEmailChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              name="role"
              value={inviteForm.role}
              label="Role"
              onChange={handleInviteRoleChange}
            >
              {ROLE_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeInviteDialog}>Cancel</Button>
          <Button onClick={handleInvite} variant="contained">
            Invite
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onClose={closeEditDialog}>
        <DialogTitle>Edit Team Member Role</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel id="edit-role-select-label">Role</InputLabel>
            <Select
              labelId="edit-role-select-label"
              value={editingMember?.role || ""}
              label="Role"
              onChange={handleEditRoleChange}
            >
              {ROLE_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TeamManager;
