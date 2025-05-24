import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography, 
  Box, 
  Slider,
  FormHelperText,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import { DomainStepStatus } from '../types/domain.types';
import { ExtendedDomainStepStatus } from '../types/domain-extended.types';
import DecisionFeedbackModal from './DecisionFeedbackModal';

interface StepFormProps {
  domainId: string;
  initialValues?: {
    id?: string;
    name?: string;
    description?: string;
    difficulty?: number;
    time_estimate?: number;
    status?: DomainStepStatus;
    notes?: string;
    phase_name?: string;
    step_order?: number;
    [key: string]: any; // For additional custom fields
  };
  onSubmit: (values: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
  availablePhases?: Array<{
    id: string;
    name: string;
    order: number;
  }>;
}

/**
 * Step Form Component for creating or editing business operation steps
 */
const StepForm: React.FC<StepFormProps> = ({
  domainId,
  initialValues = {},
  onSubmit,
  onCancel,
  isEdit = false,
  availablePhases = []
}) => {
  const [values, setValues] = useState({
    name: '',
    description: '',
    difficulty: 2,
    time_estimate: 30,
    status: DomainStepStatus.NOT_STARTED,
    notes: '',
    phase_name: '',
    step_order: 0,
    ...initialValues
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    setValues({
      name: '',
      description: '',
      difficulty: 2,
      time_estimate: 30,
      status: DomainStepStatus.NOT_STARTED,
      notes: '',
      phase_name: '',
      step_order: 0,
      ...initialValues
    });
  }, [initialValues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<unknown>
  ) => {
    const name = e.target.name as string;
    const value = e.target.value;
    
    setValues({
      ...values,
      [name]: value
    });
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSliderChange = (name: string) => (_: Event, value: number | number[]) => {
    setValues({
      ...values,
      [name]: typeof value === 'number' ? value : value[0]
    });
  };

  const validate = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!values.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!values.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Feedback modal state
  const [showFeedback, setShowFeedback] = useState(false);
  const [completedTaskId, setCompletedTaskId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      // Prepare submission data
      const submissionData = {
        ...values,
        domain_id: domainId,
        difficulty: Number(values.difficulty),
        time_estimate: Number(values.time_estimate),
        company_id: 'default-company-id', // Would typically come from context or props in a real app
      };
      onSubmit(submissionData);

      // If marking as completed, show feedback modal
      if (values.status === DomainStepStatus.COMPLETED && values.id) {
        setCompletedTaskId(values.id);
        setShowFeedback(true);
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {isEdit ? 'Edit Step' : 'Create New Step'}
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Step Name"
              name="name"
              value={values.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={values.description}
              onChange={handleChange}
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <Typography id="difficulty-label" gutterBottom>
                Difficulty (1-5)
              </Typography>
              <Slider
                aria-labelledby="difficulty-label"
                value={values.difficulty}
                onChange={handleSliderChange('difficulty')}
                step={1}
                marks
                min={1}
                max={5}
                valueLabelDisplay="auto"
              />
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Estimated Time (minutes)"
              name="time_estimate"
              type="number"
              value={values.time_estimate}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>
          
          {isEdit && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={values.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value={ExtendedDomainStepStatus.NOT_STARTED}>Not Started</MenuItem>
                  <MenuItem value={ExtendedDomainStepStatus.IN_PROGRESS}>In Progress</MenuItem>
                  <MenuItem value={ExtendedDomainStepStatus.COMPLETED}>Completed</MenuItem>
                  <MenuItem value={ExtendedDomainStepStatus.SKIPPED}>Skipped</MenuItem>
                  <MenuItem value={ExtendedDomainStepStatus.PAUSED}>Paused</MenuItem>
                  <MenuItem value={ExtendedDomainStepStatus.CANCELLED}>Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12} sm={isEdit ? 6 : 12}>
            <FormControl fullWidth>
              <InputLabel id="phase-label">Phase</InputLabel>
              <Select
                labelId="phase-label"
                name="phase_name"
                value={values.phase_name}
                onChange={handleChange}
                label="Phase"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {availablePhases.map(phase => (
                  <MenuItem key={phase.id} value={phase.name}>
                    {phase.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Assign to a specific phase (optional)</FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={values.notes || ''}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button variant="outlined" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {isEdit ? 'Update Step' : 'Create Step'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
      {/* Decision Feedback Modal */}
      <DecisionFeedbackModal
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        taskId={completedTaskId || ""}
        userId="default-user-id" // Replace with real user id from context/auth
        companyId="default-company-id" // Replace with real company id from context/auth
        eventType="task_completed"
      />
    </>
  );
};

export default StepForm;
