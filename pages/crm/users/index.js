// pages/crm/users/index.js
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import { Button, Box } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

import CrmLayout from "@/components/layouts/CrmLayout";

import { DataTableFilters } from "@/components/crm/common/DataTableFilters";
import { DataTable } from "@/components/crm/common/DataTable";
import { ConfirmationDialog } from "@/components/crm/common/ConfirmationDialog";
import { useFetchForTable } from "@/lib/hooks/useFetchForTable";
import userService from "@/lib/api/userService";
import { useEntity } from "@/lib/hooks/useEntity";
import { formatPhone } from "@/lib/utils/formatter";

const initialFilters = { enabled: true };

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
  { field: "phone", header: "Телефон", render: (_, row) => formatPhone(row.phone) },
  { field: "role", header: "Роль" },
  {
    field: "enabled",
    header: "Статус",
    render: (value) => (value ? "Активен" : "Неактивен"),
  },
];

const UsersPage = () => {
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const rows = useFetchForTable({ initialFilters, getAll: userService.getAll });
  const deletedEntity = useEntity(userService);

  const [_, cancelDebounce] = useDebounce(() => rows.setSearch(searchTerm), 800, [searchTerm]);

  const handleDelete = () => {
    deletedEntity.deleteItem(selectedForDelete?.id, () => {
      rows.refetch();
    });

    setSelectedForDelete(null);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  useEffect(() => {
    cancelDebounce();
  }, [cancelDebounce]);

  return (
    <CrmLayout>
      {rows.error && <div>Ошибка товаров: {rows.error}</div>}

      <DataTableFilters
        filtersConfig={filtersConfig}
        initialFilters={initialFilters}
        searchTerm={searchTerm}
        onFilterChange={rows.setFilters}
        onSearchChange={handleSearchChange}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          href="/crm/users/create"
          disabled={rows.loading}
        >
          Создать пользователя
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={rows.data}
        pagination={rows.pagination}
        loading={rows.loading || deletedEntity.loading}
        getEditUrl={(id) => `/crm/users/${id}/edit`}
        onPageChange={(newPage) => rows.setPage(newPage + 1)}
        onRowsPerPageChange={rows.setLimit}
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
