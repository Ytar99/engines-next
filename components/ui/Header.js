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
  TextField,
  InputAdornment,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import SearchIcon from "@mui/icons-material/Search";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import useCart from "@/lib/hooks/useCart";
import { useRouter } from "next/navigation";

const menuItems = [
  { title: "Статус заказа", path: "/check-order" },
  { title: "Каталог", path: "/catalog" },
  { title: "Админ-панель", path: "/crm" },
];

// Новый компонент SearchBar
const SearchBar = ({ onSearch, fullWidth = false, initialFocus = false }) => {
  const [searchText, setSearchText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [initialFocus]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (searchText.trim()) {
      onSearch(searchText.trim());
      setSearchText("");
    }
  };

  return (
    <TextField
      inputRef={inputRef}
      size="small"
      placeholder="Поиск..."
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      onKeyDown={handleKeyDown}
      fullWidth={fullWidth}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={handleSubmit} edge="end" aria-label="Поиск" sx={{ mr: 0 }}>
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        flexGrow: 1,
        minWidth: 150,
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          backgroundColor: "action.hover",
          pr: 0,
        },
        "& .MuiOutlinedInput-input": {
          py: "8.5px",
          pl: 2,
        },
      }}
    />
  );
};

export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const colorScheme = useColorScheme();
  const colorMode = colorScheme.mode || "light";
  const isDarkTheme = colorMode === colorScheme.darkColorScheme;
  const cart = useCart();
  const router = useRouter();

  const toggleMenu = () => setOpenMenu(!openMenu);

  const handleChangeColorScheme = () => {
    colorScheme.setMode(isDarkTheme ? colorScheme.lightColorScheme : colorScheme.darkColorScheme);
  };

  const handleSearch = (searchText) => {
    router.push(`/search?text=${encodeURIComponent(searchText)}`);
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
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexGrow: 1,
        mx: 4,
        maxWidth: "calc(100% - 300px)",
      }}
    >
      <Box sx={{ flexGrow: 1, maxWidth: 800 }}>
        <SearchBar onSearch={handleSearch} fullWidth />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          gap: 0.5,
          ml: 2,
        }}
      >
        {menuItems.map((item) => (
          <Button
            key={item.path}
            component={Link}
            href={item.path}
            sx={{
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              borderRadius: 1,
              mx: 0.5,
              whiteSpace: "nowrap",
              fontSize: "0.875rem",
              px: 1.5,
              py: 0.5,
            }}
          >
            {item.title}
          </Button>
        ))}
        <ThemeToggleButton />
        <CartButton />
      </Box>
    </Box>
  );

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: "background.paper" }}>
      <Box>
        <Toolbar
          sx={{
            justifyContent: "space-between",
            flexWrap: "wrap",
            py: isMobile ? 1 : 0,
          }}
        >
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              color: "text.primary",
              textDecoration: "none",
              "&:hover": { color: "primary.main" },
              flexShrink: 0,
              my: 1,
              fontWeight: 700,
              fontSize: "1.25rem",
            }}
          >
            АвтоДВС
          </Typography>

          {!isMobile ? (
            renderDesktopMenu()
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CartButton />
              <ThemeToggleButton />
              <IconButton edge="start" aria-label="menu" onClick={toggleMenu}>
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>

        {isMobile && (
          <Box
            sx={{
              width: "100%",
              px: 2,
              pb: 1,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <SearchBar onSearch={handleSearch} fullWidth initialFocus={openMenu} />
          </Box>
        )}
      </Box>

      <Drawer
        anchor="right"
        open={openMenu}
        onClose={toggleMenu}
        PaperProps={{
          sx: {
            width: 280,
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
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6">Меню</Typography>
          <IconButton onClick={toggleMenu}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List sx={{ py: 1 }}>
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
                borderRadius: 1,
                mb: 0.5,
                py: 1.5,
              }}
            >
              <ListItemText primary={item.title} primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </AppBar>
  );
}
