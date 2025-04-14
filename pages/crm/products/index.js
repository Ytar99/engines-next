// pages/crm/users/index.js
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "react-use";
import { Box, Button } from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { DataTableFilters } from "@/components/crm/common/DataTableFilters";
import { DataTable } from "@/components/crm/common/DataTable";
import { ConfirmationDialog } from "@/components/crm/common/ConfirmationDialog";
import { useAllEngines } from "@/lib/hooks/useAllEngines";
import { Add as AddIcon } from "@mui/icons-material";
import { useFetchForTable } from "@/lib/hooks/useFetchForTable";
import productService from "@/lib/api/productsService";
import { useEntity } from "@/lib/hooks/useEntity";
import { useAllCategories } from "@/lib/hooks/useAllCategories";

function getSelectedProductString(product) {
  if (!product) {
    return "";
  }

  return `[${product.article}] ${product.name}`;
}

const initialFilters = { engineId: "", categoryId: "" };

const ProductsPage = () => {
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const rows = useFetchForTable({ initialFilters, getAll: productService.getAll });
  const deletedEntity = useEntity(productService);

  const engines = useAllEngines();
  const categories = useAllCategories();

  const [_, cancelDebounce] = useDebounce(() => rows.setSearch(searchTerm), 800, [searchTerm]);

  const enginesOptions = useMemo(
    () => engines.data.map((engine) => ({ value: engine.id, label: engine.name })),
    [engines.data]
  );

  const categoriesOptions = useMemo(
    () => categories.data.map((category) => ({ value: category.id, label: category.name })),
    [categories.data]
  );

  const filtersConfig = useMemo(
    () => [
      {
        type: "select",
        name: "engineId",
        label: "Двигатель",
        options: [{ value: "", label: "Все" }, ...enginesOptions],
      },
      {
        type: "select",
        name: "categoryId",
        label: "Категории",
        options: [{ value: "", label: "Все" }, ...categoriesOptions],
      },
    ],
    [enginesOptions, categoriesOptions]
  );

  const columns = useMemo(
    () => [
      { field: "article", header: "Артикул" },
      { field: "name", header: "Название" },
      // { field: "description", header: "Описание" },
      {
        field: "engineId",
        header: "Двигатель",
        render: (value) => engines.data.find((engine) => engine.id === value)?.name,
      },
      {
        field: "price",
        header: "Цена",
        render: (value) => `${value.toLocaleString()} ₽`,
      },
      { field: "count", header: "Остаток" },
    ],
    [engines.data]
  );

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
      {engines.error && <div>Ошибка двигателей: {engines.error}</div>}

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
          href="/crm/products/create"
          disabled={rows.loading}
        >
          Создать товар
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={rows.data}
        pagination={rows.pagination}
        loading={rows.loading || deletedEntity.loading}
        getEditUrl={(productId) => `/crm/products/${productId}/edit`}
        onPageChange={(newPage) => rows.setPage(newPage + 1)}
        onRowsPerPageChange={rows.setLimit}
        onDelete={setSelectedForDelete}
      />

      <ConfirmationDialog
        open={!!selectedForDelete}
        onClose={() => setSelectedForDelete(null)}
        onConfirm={handleDelete}
        contentText={`Вы уверены, что хотите удалить товар "${getSelectedProductString(selectedForDelete)}"?`}
      />
    </CrmLayout>
  );
};

export default ProductsPage;
