// components/layouts/CrmLayout.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Box, Drawer } from "@mui/material";
import CrmHeader from "@/components/crm/CrmHeader";
import CrmSidebar from "@/components/crm/CrmSidebar";
import AuthGuard from "@/components/crm/AuthGuard";
import { ERRORS } from "@/lib/constants/errors";

const drawerWidth = 240;

export default function CrmLayout({ children }) {
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  useEffect(() => {
    if (router.query.error) {
      toast.error(ERRORS[router?.query?.error] || ERRORS.Default);
    }
  }, [router]);

  return (
    <AuthGuard>
      <Box sx={{ display: "flex" }}>
        <CrmHeader drawerWidth={drawerWidth} handleDrawerToggle={handleDrawerToggle} />

        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
          {/* Mobile Drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onTransitionEnd={handleDrawerTransitionEnd}
            onClose={handleDrawerClose}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": { width: drawerWidth },
            }}
          >
            <CrmSidebar handleDrawerClose={handleDrawerClose} />
          </Drawer>

          {/* Desktop Drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": { width: drawerWidth },
            }}
            open
          >
            <CrmSidebar />
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            marginTop: { sm: "56px", xs: "64px" },
            marginBottom: { xs: "72px" },
          }}
        >
          {children}
        </Box>
      </Box>
    </AuthGuard>
  );
}
