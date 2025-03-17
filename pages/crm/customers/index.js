import { useEffect, useState } from "react";
import { Button, Box } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { DataTable } from "@/components/crm/common/DataTable";
import { DataTableFilters } from "@/components/crm/common/DataTableFilters";

import { ConfirmationDialog } from "@/components/crm/common/ConfirmationDialog";
import { useFetchForTable } from "@/lib/hooks/useFetchForTable";
import CustomerService from "@/lib/api/customers";
import { useDebounce } from "react-use";
import { useCustomer } from "@/lib/hooks/useCustomer";

const initialFilters = {};

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const customers = useFetchForTable({ initialFilters, getAll: CustomerService.getAll });
  const deletedCustomer = useCustomer();

  const [_, cancelDebounce] = useDebounce(
    () => {
      customers.setSearch(searchTerm);
    },
    800,
    [searchTerm]
  );

  const filtersConfig = [];

  const columns = [
    { field: "id", header: "ID" },
    {
      field: "name",
      header: "Имя",
      render: (_, row) => [row.firstname, row.lastname].filter(Boolean).join(" ") || "-",
    },
    { field: "email", header: "Email" },
    { field: "phone", header: "Телефон" },
    {
      field: "createdAt",
      header: "Создан",
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  const handleDelete = () => {
    deletedCustomer.deleteCustomer(selectedForDelete?.id, () => {
      customers.refetch();
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
      <DataTableFilters
        filtersConfig={filtersConfig}
        initialFilters={initialFilters}
        searchTerm={searchTerm}
        onFilterChange={customers.setFilters}
        onSearchChange={handleSearchChange}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          href="/crm/customers/create"
          disabled={customers.loading || deletedCustomer.loading}
        >
          Создать покупателя
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={customers.data}
        pagination={customers.pagination}
        loading={customers.loading}
        getEditUrl={(id) => `/crm/customers/${id}/edit`}
        onPageChange={customers.setPage}
        onRowsPerPageChange={customers.setLimit}
        onDelete={setSelectedForDelete}
      />

      <ConfirmationDialog
        open={!!selectedForDelete}
        onClose={() => setSelectedForDelete(null)}
        onConfirm={handleDelete}
        contentText={`Вы уверены, что хотите удалить покупателя "[${selectedForDelete?.id}] ${selectedForDelete?.email}"?`}
      />
    </CrmLayout>
  );
};

export default CustomersPage;
