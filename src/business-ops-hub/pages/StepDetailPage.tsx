/**
 * Business Operations Hub - Step Detail Page
 * 
 * Displays detailed information about a business operation step
 * including requirements, dependencies, tools, metrics, and resources
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Divider,
  Paper,
  Chip,

  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Tab,
  Tabs,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Schedule as ScheduleIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Note as NoteIcon,
  ExpandMore as ExpandMoreIcon,
  BarChart as BarChartIcon,
  Link as LinkIcon,
  StarBorder as StarBorderIcon,
  Build as BuildIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useDomainDetail } from '../hooks/useDomainDetail';
import { DomainStepStatus, DomainStepDetail } from '../types/domain.types';
import { ExtendedDomainStep } from '../types/domain-extended.types';
import WorkspaceContainer from '../components/workspace/WorkspaceContainer';
import RecommendationsPanel from '../components/RecommendationsPanel';
import StepForm from '../components/StepForm';
import {
  getDomainById,
  getDomainSteps,
  getDomainStepTree,
  getTaskDependencies,
  getTaskBlockers,
  updateDomain,
  createDomainStep,
  updateDomainStep,
  deleteDomainStep,
  assignTaskToUser,
  getTaskComments,
  addTaskComment,
  unlockTaskPriority,
  lockTaskPriority
} from '../services/domain.service';
import { companyJourneyService } from '../../lib/services/companyJourney.service';
import CommentThread from '../components/CommentThread';
import AssigneeSelector from '../components/AssigneeSelector';

/**
 * Step status to badge mapping
 */
const getStatusIcon = (status: DomainStepStatus) => {
  switch (status) {
    case DomainStepStatus.COMPLETED:
      return <CheckCircleIcon color="success" />;
    case DomainStepStatus.IN_PROGRESS:
      return <ScheduleIcon color="primary" />;
    case DomainStepStatus.NOT_STARTED:
      return <UncheckedIcon color="action" />;
    case DomainStepStatus.SKIPPED:
      return <CancelIcon color="warning" />;
    default:
      return <UncheckedIcon color="action" />;
  }
};

/**
 * StepDetailPage component - displays information about a specific business operation step
 */
