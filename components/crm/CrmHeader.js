import { signOut } from "next-auth/react";
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, useTheme, useColorScheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

export default function CrmHeader({ handleDrawerToggle, drawerWidth }) {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  const isDarkTheme = colorScheme.mode === colorScheme.darkColorScheme;

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

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Панель управления
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton color="inherit" edge="start" onClick={handleChangeColorScheme} sx={{ mr: 2 }}>
            {isDarkTheme ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <Avatar sx={{ bgcolor: "secondary.main" }}>A</Avatar>
          <IconButton color="inherit" onClick={() => signOut({ callbackUrl: "/crm/login" })} size="small">
            Выйти
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
