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
  { path: "/crm/orders", allowedRoles: ["ADMIN", "USER"], navItem: { text: "Заявки", icon: <OrdersIcon /> } },
  { navItem: { divider: true } },
  { path: "/crm/users", allowedRoles: ["ADMIN"], navItem: { text: "Пользователи", icon: <PeopleIcon /> } },
  { path: "/crm/products", allowedRoles: ["ADMIN"], navItem: { text: "Товары", icon: <InventoryIcon /> } },
  { path: "/crm/categories", allowedRoles: ["ADMIN"], navItem: { text: "Категории товаров", icon: <InventoryIcon /> } },
  { path: "/crm/engines", allowedRoles: ["ADMIN"], navItem: { text: "Двигатели", icon: <EnginesIcon /> } },
  { path: "/crm/customers", allowedRoles: ["ADMIN"], navItem: { text: "Покупатели", icon: <GroupsIcon /> } },
  { navItem: { divider: true } },
  { path: "/catalog", navItem: { text: "Каталог", icon: <CartIcon /> } },

  // API
  { path: "/api/crm/categories", allowedRoles: ["ADMIN"] },
  { path: "/api/crm/users", allowedRoles: ["ADMIN"] },
  { path: "/api/crm/products/all", allowedRoles: ["ADMIN", "USER"] },
  { path: "/api/crm/products", allowedRoles: ["ADMIN"] },
  { path: "/api/crm/engines", allowedRoles: ["ADMIN"] },
  { path: "/api/crm/customers/search", allowedRoles: ["ADMIN", "USER"] },
  { path: "/api/crm/customers", allowedRoles: ["ADMIN"] },
  { path: "/api/crm/orders", allowedRoles: ["ADMIN", "USER"] },
];
