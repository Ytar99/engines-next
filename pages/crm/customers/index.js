import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import { Button, Box } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { DataTableFilters } from "@/components/crm/common/DataTableFilters";
import { DataTable } from "@/components/crm/common/DataTable";
import { ConfirmationDialog } from "@/components/crm/common/ConfirmationDialog";
import { useFetchForTable } from "@/lib/hooks/useFetchForTable";
import { useEntity } from "@/lib/hooks/useEntity";
import customerService from "@/lib/api/customerService";

const initialFilters = {};

const columns = [
  { field: "id", header: "ID" },
  {
    field: "name",
    header: "Имя",
    render: (_, row) => [row.firstname, row.lastname].filter(Boolean).join(" ") || "—",
  },
  { field: "email", header: "Email" },
  { field: "phone", header: "Телефон" },
  {
    field: "createdAt",
    header: "Создан",
    render: (value) => new Date(value).toLocaleString(),
  },
  {
    field: "updatedAt",
    header: "Изменен",
    render: (value) => new Date(value).toLocaleString(),
  },
];

const CustomersPage = () => {
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const rows = useFetchForTable({ initialFilters, getAll: customerService.getAll });
  const deletedEntity = useEntity(customerService);

  const [_, cancelDebounce] = useDebounce(() => rows.setSearch(searchTerm), 800, [searchTerm]);

  const handleDelete = () => {
    deletedEntity.deleteItem(selectedForDelete?.id, () => {
      rows.refetch();
    });
    setSelectedForDelete(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    cancelDebounce();
  }, [cancelDebounce]);

  return (
    <CrmLayout>
      {rows.error && <div>Ошибка покупателей: {rows.error}</div>}

      <DataTableFilters
        filtersConfig={[]}
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
          href="/crm/customers/create"
          disabled={rows.loading}
        >
          Создать покупателя
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={rows.data}
        pagination={rows.pagination}
        loading={rows.loading || deletedEntity.loading}
        getEditUrl={(id) => `/crm/customers/${id}/edit`}
        onPageChange={(newPage) => rows.setPage(newPage + 1)}
        onRowsPerPageChange={rows.setLimit}
        onDelete={setSelectedForDelete}
      />

      <ConfirmationDialog
        open={!!selectedForDelete}
        onClose={() => setSelectedForDelete(null)}
        onConfirm={handleDelete}
        contentText={`Вы уверены, что хотите удалить покупателя #${selectedForDelete?.id} - ${selectedForDelete?.email}?`}
      />
    </CrmLayout>
  );
};

export default CustomersPage;
