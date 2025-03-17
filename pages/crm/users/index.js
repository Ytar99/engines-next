// pages/crm/users/index.js
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDebounce } from "react-use";
import { Button, Box } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

import CrmLayout from "@/components/layouts/CrmLayout";

import { DataTableFilters } from "@/components/crm/common/DataTableFilters";
import { DataTable } from "@/components/crm/common/DataTable";
import { ConfirmationDialog } from "@/components/crm/common/ConfirmationDialog";
import { useUser } from "@/lib/hooks/useUser";
import UserService from "@/lib/api/users";
import { useFetchForTable } from "@/lib/hooks/useFetchForTable";

const initialFilters = { enabled: true };

const UsersPage = () => {
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const users = useFetchForTable({ initialFilters, getAll: UserService.getAll });
  const deletedUser = useUser();

  const filtersConfig = [
    {
      type: "select",
      name: "role",
      label: "Роль",
      options: [
        { value: "", label: "Все" },
        { value: "ADMIN", label: "Админ" },
        { value: "USER", label: "Пользователь" },
      ],
    },
    {
      type: "checkbox",
      name: "enabled",
      label: "Только активные",
      checked: true,
    },
  ];

  const columns = [
    { field: "id", header: "ID" },
    {
      field: "name",
      header: "Имя",
      render: (_, row) => [row.firstname, row.lastname].filter(Boolean).join(" "),
    },
    { field: "email", header: "Email" },
    { field: "role", header: "Роль" },
    {
      field: "enabled",
      header: "Статус",
      render: (value) => (value ? "Активен" : "Неактивен"),
    },
  ];

  const [_, cancelDebounce] = useDebounce(
    () => {
      users.setSearch(searchTerm); // Передаем новое значение поиска в хук
    },
    800,
    [searchTerm]
  );

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  const handleDelete = () => {
    deletedUser.deleteUser(selectedForDelete?.id, () => {
      toast.success("Пользователь удалён");
      users.refetch();
    });

    setSelectedForDelete(null);
  };

  useEffect(() => {
    cancelDebounce();
  }, [cancelDebounce]);

  return (
    <CrmLayout>
      <DataTableFilters
        filtersConfig={filtersConfig}
        initialFilters={initialFilters}
        searchTerm={searchTerm}
        onFilterChange={users.setFilters}
        onSearchChange={handleSearchChange}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          href="/crm/users/create"
          disabled={users.loading}
        >
          Создать пользователя
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={users.data}
        pagination={users.pagination}
        loading={users.loading || deletedUser.loading}
        getEditUrl={(userId) => {
          return `/crm/users/${userId}/edit`;
        }}
        onPageChange={(newPage) => users.setPage(newPage + 1)}
        onRowsPerPageChange={users.setLimit}
        onDelete={setSelectedForDelete}
      />

      <ConfirmationDialog
        open={!!selectedForDelete}
        onClose={() => setSelectedForDelete(null)}
        onConfirm={handleDelete}
        contentText={`Вы уверены, что хотите удалить пользователя #${selectedForDelete?.id} - [${selectedForDelete?.role}] ${selectedForDelete?.email}?`}
      />
    </CrmLayout>
  );
};

export default UsersPage;
