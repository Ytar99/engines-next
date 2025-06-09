// pages/crm/orders/index.js
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "react-use";
import { Box, Button, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { DataTableFilters } from "@/components/crm/common/DataTableFilters";
import { DataTable } from "@/components/crm/common/DataTable";
import { ConfirmationDialog } from "@/components/crm/common/ConfirmationDialog";
import { Add as AddIcon, Info as InfoIcon } from "@mui/icons-material";
import { useFetchForTable } from "@/lib/hooks/useFetchForTable";
import orderService from "@/lib/api/orderService";
import { useEntity } from "@/lib/hooks/useEntity";
import { STATUS_OPTIONS, STATUS_OPTIONS_OBJ } from "@/lib/constants/order";
import { formatCurrency, formatPhone } from "@/lib/utils/formatter";

const initialFilters = {
  status: "",
  customerEmail: "",
  dateRange: [null, null],
  search: "",
};

const handleTransformFilters = (filters) => {
  return {
    limit: filters.limit,
    page: filters.page,
    status: filters.status,
    customerEmail: filters.customerEmail,
    search: filters.search,
    startDate: filters.dateRange[0]?.toISOString(),
    endDate: filters.dateRange[1]?.toISOString(),
  };
};

function ProductsTooltip({ products }) {
  return (
    <Tooltip
      placement="right"
      arrow
      title={
        <Box>
          {products.map((product) => (
            <Typography variant="body2" key={`product-tooltip-${product.id}`} noWrap>
              ID: {product.id} – {product.quantity} шт. – [{product.article}] {product.name}
            </Typography>
          ))}
        </Box>
      }
    >
      <IconButton size="small" onMouseEnter={() => {}}>
        <InfoIcon sx={{ width: "1rem", height: "1rem" }} />
      </IconButton>
    </Tooltip>
  );
}

const OrdersPage = () => {
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const orders = useFetchForTable({
    initialFilters,
    getAll: orderService.getAll,
    transformFilters: handleTransformFilters,
  });

  const deletedEntity = useEntity(orderService);

  const [_, cancelDebounce] = useDebounce(() => orders.setSearch(searchTerm), 800, [searchTerm]);

  const filtersConfig = useMemo(() => {
    return [
      {
        type: "select",
        name: "status",
        label: "Статус",
        options: [{ value: "", label: "Все" }, ...STATUS_OPTIONS],
        sx: { minWidth: 180 },
      },
      {
        type: "text",
        name: "customerEmail",
        label: "Email покупателя",
        value: orders.filters?.customerEmail,
      },
      {
        type: "dateRange",
        name: "dateRange",
        label: "Период",
        value: orders.filters?.dateRange,
      },
    ];
  }, [orders]);

  const columns = useMemo(
    () => [
      {
        field: "id",
        header: "ID",
        width: 80,
        headerAlign: "center",
        align: "center",
      },
      {
        field: "status",
        header: "Статус",
        width: 100,
        render: (value) => (
          <Chip
            size="small"
            label={STATUS_OPTIONS_OBJ[value]?.label || value}
            color={STATUS_OPTIONS_OBJ[value]?.color || "default"}
            sx={{ width: "100%" }}
          />
        ),
      },
      {
        field: "customer",
        header: "Покупатель",
        minWidth: 200,
        render: (_, row) => (
          <Box>
            <Typography variant="body2">{row.customer?.email}</Typography>
            <Typography variant="caption" color="textSecondary">
              {formatPhone(row.customer?.phone) || "Телефон не указан"}
            </Typography>
          </Box>
        ),
      },

      {
        field: "products",
        header: "Товары",
        width: 120,
        headerAlign: "left",
        render: (_, row) => (
          <Box textAlign="left">
            <Typography variant="body2" noWrap>
              {`${row.products.length} товар(-а)`}
            </Typography>
            <Typography variant="caption" color="textSecondary" noWrap>
              {`${row.productsCount} шт.`}
              <ProductsTooltip products={row.products} />
            </Typography>
          </Box>
        ),
      },
      {
        field: "total",
        header: "Сумма",
        width: 140,
        headerAlign: "right",
        align: "right",
        render: (_, row) => formatCurrency(row.total),
      },
      {
        field: "createdAt",
        header: "Создан",
        width: 160,
        headerAlign: "right",
        align: "right",
        render: (value) => new Date(value).toLocaleString("ru-RU"),
      },
      {
        field: "updatedAt",
        header: "Изменен",
        width: 160,
        headerAlign: "right",
        align: "right",
        render: (value) => new Date(value).toLocaleString("ru-RU"),
      },
    ],
    []
  );

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  const handleResetFilters = (e) => {
    orders.setFilters(initialFilters);
    setSearchTerm("");
  };

  const handleDelete = () => {
    deletedEntity.deleteItem(selectedForDelete.id, orders.refetch);
    setSelectedForDelete(null);
  };

  useEffect(() => {
    cancelDebounce();
  }, [cancelDebounce]);

  return (
    <CrmLayout>
      <Box mb={3}>
        <DataTableFilters
          filtersConfig={filtersConfig}
          initialFilters={initialFilters}
          searchTerm={searchTerm}
          onResetFilters={handleResetFilters}
          onFilterChange={(filters) => orders.setFilters(filters)}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Поиск по ID заявки..."
        />
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" color="textSecondary">
          Найдено: {orders.pagination.total}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} href="/crm/orders/create" sx={{ minWidth: 160 }}>
          Новая заявка
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={orders.data}
        pagination={orders.pagination}
        loading={orders.loading || deletedEntity.loading}
        onPageChange={(page) => orders.setPage(page + 1)}
        onRowsPerPageChange={orders.setLimit}
        getEditUrl={(id) => `/crm/orders/${id}/edit`}
        getOpenUrl={(id) => `/crm/orders/${id}`}
        onDelete={setSelectedForDelete}
        sx={{
          "& .MuiDataGrid-cell": {
            py: 0.5,
            display: "flex",
            alignItems: "center",
          },
          "& .MuiDataGrid-columnHeader": {
            bgcolor: "background.default",
          },
        }}
      />

      <ConfirmationDialog
        open={!!selectedForDelete}
        onClose={() => setSelectedForDelete(null)}
        onConfirm={handleDelete}
        contentText={`Удалить заявку #${selectedForDelete?.id}?`}
      />
    </CrmLayout>
  );
};

export default OrdersPage;
