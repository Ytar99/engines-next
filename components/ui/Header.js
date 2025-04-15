import Link from "next/link";
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export default function Header() {
  return (
    <AppBar position="static" variant="outlined" sx={{ backgroundColor: "background.main" }}>
      <Toolbar sx={{ justifyContent: "space-between", gap: 4 }}>
        {/* Логотип */}
        <Typography
          variant="h6"
          component={Link}
          href="/catalog"
          sx={{
            color: "primary.contrastText",
            textDecoration: "none",
            fontWeight: "bold",
            "&:hover": { opacity: 0.8 },
          }}
        >
          АвтоДВС
        </Typography>

        {/* Навигация */}
        <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "flex-end", alignItems: "center", gap: 4 }}>
          <Button
            component={Link}
            href="/catalog"
            color="inherit"
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            Каталог
          </Button>

          <Button
            component={Link}
            href="/crm"
            color="inherit"
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            Админ-панель
          </Button>
        </Box>

        {/* Корзина */}
        <IconButton
          component={Link}
          href="/cart"
          color="inherit"
          sx={{
            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            marginLeft: 2,
          }}
        >
          <ShoppingCartIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
