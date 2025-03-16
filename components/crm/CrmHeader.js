import { signOut, useSession } from "next-auth/react";
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, useTheme, useColorScheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

export default function CrmHeader({ handleDrawerToggle, drawerWidth }) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDarkTheme = colorScheme.mode === colorScheme.darkColorScheme;

  const session = useSession();
  const userEmail = session?.data?.user?.email || "";
  const userRoleLetter = session?.data?.user?.role[0] || "";

  const handleChangeColorScheme = () => {
    colorScheme.setMode(isDarkTheme ? colorScheme.lightColorScheme : colorScheme.darkColorScheme);
  };

  return (
    <AppBar
      position="fixed"
      variant="outlined"
      sx={{
        ml: { sm: `${drawerWidth}px` },
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: "none" } }}>
          <MenuIcon />
        </IconButton>

        <Avatar sx={{ bgcolor: "secondary.main", mr: 1, width: 32, height: 32 }}>{userRoleLetter}</Avatar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontSize: { xs: "1rem", md: "1.5rem" } }}>
          {userEmail}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
          <IconButton color="inherit" onClick={handleChangeColorScheme}>
            {isDarkTheme ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <IconButton
            color="inherit"
            onClick={() => signOut({ callbackUrl: "/crm/login" })}
            size="small"
            sx={{ fontSize: { xs: "1rem", md: "1.5rem" } }}
          >
            Выйти
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
