import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSSTransition, SwitchTransition } from "react-transition-group";
import "./dashboard-transitions.css";
import { Container, Grid, Typography, Box, Divider, CircularProgress, Button } from '@mui/material';
import { useDomains } from '../hooks/useDomains';
import AddIcon from '@mui/icons-material/Add';
import { useCompany } from '@/lib/hooks/useCompany';
import DomainEditModal from '../components/DomainEditModal';
import QuickAddDomainModal from '../components/QuickAddDomainModal';
import { supabase } from '@/lib/supabase';
import DomainCard from '../components/DomainCard';
import { BusinessDomain } from '../types/domain.types';
type DomainSummary = any;
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import Tooltip from '@/components/common/Tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
// Removed duplicate Button import
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  ExecutiveSummaryPanel,
  NextActionsPanel,
  DomainOverviewGrid,
  ToolRecommendationsPanel,
  AnalyticsPanel,
} from "../components/dashboard";
import ExecutiveDashboardPanel from "../components/dashboard/ExecutiveDashboardPanel";

/**
 * Business Operations Hub main page
 * 
 * This is the entry point for the Business Operations Hub feature,
 * showing a collection of business domains that users can navigate through
 */
const BusinessOperationsHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTools, setSelectedTools] = useState<any[]>([]);
  const [selectedGuideToolId, setSelectedGuideToolId] = useState<string | undefined>(undefined);
  const { domains, loading, error, fetchDomainSummary, createDomain, fetchDomains } = useDomains();
  const { currentCompany } = useCompany();
  const companyId = currentCompany?.id || "";
  const [domainSummaries, setDomainSummaries] = useState<DomainSummary[]>([]);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [loadingSummaries, setLoadingSummaries] = useState(true);

  // Edit modal state
  const [editDomain, setEditDomain] = useState<BusinessDomain | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Quick add modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Archive dialog state
  const [archiveDomain, setArchiveDomain] = useState<BusinessDomain | null>(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  // Archived domains section
  const [showArchived, setShowArchived] = useState(false);

  const { updateDomain } = useDomains();

  // Local order state for drag-and-drop
  const [orderedDomains, setOrderedDomains] = useState<BusinessDomain[]>([]);

  // Sync orderedDomains with domains from backend
  useEffect(() => {
    setOrderedDomains(domains);
  }, [domains]);

  // Fetch real summary data for each domain
  useEffect(() => {
    let isMounted = true;
    async function loadSummaries() {
      setLoadingSummaries(true);
      // Guard: only proceed if currentCompany and currentCompany.id are available
      if (!currentCompany || !currentCompany.id) {
        setDomainSummaries([]);
        setLoadingSummaries(false);
        return;
      }
      if (domains && domains.length > 0) {
        const summaries: DomainSummary[] = [];
        for (const domain of domains) {
          const summary = await fetchDomainSummary(domain.id);
          if (summary) summaries.push(summary);
        }
        if (isMounted) setDomainSummaries(summaries);
      } else {
        setDomainSummaries([]);
      }
      setLoadingSummaries(false);
    }
    if (!loading) {
      loadSummaries();
    }
    return () => { isMounted = false; };
  }, [domains, loading, fetchDomainSummary, currentCompany]);

  const handleDomainClick = (domainId: string) => {
    navigate(`/business-ops-hub/domain/${domainId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography color="error" variant="h5">
            Error loading business domains: {error.toString()}
          </Typography>
        </Box>
      </Container>
    );
  }

  // Move domain in local order and persist to backend
  const moveDomain = (from: number, to: number) => {
    if (from === to) return;
    setOrderedDomains((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(from, 1);
      updated.splice(to, 0, removed);
      // Update order_index for all domains (floating point for easy reordering)
      updated.forEach((d, idx) => {
        d.order_index = idx;
      });
      // Persist new order to backend (batch update)
      // (In a real implementation, debounce this or batch after drag end)
      // For now, update each domain individually
      updated.forEach((d, idx) => {
        updateDomain(d.id, { order_index: idx });
      });
      return updated;
    });
  };

  {/* Domain Edit Modal */}
  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Business Operations Hub
            </Typography>
            <Typography variant="body1" paragraph>
              Navigate through your business operations by domain. Each domain contains steps, 
              tools, and resources to help you manage and optimize your business operations.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setAddModalOpen(true)}
            sx={{ height: 40, minWidth: 160 }}
            aria-label="Add Domain"
          >
            Add Domain
          </Button>
        </Box>
        <Divider sx={{ my: 3 }} />
        <Grid container spacing={3}>
          {domains && domains.map((domain: BusinessDomain) => {
            const summary = domainSummaries.find(s => s.id === domain.id);

            return (
              <Grid item xs={12} sm={6} md={4} key={domain.id} sx={{ position: 'relative' }}>
                <DomainCard
                  domain={domain}
                  summary={summary}
                  isLoading={loadingSummaries}
                  onClick={() => handleDomainClick(domain.id)}
                  active={activeDomain === domain.id}
                />
                <Tooltip content="Edit this domain's details.">
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 3,
                      bgcolor: 'background.paper',
                      border: '1px solid #eee',
                      boxShadow: 1,
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                    aria-label="Edit domain"
                    onClick={() => setEditDomain(domain)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
            );
          })}
          {domains && domains.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No business domains found
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Please contact your administrator to set up business domains.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
      <DomainEditModal
        open={!!editDomain}
        domain={editDomain as BusinessDomain}
        onSave={async (updates) => {
          if (!editDomain) return;
          setEditLoading(true);
          setEditError(null);
          try {
            await updateDomain(editDomain.id, updates);
            setEditDomain(null);
          } catch (err: any) {
            setEditError(err.message || "Failed to update domain");
          } finally {
            setEditLoading(false);
          }
        }}
        onClose={() => setEditDomain(null)}
        loading={editLoading}
        error={editError}
      />
      {/* Quick Add Domain Modal */}
      <QuickAddDomainModal
        open={addModalOpen}
        onLink={async (globalDomain) => {
          setAddLoading(true);
          setAddError(null);
          try {
            // 1. Duplicate the global domain for the current company
            const newDomain = await createDomain({
              name: globalDomain.name,
              description: globalDomain.description,
              icon: globalDomain.icon,
              color: globalDomain.color,
              order_index: domains.length,
            });
            // 2. Copy steps from the global domain to the new company domain
            if (newDomain && newDomain.id && globalDomain.id && companyId) {
              const { copyStepsFromGlobalDomain } = await import('../services/domain.service');
              await copyStepsFromGlobalDomain(globalDomain.id, newDomain.id, companyId);
            }
            // 3. Refresh domains list to ensure UI updates
            if (typeof fetchDomains === "function") {
              await fetchDomains();
            }
            setAddModalOpen(false);
          } catch (err: any) {
            setAddError(err.message || "Failed to link domain");
          } finally {
            setAddLoading(false);
          }
        }}
        onCreate={async (values) => {
          setAddLoading(true);
          setAddError(null);
          try {
            await createDomain({
              name: values.name,
              description: values.description,
              icon: values.icon,
              color: values.color,
              order_index: domains.length,
            });
            // Refresh domains list to ensure UI updates
            if (typeof fetchDomains === "function") {
              await fetchDomains();
            }
            setAddModalOpen(false);
          } catch (err: any) {
            setAddError(err.message || "Failed to create domain");
          } finally {
            setAddLoading(false);
          }
        }}
        onClose={() => setAddModalOpen(false)}
        loading={addLoading}
        error={addError}
      />
    </>
  );
};

export default BusinessOperationsHubPage;
