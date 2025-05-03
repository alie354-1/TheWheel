import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  SelectChangeEvent
} from '@mui/material';
import { 
  Lightbulb, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Building, 
  User, 
  Calendar, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { ideaPlaygroundAdapter } from '../../lib/services/idea-playground/service-adapter';
import { IdeaPlaygroundIdea, IdeaType, Company } from '../../lib/types/idea-playground.types';
import { companyService } from '../../lib/services/company.service';

const SavedIdeasPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [ideas, setIdeas] = useState<IdeaPlaygroundIdea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<IdeaPlaygroundIdea[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [ideaTypeFilter, setIdeaTypeFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  
  // Fetch ideas and companies on component mount
  useEffect(() => {
    if (user) {
      fetchIdeas();
      fetchCompanies();
    }
  }, [user]);
  
  // Fetch all ideas for the current user
  const fetchIdeas = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedIdeas = await ideaPlaygroundAdapter.getIdeas(user.id);
      console.log('Fetched ideas:', fetchedIdeas);
      
      // Filter to only include saved ideas
      const savedIdeas = fetchedIdeas.filter((idea: IdeaPlaygroundIdea) => idea.is_saved);
      
      setIdeas(savedIdeas);
      setFilteredIdeas(savedIdeas);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      setError('Failed to load your saved ideas. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch companies the user is a member of
  const fetchCompanies = async () => {
    if (!user) return;
    
    try {
      const userCompanies = await companyService.getUserCompanies(user.id);
      setCompanies(userCompanies);
    } catch (error) {
      console.error('Error fetching companies:', error);
      // Don't set error state here to avoid blocking the main functionality
    }
  };
  
  // Apply filters whenever filter criteria change
  useEffect(() => {
    if (!ideas.length) return;
    
    let result = [...ideas];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(idea => 
        idea.title.toLowerCase().includes(query) || 
        idea.description.toLowerCase().includes(query)
      );
    }
    
    // Apply idea type filter
    if (ideaTypeFilter !== 'all') {
      result = result.filter(idea => idea.idea_type === ideaTypeFilter);
    }
    
    // Apply company filter
    if (companyFilter !== 'all') {
      result = result.filter(idea => idea.company_id === companyFilter);
    }
    
    // Apply sorting
    result = sortIdeas(result, sortBy);
    
    setFilteredIdeas(result);
  }, [searchQuery, ideaTypeFilter, companyFilter, sortBy, ideas]);
  
  // Sort ideas based on the selected sort criteria
  const sortIdeas = (ideasToSort: IdeaPlaygroundIdea[], sortCriteria: string) => {
    switch (sortCriteria) {
      case 'newest':
        return [...ideasToSort].sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      case 'oldest':
        return [...ideasToSort].sort((a, b) => 
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        );
      case 'alphabetical':
        return [...ideasToSort].sort((a, b) => 
          a.title.localeCompare(b.title)
        );
      default:
        return ideasToSort;
    }
  };
  
  // Handle idea deletion
  const handleDeleteIdea = async (ideaId: string) => {
    if (!window.confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Use updateIdea with a special flag to mark as deleted
      await ideaPlaygroundAdapter.updateIdea(ideaId, { is_saved: false });
      // Remove the deleted idea from the state
      setIdeas(ideas.filter(idea => idea.id !== ideaId));
    } catch (error) {
      console.error('Error deleting idea:', error);
      setError('Failed to delete idea. Please try again.');
    }
  };
  
  // Get company name by ID
  const getCompanyName = (companyId: string | undefined) => {
    if (!companyId) return '';
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : '';
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Get idea type display name
  const getIdeaTypeDisplay = (type: string | undefined) => {
    switch (type) {
      case IdeaType.NEW_COMPANY:
        return 'New Company';
      case IdeaType.NEW_PRODUCT:
        return 'New Product';
      case IdeaType.NEW_FEATURE:
        return 'New Feature';
      case IdeaType.IMPROVEMENT:
        return 'Improvement';
      default:
        return 'Unknown';
    }
  };
  
  // Get color for idea type chip
  const getIdeaTypeColor = (type: string | undefined): "primary" | "secondary" | "success" | "info" | "default" => {
    switch (type) {
      case IdeaType.NEW_COMPANY:
        return 'primary';
      case IdeaType.NEW_PRODUCT:
        return 'secondary';
      case IdeaType.NEW_FEATURE:
        return 'success';
      case IdeaType.IMPROVEMENT:
        return 'info';
      default:
        return 'default';
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            My Saved Ideas
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<Lightbulb />}
            onClick={() => navigate('/idea-hub/quick-generation')}
          >
            Create New Idea
          </Button>
        </Box>
        
        {error && (
          <Box 
            mb={4} 
            p={2} 
            bgcolor="error.light" 
            color="error.contrastText" 
            borderRadius={1}
          >
            <Typography>{error}</Typography>
          </Box>
        )}
        
        {/* Filters */}
        <Box mb={4} p={3} bgcolor="background.paper" borderRadius={1} boxShadow={1}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Ideas"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={20} style={{ marginRight: 8 }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="idea-type-filter-label">Idea Type</InputLabel>
                    <Select
                      labelId="idea-type-filter-label"
                      value={ideaTypeFilter}
                      onChange={(e: SelectChangeEvent) => setIdeaTypeFilter(e.target.value)}
                      label="Idea Type"
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value={IdeaType.NEW_COMPANY}>New Company</MenuItem>
                      <MenuItem value={IdeaType.NEW_PRODUCT}>New Product</MenuItem>
                      <MenuItem value={IdeaType.NEW_FEATURE}>New Feature</MenuItem>
                      <MenuItem value={IdeaType.IMPROVEMENT}>Improvement</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="company-filter-label">Company</InputLabel>
                    <Select
                      labelId="company-filter-label"
                      value={companyFilter}
                      onChange={(e: SelectChangeEvent) => setCompanyFilter(e.target.value)}
                      label="Company"
                    >
                      <MenuItem value="all">All Companies</MenuItem>
                      {companies.map((company) => (
                        <MenuItem key={company.id} value={company.id}>
                          {company.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="sort-by-label">Sort By</InputLabel>
                    <Select
                      labelId="sort-by-label"
                      value={sortBy}
                      onChange={(e: SelectChangeEvent) => setSortBy(e.target.value)}
                      label="Sort By"
                    >
                      <MenuItem value="newest">Newest First</MenuItem>
                      <MenuItem value="oldest">Oldest First</MenuItem>
                      <MenuItem value="alphabetical">Alphabetical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          
          <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="textSecondary">
              {filteredIdeas.length} {filteredIdeas.length === 1 ? 'idea' : 'ideas'} found
            </Typography>
            
            <Button 
              startIcon={<RefreshCw size={16} />}
              onClick={fetchIdeas}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </Box>
        </Box>
        
        {/* Ideas Grid */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" my={8}>
            <CircularProgress />
          </Box>
        ) : filteredIdeas.length === 0 ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            py={8}
          >
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No ideas found
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" mb={4}>
              {searchQuery || ideaTypeFilter !== 'all' || companyFilter !== 'all' ? 
                'Try adjusting your filters to see more results.' : 
                'You haven\'t saved any ideas yet.'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Lightbulb />}
              onClick={() => navigate('/idea-hub/quick-generation')}
            >
              Create Your First Idea
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredIdeas.map((idea) => (
              <Grid item xs={12} sm={6} md={4} key={idea.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Chip 
                        label={getIdeaTypeDisplay(idea.idea_type)} 
                        color={getIdeaTypeColor(idea.idea_type)}
                        size="small"
                      />
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(idea.updated_at)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" component="h2" gutterBottom>
                      {idea.title}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {idea.description.length > 120 ? 
                        `${idea.description.substring(0, 120)}...` : 
                        idea.description}
                    </Typography>
                    
                    {idea.company_id && (
                      <Box display="flex" alignItems="center" mt={2}>
                        <Building size={16} />
                        <Typography variant="body2" color="textSecondary" ml={1}>
                          {getCompanyName(idea.company_id)}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  
                  <Divider />
                  
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Edit size={16} />}
                      onClick={() => navigate(`/idea-hub/refinement?ideaId=${idea.id}`)}
                    >
                      Edit
                    </Button>
                    
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<ArrowRight size={16} />}
                      onClick={() => navigate(`/idea-hub/refinement?ideaId=${idea.id}&step=1`)}
                    >
                      Refine
                    </Button>
                    
                    <Box flexGrow={1} />
                    
                    <Tooltip title="Delete Idea">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteIdea(idea.id)}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default SavedIdeasPage;
