// pages/crm/users/index.js

import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "react-use";
import { toast } from "react-toastify";
import { Box, Button } from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { DataTableFilters } from "@/components/crm/common/DataTableFilters";
import { DataTable } from "@/components/crm/common/DataTable";
import { ConfirmationDialog } from "@/components/crm/common/ConfirmationDialog";
import { useProducts } from "@/lib/hooks/useProducts";
import { useProduct } from "@/lib/hooks/useProduct";
import { useAllEngines } from "@/lib/hooks/useAllEngines";
import { Add as AddIcon } from "@mui/icons-material";

function getSelectedProductString(product) {
  if (!product) {
    return "";
  }

  return `[${product.article}] ${product.name}`;
}

const initialFilters = { engineId: "" };

const ProductsPage = () => {
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const products = useProducts();
  const engines = useAllEngines();
  const deletedProduct = useProduct(initialFilters);

  const [_, cancelDebounce] = useDebounce(
    () => {
      products.setSearch(searchTerm); // Передаем новое значение поиска в хук
    },
    800,
    [searchTerm]
  );

  const enginesOptions = engines?.engines.map((engine) => ({ value: engine.id, label: engine.name }));

  const filtersConfig = useMemo(
    () => [
      {
        type: "select",
        name: "engineId",
        label: "Двигатель",
        options: [{ value: "", label: "Все" }, ...enginesOptions],
      },
    ],
    [enginesOptions]
  );

  const columns = [
    { field: "article", header: "Артикул" },
    { field: "name", header: "Название" },
    // { field: "description", header: "Описание" },
    {
      field: "engineId",
      header: "Двигатель",
      render: (value) => engines.engines.find((engine) => engine.id === value)?.name,
    },
    {
      field: "price",
      header: "Цена",
      render: (value) => `${value.toLocaleString()} ₽`,
    },
    { field: "count", header: "Остаток" },
  ];

  const handleDelete = () => {
    deletedProduct.deleteProduct(selectedForDelete?.id, () => {
      toast.success("Продукт удалён");
      products.refetch();
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
      {products.error && <div>Ошибка продуктов: {products.error}</div>}
      {engines.error && <div>Ошибка двигателей: {engines.error}</div>}

      <DataTableFilters
        filtersConfig={filtersConfig}
        initialFilters={initialFilters}
        searchTerm={searchTerm}
        onFilterChange={products.setFilters}
        onSearchChange={handleSearchChange} // Передаем обработчик изменений поиска
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          href="/crm/products/create"
          disabled={products.loading}
        >
          Создать продукта
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={products.products}
        pagination={products.pagination}
        loading={products.loading || deletedProduct.loading}
        getEditUrl={(productId) => `/crm/products/${productId}/edit`}
        onPageChange={products.setPage}
        onRowsPerPageChange={products.setLimit}
        onDelete={setSelectedForDelete}
      />
      <ConfirmationDialog
        open={!!selectedForDelete}
        onClose={() => setSelectedForDelete(null)}
        onConfirm={handleDelete}
        contentText={`Вы уверены, что хотите удалить продукт "${getSelectedProductString(selectedForDelete)}"?`}
      />
    </CrmLayout>
  );
};

export default ProductsPage;
