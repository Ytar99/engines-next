"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { USER_ROLES } from "@/app/_constants";

const navRoutes = [
  { path: "/admin/crm/users", label: "Пользователи", allowedRoles: [USER_ROLES.ADMIN] },
  { path: "/admin/crm/orders", label: "Заказы", allowedRoles: [] },
  { path: "/admin/crm/products", label: "Продукты", allowedRoles: [USER_ROLES.ADMIN] },
  { path: "/", label: "Каталог", allowedRoles: [USER_ROLES.GUEST] },
];

const Header = (props) => {
  const { me } = props;

  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (res.ok) {
      router.push("/admin/login"); // Замените на адрес вашей страницы входа
    } else {
      console.error("Logout failed"); // Обработка ошибки при выходе
    }
  };

  return (
    <header>
      <nav>
        <div className="menu">
          {navRoutes.map((item) => {
            if (
              item.allowedRoles.length &&
              !item.allowedRoles.includes(USER_ROLES.GUEST) &&
              !item.allowedRoles.includes(me?.role)
            ) {
              return null;
            }

            return (
              <Link key={`nav-item-${item.path}`} className="menu-item" href={item.path}>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        Выйти
      </button>
    </header>
  );
};

export default Header;
