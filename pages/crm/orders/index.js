// pages/crm/orders/index.js
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDebounce } from "react-use";
import { Button, Box } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

import { useOrder } from "@/lib/hooks/useOrder";
import CrmLayout from "@/components/layouts/CrmLayout";
import { DataTableFilters } from "@/components/crm/common/DataTableFilters";
import { DataTable } from "@/components/crm/common/DataTable";
import { ConfirmationDialog } from "@/components/crm/common/ConfirmationDialog";
import OrderService from "@/lib/api/orders";
import { useFetchForTable } from "@/lib/hooks/useFetchForTable";

const initialFilters = {};

const OrdersPage = () => {
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const orders = useFetchForTable({ initialFilters, getAll: OrderService.getAll });
  const deleteOrder = useOrder(initialFilters);

  const [_, cancelDebounce] = useDebounce(
    () => {
      orders.setSearch(searchTerm); // Передаем новое значение поиска в хук
    },
    800,
    [searchTerm]
  );

  const filtersConfig = [];

  const columns = [
    { field: "id", header: "ID" },
    { field: "status", header: "Статус" },
    { field: "createdAt", header: "Создан" },
    { field: "updatedAt", header: "Изменен" },
  ];

  const handleDelete = () => {
    deleteOrder.deleteEngine(selectedForDelete?.id, () => {
      toast.success("Заказ удалён");
      orders.refetch();
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
        onFilterChange={orders.setFilters}
        onSearchChange={handleSearchChange}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          href="/crm/orders/create"
          disabled={orders.loading}
        >
          Создать заказ
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={orders.data}
        pagination={orders.pagination}
        loading={orders.loading || deleteOrder.loading}
        getEditUrl={(id) => `/crm/orders/${id}/edit`}
        onPageChange={orders.setPage}
        onRowsPerPageChange={orders.setLimit}
        onDelete={setSelectedForDelete}
      />

      <ConfirmationDialog
        open={!!selectedForDelete}
        onClose={() => setSelectedForDelete(null)}
        onConfirm={handleDelete}
        contentText={`Вы уверены, что хотите удалить заказ "[${selectedForDelete?.id}]"?`}
      />
    </CrmLayout>
  );
};

export default OrdersPage;