const StepDetailPage: React.FC = () => {
  const { domainId = '', stepId = '' } = useParams<{ domainId: string; stepId: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [addDepDialogOpen, setAddDepDialogOpen] = useState(false);
  const [selectedDepId, setSelectedDepId] = useState('');

  // Get domain and step details using the custom hook
  const {
    domain,
    steps,
    loadingDomain,
    loadingSteps,
    error,
    updateStep,
    deleteStep,
    updateStepStatus,
    addStepNotes
  } = useDomainDetail(domainId);

  // Find the current step in the loaded steps
  const currentStep = steps.find(step => step.id === stepId);

  // For additional data we'd fetch elsewhere - mocked for now
  const [mockData] = useState({
    dependencies: [
      { id: 'dep1', name: 'Financial Data Access', status: 'Completed' },
      { id: 'dep2', name: 'Reporting Tools Setup', status: 'Pending' }
    ],
    tools: [
      { id: 'tool1', name: 'Financial Dashboard', description: 'Visualize financial metrics', link: '#' },
      { id: 'tool2', name: 'Budget Planner', description: 'Plan and allocate budgets', link: '#' }
    ],
    resources: [
      { id: 'res1', name: 'Budget Planning Guide', type: 'PDF', link: '#' },
      { id: 'res2', name: 'Financial KPIs Overview', type: 'Webpage', link: '#' }
    ],
    metrics: [
      { id: 'metric1', name: 'Completion Rate', value: 68, target: 100, unit: '%' },
      { id: 'metric2', name: 'Time Invested', value: 12, target: 20, unit: 'hours' }
    ],
    notes: [
      { id: 'note1', text: 'Meeting with finance team scheduled for next week', date: '2025-05-03', user: 'Alex' },
      { id: 'note2', text: 'Need to finalize budget allocation before proceeding', date: '2025-05-05', user: 'Taylor' }
    ]
  });

  // Consideration links for this step
  const [considerations, setConsiderations] = useState<any[]>([]);
  const [considerationsLoading, setConsiderationsLoading] = useState(false);

  React.useEffect(() => {
    if (!currentStep) return;
    setConsiderationsLoading(true);
    import('../services/domain.service').then(({ getTaskDependencies }) => {
      getTaskDependencies(currentStep.id, 'consideration')
        .then((data: any[]) => setConsiderations(data || []))
        .finally(() => setConsiderationsLoading(false));
    });
  }, [currentStep]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate(`/business-ops-hub/domain/${domainId}`);
  };

  const [statusConfirmDialog, setStatusConfirmDialog] = useState<{ open: boolean; newStatus: DomainStepStatus | null }>({ open: false, newStatus: null });

  const handleStatusChange = async (newStatus: DomainStepStatus) => {
    if (!currentStep) return;
    // Enforce confirmation for "backwards" transitions
    const isBackwards =
      (currentStep.status === DomainStepStatus.COMPLETED && newStatus === DomainStepStatus.IN_PROGRESS) ||
      (currentStep.status === DomainStepStatus.COMPLETED && newStatus === DomainStepStatus.NOT_STARTED) ||
      (currentStep.status === DomainStepStatus.REVIEW && newStatus !== DomainStepStatus.COMPLETED && newStatus !== DomainStepStatus.REVIEW);

    if (isBackwards) {
      setStatusConfirmDialog({ open: true, newStatus });
      return;
    }
    try {
      await updateStepStatus(currentStep.id, newStatus);
    } catch (error) {
      console.error('Failed to update step status:', error);
    }
  };

  const handleDeleteStep = async () => {
    if (currentStep) {
      try {
        await deleteStep(currentStep.id);
        navigate(`/business-ops-hub/domain/${domainId}`);
      } catch (error) {
        console.error('Failed to delete step:', error);
      }
    }
    setConfirmDelete(false);
  };

  const handleEditSubmit = async (values: any) => {
    if (currentStep) {
      try {
        await updateStep(currentStep.id, values);
        setIsEditMode(false);
      } catch (error) {
        console.error('Failed to update step:', error);
      }
    }
  };

  const handleAddNote = async () => {
    if (currentStep && noteInput.trim()) {
      try {
        await addStepNotes(currentStep.id, noteInput);
        setNoteInput('');
        setNotesDialogOpen(false);
      } catch (error) {
        console.error('Failed to add note:', error);
      }
    }
  };

  // Get step notes from the ExtendedDomainStep type if available
  const getStepNotes = (step: DomainStepDetail): string | null => {
    // Check if it's an ExtendedDomainStep and has notes
    if ((step as ExtendedDomainStep).notes) {
      return (step as ExtendedDomainStep).notes || null;
    }
    return null;
  };

  // Loading state
  if (loadingDomain || loadingSteps) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Error state
  if (error || !domain || !currentStep) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Typography variant="h5" color="error">
            {error ? `Error: ${error.message}` : 'Step not found'}
          </Typography>
          <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={handleBack}>
            Return to Domain
          </Button>
        </Box>
      </Container>
    );
  }

  // Edit mode rendering
  if (isEditMode) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box mb={4}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => setIsEditMode(false)}
          >
            Cancel Editing
          </Button>
        </Box>
        
        <Paper sx={{ p: 3 }}>
          <StepForm
            domainId={domainId}
            initialValues={{
              id: currentStep.id,
              name: currentStep.name,
              description: currentStep.description,
              difficulty: currentStep.difficulty,
              time_estimate: currentStep.time_estimate,
              status: currentStep.status,
              phase_name: currentStep.phase_name || undefined,
              step_order: currentStep.step_order,
              notes: getStepNotes(currentStep) || undefined
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditMode(false)}
            isEdit={true}
            availablePhases={[
              { id: 'phase1', name: 'Planning', order: 1 },
              { id: 'phase2', name: 'Implementation', order: 2 },
              { id: 'phase3', name: 'Review', order: 3 }
            ]} // In a real app, this would come from API
          />
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header section */}
      <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back to {domain.name}
          </Button>
          <Chip
            icon={getStatusIcon(currentStep.status)}
            label={currentStep.status.replace('_', ' ')}
            color={currentStep.status === DomainStepStatus.COMPLETED ? 'success' :
                  currentStep.status === DomainStepStatus.IN_PROGRESS ? 'primary' :
                  currentStep.status === DomainStepStatus.SKIPPED ? 'warning' : 'default'}
          />
        </Box>
        <Box>
          <IconButton
            color="primary"
            onClick={() => setIsEditMode(true)}
            title="Edit Step"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => setConfirmDelete(true)}
            title="Delete Step"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Main content */}
      <Grid container spacing={4}>
        {/* Left column - Step details */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              {currentStep.name}
            </Typography>
            <Typography variant="body1" paragraph>
              {currentStep.description}
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Difficulty
                </Typography>
                <Box display="flex" alignItems="center">
                  {Array(Math.min(5, Math.max(1, Math.floor(currentStep.difficulty / 2))))
                    .fill(null)
                    .map((_, index) => (
                      <StarBorderIcon key={index} fontSize="small" color="primary" />
                    ))}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Estimated Time
                </Typography>
                <Typography>
                  {currentStep.time_estimate} minutes
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Assignee
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <AssigneeSelector
                    taskId={currentStep.id}
                    assignedTo={(currentStep as any).assigned_to}
                  />
                </Box>
              </Grid>
              {currentStep.phase_name && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phase
                  </Typography>
                  <Typography>
                    {currentStep.phase_name}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Step ID
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentStep.id}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Status & Progress</Typography>
              <Box>
                <Button
                  variant={currentStep.status === DomainStepStatus.NOT_STARTED ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleStatusChange(DomainStepStatus.IN_PROGRESS)}
                  sx={{ mr: 1 }}
                >
                  Start
                </Button>
                <Button
                  variant={currentStep.status === DomainStepStatus.COMPLETED ? 'contained' : 'outlined'}
                  size="small"
                  color="success"
                  onClick={() => handleStatusChange(DomainStepStatus.COMPLETED)}
                  sx={{ mr: 1 }}
                >
                  Complete
                </Button>
                <Button
                  variant={currentStep.status === DomainStepStatus.REVIEW ? 'contained' : 'outlined'}
                  size="small"
                  color="info"
                  onClick={() => handleStatusChange(DomainStepStatus.REVIEW)}
                  sx={{ mr: 1 }}
                >
                  Review
                </Button>
                <Button
                  variant={currentStep.status === DomainStepStatus.WAITING ? 'contained' : 'outlined'}
                  size="small"
                  color="secondary"
                  onClick={() => handleStatusChange(DomainStepStatus.WAITING)}
                  sx={{ mr: 1 }}
                >
                  Waiting
                </Button>
                <Button
                  variant={currentStep.status === DomainStepStatus.BLOCKED ? 'contained' : 'outlined'}
                  size="small"
                  color="error"
                  onClick={() => handleStatusChange(DomainStepStatus.BLOCKED)}
                  sx={{ mr: 1 }}
                >
                  Blocked
                </Button>
                <Button
                  variant={currentStep.status === DomainStepStatus.SKIPPED ? 'contained' : 'outlined'}
                  size="small"
                  color="warning"
                  onClick={() => handleStatusChange(DomainStepStatus.SKIPPED)}
                >
                  Skip
                </Button>
              </Box>
            </Box>
            
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Overall Completion
              </Typography>
              <LinearProgress
                variant="determinate"
                value={
                  currentStep.status === DomainStepStatus.COMPLETED
                    ? 100
                    : currentStep.status === DomainStepStatus.IN_PROGRESS
                    ? 50
                    : currentStep.status === DomainStepStatus.SKIPPED
                    ? 100
                    : 0
                }
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Comments & Mentions</Typography>
            </Box>
            <CommentThread taskId={currentStep.id} />
          </Paper>
        </Grid>

        {/* Right column - Workspace and tools */}
        <Grid item xs={12} md={5}>
          <RecommendationsPanel
            companyId={domain.company_id}
            userId={currentStep.assigned_to || undefined}
            context={{ stepId: currentStep.id }}
          />
          <Paper sx={{ p: 3, mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="step resource tabs"
            >
              <Tab label="Workspace" icon={<BuildIcon />} iconPosition="start" />
              <Tab label="Tools" icon={<BarChartIcon />} iconPosition="start" />
              <Tab label="Resources" icon={<DescriptionIcon />} iconPosition="start" />
            </Tabs>
            
            <Box sx={{ mt: 2, minHeight: '400px' }}>
              {tabValue === 0 && (
                <Box>
                  {/* WorkspaceContainer with correct props according to its interface */}
                  <WorkspaceContainer
                    domain={domain}
                    title={`Workspace for ${currentStep.name}`}
                    subtitle="Use this workspace to collaborate on this step"
                  >
                    <Box p={3} textAlign="center">
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        Workspace for step: {stepId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Domain: {domain.name}
                      </Typography>
                    </Box>
                  </WorkspaceContainer>
                </Box>
              )}
              
              {tabValue === 1 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Recommended Tools
                  </Typography>
                  <Grid container spacing={2}>
                    {mockData.tools.map(tool => (
                      <Grid item xs={12} key={tool.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6">{tool.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {tool.description}
                            </Typography>
                            <Button
                              startIcon={<LinkIcon />}
                              size="small"
                              href={tool.link}
                              target="_blank"
                              sx={{ mt: 1 }}
                            >
                              Open Tool
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              
              {tabValue === 2 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Learning Resources
                  </Typography>
                  <List>
                    {mockData.resources.map(resource => (
                      <ListItem key={resource.id} component="a" href={resource.link} target="_blank">
                        <ListItemIcon>
                          <DescriptionIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={resource.name}
                          secondary={resource.type}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Considerations Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cross-Domain Considerations
            </Typography>
            {considerationsLoading ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                Loading considerations...
              </Typography>
            ) : considerations.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No considerations linked to this step.
              </Typography>
            ) : (
              <List>
                {considerations.map((c) => (
                  <ListItem key={c.id} secondaryAction={
                    <>
                      <Button
                        size="small"
                        color="primary"
                        sx={{ mr: 1 }}
                        onClick={async () => {
                          // Activate: create a company-specific task/step in the relevant domain
                          try {
                            // You may need to adjust how to get these values in your real app
                            const companyJourneyMapId = domain?.company_journey_map_id || domain?.id || '';
                            const companyId = domain?.company_id || '';
                            const domainIdOfConsideration = c.domain_id || domainId;
                            await companyJourneyService.activateConsideration(
                              companyJourneyMapId,
                              c.depends_on_task_id,
                              domainIdOfConsideration,
                              companyId
                            );
                            alert('Consideration activated as a company-specific step.');
                            // Optionally refresh considerations or page
                          } catch (err) {
                            alert('Failed to activate consideration');
                          }
                        }}
                      >
                        Activate
                      </Button>
                      <Button
                        size="small"
                        color="secondary"
                        onClick={async () => {
                          // Dismiss: mark as dismissed or remove the link
                          try {
                            // Try to find an existing company_journey_step for this consideration
                            const companyId = domain?.company_id || '';
                            const domainIdOfConsideration = c.domain_id || domainId;
                            const stepId = c.depends_on_task_id;
                            // Query for company_journey_step
                            const { data: existingStep, error } = await import('../../lib/supabase').then(({ supabase }) =>
                              supabase
                                .from('company_journey_steps')
                                .select('id')
                                .eq('company_id', companyId)
                                .eq('step_id', stepId)
                                .eq('domain_id', domainIdOfConsideration)
                                .single()
                            );
                            if (existingStep && existingStep.id) {
                              await companyJourneyService.dismissStep(existingStep.id);
                              alert('Consideration dismissed.');
                            } else {
                              // Create a dismissed company_journey_step
                              const companyJourneyMapId = domain?.company_journey_map_id || domain?.id || '';
                              await import('../../lib/supabase').then(({ supabase }) =>
                                supabase
                                  .from('company_journey_steps')
                                  .insert({
                                    company_journey_map_id: companyJourneyMapId,
                                    step_id: stepId,
                                    domain_id: domainIdOfConsideration,
                                    company_id: companyId,
                                    is_custom: false,
                                    is_activated: false,
                                    is_dismissed: true
                                  })
                              );
                              alert('Consideration dismissed.');
                            }
                            // Optionally refresh considerations or page
                          } catch (err) {
                            alert('Failed to dismiss consideration');
                          }
                        }}
                      >
                        Dismiss
                      </Button>
                    </>
                  }>
                    <ListItemIcon>
                      <LinkIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Consideration: ${c.depends_on_task_id}`}
                      secondary={`Type: consideration`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dependencies & Prerequisites
            </Typography>
            {/* Real dependencies from currentStep.dependencies */}
            {Array.isArray((currentStep as any).dependencies) && (currentStep as any).dependencies.length > 0 ? (
              <List>
                {(currentStep as any).dependencies.map((dep: any) => (
                  <ListItem key={dep.id} secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="remove"
                      color="error"
                      onClick={async () => {
                        // Remove dependency
                        try {
                          await domainService.removeTaskDependency(currentStep.id, dep.depends_on_task_id, dep.type);
                          // Refresh step data
                          window.location.reload();
                        } catch (error) {
                          alert('Failed to remove dependency');
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }>
                    <ListItemIcon>
                      <LinkIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Depends on Task ID: ${dep.depends_on_task_id}`}
                      secondary={`Type: ${dep.type}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No dependencies identified
              </Typography>
            )}
            {/* Add Dependency Button and Dialog */}
            <Box mt={2}>
              <Button
                variant="outlined"
                startIcon={<LinkIcon />}
                onClick={() => setAddDepDialogOpen(true)}
              >
                Add Dependency
              </Button>
            </Box>
            <Dialog
              open={addDepDialogOpen}
              onClose={() => setAddDepDialogOpen(false)}
            >
              <DialogTitle>Add Dependency</DialogTitle>
              <DialogContent>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Select a task this step should depend on.
                </Typography>
                <TextField
                  select
                  label="Select Task"
                  value={selectedDepId}
                  onChange={e => setSelectedDepId(e.target.value)}
                  fullWidth
                  SelectProps={{ native: true }}
                >
                  <option value="">-- Select --</option>
                  {steps
                    .filter(s => s.id !== currentStep.id)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </TextField>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setAddDepDialogOpen(false)}>Cancel</Button>
                <Button
                  onClick={async () => {
                    if (!selectedDepId) return;
                    try {
                      await domainService.addTaskDependency(currentStep.id, selectedDepId, 'blocks');
                      setAddDepDialogOpen(false);
                      setSelectedDepId('');
                      window.location.reload();
                    } catch (error) {
                      alert('Failed to add dependency');
                    }
                  }}
                  color="primary"
                  disabled={!selectedDepId}
                >
                  Add
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <Dialog
        open={statusConfirmDialog.open}
        onClose={() => setStatusConfirmDialog({ open: false, newStatus: null })}
      >
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to change the status from <b>{currentStep.status.replace('_', ' ')}</b> to <b>{statusConfirmDialog.newStatus?.replace('_', ' ')}</b>? This may require additional review or explanation.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusConfirmDialog({ open: false, newStatus: null })}>Cancel</Button>
          <Button
            color="primary"
            onClick={async () => {
              if (statusConfirmDialog.newStatus) {
                try {
                  await updateStepStatus(currentStep.id, statusConfirmDialog.newStatus);
                } catch (error) {
                  alert('Failed to update status');
                }
              }
              setStatusConfirmDialog({ open: false, newStatus: null });
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
      >
        <DialogTitle>Delete Step?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this step? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button onClick={handleDeleteStep} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={notesDialogOpen}
        onClose={() => setNotesDialogOpen(false)}
      >
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            fullWidth
            multiline
            rows={4}
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotesDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNote} color="primary" disabled={!noteInput.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StepDetailPage;
