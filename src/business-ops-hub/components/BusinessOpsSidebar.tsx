import React, { useState } from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Divider, Box, IconButton, ListItemButton } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useDomains } from "../hooks/useDomains";
import { icons } from "./domainIcons";
import { BusinessDomain } from "../types/domain.types";

const drawerWidth = 240;

import MenuIcon from "@mui/icons-material/Menu";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const BusinessOpsSidebar: React.FC = () => {
  const { domains } = useDomains();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawerContent = (
    <Box sx={{ overflow: "auto" }}>
      <List>
        <ListItem>
          <ListItemButton onClick={() => navigate("/dashboard")}>
            <ListItemText primary="Back to Main App" primaryTypographyProps={{ fontWeight: "bold" }} />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemText primary="Business Domains" primaryTypographyProps={{ fontWeight: "bold" }} />
        </ListItem>
        <Divider />
        {domains.map((domain: BusinessDomain) => {
          const Icon = icons[domain.icon || "BusinessIcon"] || icons["BusinessIcon"];
          const selected = location.pathname.includes(domain.id);
          return (
            <ListItem key={domain.id}>
              <ListItemButton
                selected={selected}
                onClick={() => {
                  navigate(`/business-ops-hub/${domain.id}`);
                  setMobileOpen(false);
                }}
                sx={{
                  bgcolor: selected ? "primary.light" : undefined,
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <ListItemIcon>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={domain.name} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List>
        <ListItem>
          <ListItemText primary="Hub Features" primaryTypographyProps={{ fontWeight: "bold" }} />
        </ListItem>
        <ListItem>
          <ListItemButton onClick={() => { navigate("/business-ops-hub/tasks"); setMobileOpen(false); }}>
            <ListItemText primary="Unified Task List" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton onClick={() => { navigate("/business-ops-hub"); setMobileOpen(false); }}>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton onClick={() => { navigate("/business-ops-hub/analytics"); setMobileOpen(false); }}>
            <ListItemText primary="Analytics" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton onClick={() => { navigate("/business-ops-hub/automations"); setMobileOpen(false); }}>
            <ListItemText primary="Workflow Automations" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton onClick={() => { navigate("/business-ops-hub/team"); setMobileOpen(false); }}>
            <ListItemText primary="Team Management" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton onClick={() => { navigate("/business-ops-hub/knowledge"); setMobileOpen(false); }}>
            <ListItemText primary="Knowledge Repository" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton onClick={() => { navigate("/business-ops-hub/templates"); setMobileOpen(false); }}>
            <ListItemText primary="Workspace Templates" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton onClick={() => { navigate("/business-ops-hub/tool-guides"); setMobileOpen(false); }}>
            <ListItemText primary="Tool Guides" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open sidebar"
          edge="start"
          onClick={() => setMobileOpen(true)}
          sx={{ position: "fixed", top: 8, left: 8, zIndex: 1300 }}
        >
          <MenuIcon />
        </IconButton>
      )}
      {/* Sidebar drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
          display: { xs: isMobile ? "block" : "none", md: "block" },
        }}
        anchor="left"
        ModalProps={{
          keepMounted: true,
        }}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>
    </>
  );
};

export default BusinessOpsSidebar;
