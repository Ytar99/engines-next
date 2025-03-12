import { List, ListItem, ListItemIcon, ListItemText, Divider, Toolbar, ListItemButton } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Receipt as OrdersIcon,
  Engineering as EnginesIcon,
} from "@mui/icons-material";

const menuItems = [
  { text: "Дашборд", icon: <DashboardIcon />, path: "/crm/dashboard" },
  { text: "Пользователи", icon: <PeopleIcon />, path: "/crm/users" },
  { text: "Товары", icon: <InventoryIcon />, path: "/crm/products" },
  { text: "Заказы", icon: <OrdersIcon />, path: "/crm/orders" },
  { text: "Двигатели", icon: <EnginesIcon />, path: "/crm/engines" },
];

export default function CrmSidebar({ handleDrawerClose }) {
  const router = useRouter();

  return (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <Link href={item.path} passHref key={item.text} legacyBehavior>
            <ListItem
              component="a"
              selected={router.pathname === item.path}
              onClick={handleDrawerClose} // Закрываем меню на мобильных
              sx={{ p: 0, color: "text.primary" }}
            >
              <ListItemButton selected={router.pathname === item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
    </div>
  );
}
