import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Receipt as OrdersIcon,
  Engineering as EnginesIcon,
  Groups as GroupsIcon,
  ShoppingCart as CartIcon,
} from "@mui/icons-material";

export const routes = [
  // Sidebar
  { path: "/crm/dashboard", allowedRoles: ["ADMIN", "USER"], navItem: { text: "Дашборд", icon: <DashboardIcon /> } },
  { path: "/crm/orders", allowedRoles: ["ADMIN", "USER"], navItem: { text: "Заказы", icon: <OrdersIcon /> } },
  { navItem: { divider: true } },
  { path: "/crm/users", allowedRoles: ["ADMIN"], navItem: { text: "Пользователи", icon: <PeopleIcon /> } },
  { path: "/crm/products", allowedRoles: ["ADMIN"], navItem: { text: "Товары", icon: <InventoryIcon /> } },
  { path: "/crm/engines", allowedRoles: ["ADMIN"], navItem: { text: "Двигатели", icon: <EnginesIcon /> } },
  { path: "/crm/clients", allowedRoles: ["ADMIN"], navItem: { text: "Клиенты", icon: <GroupsIcon /> } },
  { navItem: { divider: true } },
  { path: "/catalog", navItem: { text: "Каталог", icon: <CartIcon /> } },

  // API
  { path: "/api/crm/users", allowedRoles: ["ADMIN"] },
  { path: "/api/crm/products", allowedRoles: ["ADMIN"] },
  { path: "/api/crm/engines", allowedRoles: ["ADMIN"] },
  { path: "/api/crm/clients", allowedRoles: ["ADMIN"] },
  { path: "/api/crm/orders", allowedRoles: ["ADMIN", "USER"] },
];
