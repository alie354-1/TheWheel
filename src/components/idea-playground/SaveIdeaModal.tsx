import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  CircularProgress,
  Typography,
  Box,
  SelectChangeEvent
} from '@mui/material';
import { IdeaPlaygroundIdea, IdeaType, Company } from '../../lib/types/idea-playground.types';
import { companyService } from '../../lib/services/company.service';
import { useAuthStore } from '../../lib/store';

interface SaveIdeaModalProps {
  open: boolean;
  onClose: () => void;
  idea: Partial<IdeaPlaygroundIdea>;
  onSave: (updatedIdea: Partial<IdeaPlaygroundIdea>) => Promise<void>;
}

const SaveIdeaModal: React.FC<SaveIdeaModalProps> = ({ open, onClose, idea, onSave }) => {
  const { user } = useAuthStore();
  const [title, setTitle] = useState(idea.title || '');
  const [description, setDescription] = useState(idea.description || '');
  const [ideaType, setIdeaType] = useState<string>(idea.idea_type || IdeaType.NEW_COMPANY);
  const [companyId, setCompanyId] = useState<string | undefined>(idea.company_id);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch companies when the modal opens
  useEffect(() => {
    if (open && user) {
      fetchCompanies();
    }
  }, [open, user]);

  // Fetch companies the user is a member of
  const fetchCompanies = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userCompanies = await companyService.getUserCompanies(user.id);
      setCompanies(userCompanies);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to load companies. You can still save your idea without linking to a company.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle idea type change
  const handleIdeaTypeChange = (event: SelectChangeEvent) => {
    const newType = event.target.value;
    setIdeaType(newType);
    
    // If changing from product/feature to company, clear company ID
    if (newType === IdeaType.NEW_COMPANY) {
      setCompanyId(undefined);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please provide a title for your idea');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Prepare updated idea object
      const updatedIdea: Partial<IdeaPlaygroundIdea> = {
        ...idea,
        title,
        description,
        idea_type: ideaType,
        is_saved: true
      };

      // Only include company_id if it's a product or feature
      if (ideaType === IdeaType.NEW_PRODUCT || ideaType === IdeaType.NEW_FEATURE || ideaType === IdeaType.IMPROVEMENT) {
        updatedIdea.company_id = companyId;
      } else {
        updatedIdea.company_id = undefined;
      }

      await onSave(updatedIdea);
      onClose();
    } catch (error) {
      console.error('Error saving idea:', error);
      setError('Failed to save idea. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Save Your Idea</DialogTitle>
      <DialogContent>
        {error && (
          <Box mb={2} p={1} bgcolor="error.light" color="error.dark" borderRadius={1}>
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}

        <TextField
          autoFocus
          margin="dense"
          id="title"
          label="Idea Title"
          type="text"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          error={!title.trim()}
          helperText={!title.trim() ? 'Title is required' : ''}
          sx={{ mb: 2 }}
        />

        <TextField
          margin="dense"
          id="description"
          label="Description"
          multiline
          rows={4}
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
          <InputLabel id="idea-type-label">Idea Type</InputLabel>
          <Select
            labelId="idea-type-label"
            id="idea-type"
            value={ideaType}
            onChange={handleIdeaTypeChange}
            label="Idea Type"
          >
            <MenuItem value={IdeaType.NEW_COMPANY}>New Company</MenuItem>
            <MenuItem value={IdeaType.NEW_PRODUCT}>New Product</MenuItem>
            <MenuItem value={IdeaType.NEW_FEATURE}>New Feature</MenuItem>
            <MenuItem value={IdeaType.IMPROVEMENT}>Improvement</MenuItem>
          </Select>
          <FormHelperText>
            Select the type of idea you're saving
          </FormHelperText>
        </FormControl>

        {(ideaType === IdeaType.NEW_PRODUCT || ideaType === IdeaType.NEW_FEATURE || ideaType === IdeaType.IMPROVEMENT) && (
          <FormControl fullWidth margin="dense" disabled={isLoading}>
            <InputLabel id="company-label">Company</InputLabel>
            <Select
              labelId="company-label"
              id="company"
              value={companyId || ''}
              onChange={(e) => setCompanyId(e.target.value as string)}
              label="Company"
              displayEmpty
            >
              <MenuItem value="" disabled>
                {isLoading ? 'Loading companies...' : 'Select a company'}
              </MenuItem>
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {isLoading ? (
                <Box display="flex" alignItems="center">
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Loading your companies...
                </Box>
              ) : companies.length === 0 ? (
                'You don\'t have any companies. You can still save your idea without linking to a company.'
              ) : (
                'Select the company this idea is for'
              )}
            </FormHelperText>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          variant="contained"
          disabled={isSaving || !title.trim()}
        >
          {isSaving ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Saving...
            </>
          ) : (
            'Save Idea'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveIdeaModal;
