import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

type KnowledgeArtifact = {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  createdAt: string;
};

const CATEGORIES = [
  "General",
  "Finance",
  "Product",
  "HR",
  "Marketing",
  "Operations",
  "Legal",
  "Other"
];

const KnowledgeRepository: React.FC = () => {
  const [artifacts, setArtifacts] = useState<KnowledgeArtifact[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "General" });

  // Add artifact dialog handlers
  const openAddDialog = () => {
    setForm({ title: "", content: "", category: "General" });
    setAddDialogOpen(true);
  };
  const closeAddDialog = () => setAddDialogOpen(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddArtifact = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setArtifacts(prev => [
      {
        id: Math.random().toString(36).substr(2, 9),
        title: form.title,
        content: form.content,
        category: form.category,
        author: "You", // TODO: Replace with actual user
        createdAt: new Date().toLocaleString(),
      },
      ...prev,
    ]);
    // TODO: Integrate with backend knowledge API
    closeAddDialog();
  };

  // Filter and search logic
  const filteredArtifacts = artifacts.filter(a =>
    (categoryFilter === "All" || a.category === categoryFilter) &&
    (a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Knowledge Repository
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search knowledge..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          size="small"
          label="Category"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="All">All</MenuItem>
          {CATEGORIES.map(cat => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </TextField>
        <Button variant="contained" onClick={openAddDialog}>
          Add Knowledge
        </Button>
      </Box>
      <List dense>
        {filteredArtifacts.length === 0 ? (
          <ListItem>
            <ListItemText primary="No knowledge artifacts found." />
          </ListItem>
        ) : (
          filteredArtifacts.map(a => (
            <ListItem key={a.id} alignItems="flex-start">
              <ListItemText
                primary={a.title}
                secondary={
                  <>
                    <Typography variant="caption" color="text.secondary">
                      {a.category} &nbsp;|&nbsp; {a.author} &nbsp;|&nbsp; {a.createdAt}
                    </Typography>
                    <br />
                    <Typography variant="body2" color="text.primary">
                      {a.content.length > 120 ? a.content.slice(0, 120) + "..." : a.content}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))
        )}
      </List>
      {/* Add Knowledge Dialog */}
      <Dialog open={addDialogOpen} onClose={closeAddDialog}>
        <DialogTitle>Add Knowledge Artifact</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            fullWidth
            value={form.title}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            name="content"
            label="Content"
            fullWidth
            multiline
            minRows={3}
            value={form.content}
            onChange={handleFormChange}
          />
          <TextField
            select
            margin="dense"
            name="category"
            label="Category"
            fullWidth
            value={form.category}
            onChange={handleFormChange}
          >
            {CATEGORIES.map(cat => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddDialog}>Cancel</Button>
          <Button onClick={handleAddArtifact} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default KnowledgeRepository;
