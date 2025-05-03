import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  Box,
  Button,
  Typography,
  Badge,
  useColorScheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Link from "next/link";
import { useState } from "react";
import useCart from "@/lib/hooks/useCart";

const menuItems = [
  { title: "Статус заказа", path: "/check-order" },
  { title: "Каталог", path: "/catalog" },
  { title: "Админ-панель", path: "/crm" },
  // { title: "Контакты", path: "/contacts" },
];

export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const colorScheme = useColorScheme();
  const colorMode = colorScheme.mode || "light";
  const isDarkTheme = colorMode === colorScheme.darkColorScheme;
  const cart = useCart(); // Хук для получения количества товаров

  const toggleMenu = () => setOpenMenu(!openMenu);

  const handleChangeColorScheme = () => {
    colorScheme.setMode(isDarkTheme ? colorScheme.lightColorScheme : colorScheme.darkColorScheme);
  };

  const ThemeToggleButton = () => (
    <IconButton onClick={handleChangeColorScheme}>
      {colorMode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );

  const CartButton = () => (
    <IconButton component={Link} href="/cart" size="large" sx={{ ml: 2, p: 1 }}>
      <Badge badgeContent={cart.count} color="secondary">
        <ShoppingCartIcon />
      </Badge>
    </IconButton>
  );

  const renderDesktopMenu = () => (
    <Box sx={{ display: "flex", alignItems: "center", ml: 4 }}>
      {menuItems.map((item) => (
        <Button
          key={item.path}
          component={Link}
          href={item.path}
          sx={{
            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            borderRadius: 1,
            mx: 1,
          }}
        >
          {item.title}
        </Button>
      ))}
      <ThemeToggleButton />
      <CartButton />
    </Box>
  );

  const renderMobileMenu = () => (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <CartButton />
        <ThemeToggleButton />
        <IconButton edge="start" aria-label="menu" onClick={toggleMenu}>
          <MenuIcon />
        </IconButton>
      </Box>

      <Drawer
        anchor="right"
        open={openMenu}
        onClose={toggleMenu}
        PaperProps={{
          sx: {
            width: 240,
            bgcolor: "background.paper",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Меню</Typography>
          <IconButton onClick={toggleMenu}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.path}
              component={Link}
              href={item.path}
              onClick={toggleMenu}
              sx={{
                "&:hover": { backgroundColor: "action.hover" },
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <ListItemText primary={item.title} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: "background.paper" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            color: "text.primary",
            textDecoration: "none",
            "&:hover": { color: "primary.main" },
          }}
        >
          АвтоДВС
        </Typography>

        {isMobile ? renderMobileMenu() : renderDesktopMenu()}
      </Toolbar>
    </AppBar>
  );
}
