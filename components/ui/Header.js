import Link from "next/link";
import { useTheme, useColorScheme } from "@mui/material";
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

export default function Header() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const colorMode = colorScheme.mode || "light";
  const isDarkTheme = colorMode === colorScheme.darkColorScheme;

  const handleChangeColorScheme = () => {
    colorScheme.setMode(isDarkTheme ? colorScheme.lightColorScheme : colorScheme.darkColorScheme);
  };

  return (
    <AppBar
      position="sticky"
      color="default"
      variant="outlined"
      sx={{
        backgroundColor: "background.paper",
        border: "none",
      }}
    >
      <Toolbar sx={{ gap: { xs: 2, md: 4 }, justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component={Link}
          href="/catalog"
          sx={{
            fontWeight: "bold",
            color: "text.primary",
            textDecoration: "none",
            "&:hover": { opacity: 0.8 },
            mr: { xs: 2, md: 4 },
          }}
        >
          АвтоДВС
        </Typography>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2, flexGrow: 1 }}>
          <Button
            component={Link}
            href="/catalog"
            color="inherit"
            sx={{
              color: "text.primary",
              fontWeight: 500,
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            Каталог
          </Button>

          <Button
            component={Link}
            href="/crm"
            color="inherit"
            sx={{
              color: "text.primary",
              fontWeight: 500,
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            Админ-панель
          </Button>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}>
          <IconButton
            color="inherit"
            onClick={handleChangeColorScheme}
            sx={{
              color: "text.secondary",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            {isDarkTheme ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <IconButton
            component={Link}
            href="/cart"
            color="inherit"
            sx={{
              color: "text.secondary",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            <ShoppingCartIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
