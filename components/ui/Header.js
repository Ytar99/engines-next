import Link from "next/link";
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export default function Header() {
  return (
    <AppBar position="static" variant="outlined" sx={{ backgroundColor: "background.main" }}>
      <Toolbar sx={{ justifyContent: "space-between", gap: 4 }}>
        {/* Логотип */}
        <Link href="/catalog" passHref legacyBehavior>
          <Typography
            variant="h6"
            component="a"
            sx={{
              color: "primary.contrastText",
              textDecoration: "none",
              fontWeight: "bold",
              "&:hover": { opacity: 0.8 },
            }}
          >
            АвтоДВС
          </Typography>
        </Link>

        {/* Навигация */}
        <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "flex-end", alignItems: "center", gap: 4 }}>
          <Link href="/catalog" passHref legacyBehavior>
            <Button
              color="inherit"
              sx={{
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              Каталог
            </Button>
          </Link>

          <Link href="/crm" passHref legacyBehavior>
            <Button
              color="inherit"
              sx={{
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              Админ-панель
            </Button>
          </Link>
        </Box>

        {/* Корзина */}
        <Link href="/cart" passHref legacyBehavior>
          <IconButton
            color="inherit"
            sx={{
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              marginLeft: 2,
            }}
          >
            <ShoppingCartIcon />
          </IconButton>
        </Link>
      </Toolbar>
    </AppBar>
  );
}
