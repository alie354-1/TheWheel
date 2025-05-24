import React, { useState } from "react";
import { Box, Select, MenuItem, Typography, CircularProgress } from "@mui/material";
import { assignTaskToUser } from "../services/domain.service";

// Placeholder user list; in a real app, fetch from users table/service
const USERS = [
  { id: "user-1", name: "Alex" },
  { id: "user-2", name: "Taylor" },
  { id: "user-3", name: "Jordan" }
];

interface AssigneeSelectorProps {
  taskId: string;
  assignedTo?: string | null;
}

const AssigneeSelector: React.FC<AssigneeSelectorProps> = ({ taskId, assignedTo }) => {
  const [value, setValue] = useState(assignedTo || "");
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<{ value: unknown }>) => {
    const newUserId = e.target.value as string;
    setValue(newUserId);
    setLoading(true);
    try {
      await assignTaskToUser(taskId, newUserId || null);
    } catch (err) {
      alert("Failed to assign user");
    }
    setLoading(false);
  };

  return (
    <Box>
      <Select
        value={value}
        onChange={handleChange}
        size="small"
        displayEmpty
        disabled={loading}
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="">
          <em>Unassigned</em>
        </MenuItem>
        {USERS.map(user => (
          <MenuItem key={user.id} value={user.id}>
            {user.name}
          </MenuItem>
        ))}
      </Select>
      {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
      {value && (
        <Typography variant="caption" sx={{ ml: 1 }}>
          {USERS.find(u => u.id === value)?.name || value}
        </Typography>
      )}
    </Box>
  );
};

export default AssigneeSelector;
