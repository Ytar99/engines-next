// pages/crm/users/index.js
import { useState, useEffect, useCallback } from "react";
import { getSession } from "next-auth/react";
import { Box, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useDebounce } from "react-use";
import { toast } from "react-toastify";

import prisma from "@/lib/prisma";
import CrmLayout from "@/components/layouts/CrmLayout";
import { UserFilters } from "@/components/crm/Users/UsersFilters";
import { UserTable } from "@/components/crm/Users/UsersTable";
import { DeleteConfirmationDialog } from "@/components/crm/Users/DeleteConfirmationDialog";

// Основной компонент страницы пользователей
const UsersPage = ({ initialUsers, total, initialFilters }) => {
  const [users, setUsers] = useState(initialUsers);
  const [filters, setFilters] = useState(initialFilters);
  const [searchTerm, setSearchTerm] = useState(initialFilters.search);
  const [totalUsers, setTotalUsers] = useState(total);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  // Задержка обновления поискового фильтра
  useDebounce(
    () => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
      setPage(0);
    },
    800,
    [searchTerm]
  );

  // Функция загрузки пользователей
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: page + 1,
      limit: rowsPerPage,
      ...filters,
    }).toString();
    const res = await fetch(`/api/crm/users?${query}`);
    const data = await res.json();
    setUsers(data.users);
    setTotalUsers(data.total);
    setLoading(false);
  }, [filters, page, rowsPerPage]);

  // Обработчик изменения фильтров
  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFilters((prev) => ({ ...prev, [name]: newValue }));
    setPage(0);
  };

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Обработчик клика по кнопке удаления
  const handleDeleteClick = (userId) => {
    const user = users.find((u) => u.id === userId);
    setSelectedUser(user);
  };

  // Обработчик подтверждения удаления
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/crm/users?userId=${selectedUser.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Пользователь успешно удален");
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.message || "Ошибка при удалении пользователя");
      }
    } catch (error) {
      toast.error("Ошибка сети. Попробуйте позже");
    } finally {
      setSelectedUser(null);
    }
  };

  // Загрузка пользователей при изменении фильтров или страницы
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <CrmLayout>
      <UserFilters
        filters={filters}
        searchTerm={searchTerm}
        handleFilterChange={handleFilterChange}
        handleSearchChange={handleSearchChange}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button variant="contained" color="success" startIcon={<AddIcon />} href="/crm/users/create" disabled={loading}>
          Создать пользователя
        </Button>
      </Box>

      <UserTable
        users={users}
        totalUsers={totalUsers}
        page={page}
        setPage={setPage}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        loading={loading}
        handleDeleteClick={handleDeleteClick}
      />
      <DeleteConfirmationDialog
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleConfirmDelete={handleConfirmDelete}
      />
    </CrmLayout>
  );
};

// Серверная загрузка начальных данных
export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) return { redirect: { destination: "/crm/login", permanent: false } };

  const initialFilters = {
    role: context.query.role || "",
    search: context.query.search || "",
    enabled: context.query.enabled === "false" ? false : true,
  };

  const where = {
    enabled: initialFilters.enabled,
    role: initialFilters.role || undefined,
    OR: initialFilters.search
      ? [
          { email: { contains: initialFilters.search } },
          { firstname: { contains: initialFilters.search } },
          { lastname: { contains: initialFilters.search } },
        ]
      : undefined,
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: 0,
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    props: {
      initialUsers: JSON.parse(JSON.stringify(users)),
      total,
      initialFilters,
    },
  };
}

export default UsersPage;
