import { List, ListItem, ListItemIcon, ListItemText, Divider, Toolbar, ListItemButton } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { routes } from "@/lib/constants/routes";

function filterMenuItems(routes, userRole) {
  const result = [];
  let prevWasDivider = false;

  // Первый проход: фильтрация и удаление последовательных разделителей
  for (const route of routes) {
    if (!route?.navItem) continue;

    const isAllowed = !route.navItem.divider && (!route.allowedRoles || route.allowedRoles.includes(userRole));

    if (route.navItem.divider || isAllowed) {
      const item = { ...route.navItem };
      if (route.path) item.path = route.path;

      // Пропускаем разделители, если предыдущий тоже был разделителем
      if (item.divider) {
        if (!prevWasDivider) {
          result.push(item);
          prevWasDivider = true;
        }
      } else {
        result.push(item);
        prevWasDivider = false;
      }
    }
  }

  // Второй проход: удаление разделителей в конце
  let lastValidIndex = -1;
  for (let i = result.length - 1; i >= 0; i--) {
    if (!result[i].divider) {
      lastValidIndex = i;
      break;
    }
  }

  return lastValidIndex === -1 ? [] : result.slice(0, lastValidIndex + 1);
}

export default function CrmSidebar({ handleDrawerClose }) {
  const router = useRouter();
  const session = useSession();

  const filteredMenuItems = filterMenuItems(routes, session?.data?.user?.role);

  return (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {filteredMenuItems.map((item, idx) => {
          if (item?.divider) {
            return <Divider key={`sidebar-divider-${idx}`} sx={{ my: 1 }} />;
          }

          return (
            <Link href={item.path} passHref key={`sidebar-item-${item.text}-${idx}`} legacyBehavior>
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
          );
        })}
      </List>
    </div>
  );
}
