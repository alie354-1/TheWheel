import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { getGlobalBusinessDomains } from "../services/domain.service";
import { BusinessDomain } from "../types/domain.types";

interface QuickAddDomainModalProps {
  open: boolean;
  onLink: (domain: BusinessDomain) => Promise<void>;
  onCreate: (values: Partial<BusinessDomain>) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
}

const QuickAddDomainModal: React.FC<QuickAddDomainModalProps> = ({
  open,
  onLink,
  onCreate,
  onClose,
  loading = false,
  error,
}) => {
  const [globalDomains, setGlobalDomains] = useState<BusinessDomain[]>([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createValues, setCreateValues] = useState({
    name: "",
    description: "",
    color: "#1976d2",
    icon: "BusinessIcon",
  });
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (open) {
      setFetching(true);
      getGlobalBusinessDomains().then((domains) => {
        setGlobalDomains(domains);
        setFetching(false);
      });
    }
  }, [open]);

  const filteredDomains = globalDomains.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    await onCreate(createValues);
    setShowCreate(false);
    setCreateValues({
      name: "",
      description: "",
      color: "#1976d2",
      icon: "BusinessIcon",
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Business Domain</DialogTitle>
      <DialogContent>
        {!showCreate ? (
          <>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <TextField
                label="Search global domains"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ ml: 2, whiteSpace: "nowrap" }}
                onClick={() => setShowCreate(true)}
              >
                Create New
              </Button>
            </Box>
            {fetching ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <List>
                {filteredDomains.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No matching global domains found." />
                  </ListItem>
                ) : (
                  filteredDomains.map((domain) => (
                    <ListItem
                      key={domain.id}
                      sx={{ borderRadius: 1, mb: 1, cursor: "pointer" }}
                      onClick={() => onLink(domain)}
                      component="div"
                    >
                      <ListItemText
                        primary={domain.name}
                        secondary={domain.description}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            )}
          </>
        ) : (
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              label="Domain Name"
              value={createValues.name}
              onChange={(e) =>
                setCreateValues((v) => ({ ...v, name: e.target.value }))
              }
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              value={createValues.description}
              onChange={(e) =>
                setCreateValues((v) => ({ ...v, description: e.target.value }))
              }
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              sx={{ mb: 2 }}
            />
            {/* Color and icon pickers could be added here */}
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setShowCreate(false)}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreate}
                disabled={loading || !createValues.name.trim()}
              >
                Create Domain
              </Button>
            </Box>
          </Box>
        )}
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickAddDomainModal;
