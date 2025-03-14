// pages/crm/users/index.js

import { useMemo, useState } from "react";
import CrmLayout from "@/components/layouts/CrmLayout";
import { DataTableFilters } from "@/components/crm/common/DataTableFilters";
import { DataTable } from "@/components/crm/common/DataTable";
import { ConfirmationDialog } from "@/components/crm/common/ConfirmationDialog";
import { useProducts } from "@/lib/hooks/useProducts";
import { useProduct } from "@/lib/hooks/useProduct";
import { useDebounce } from "react-use";
import { toast } from "react-toastify";
import { useEngines } from "@/lib/hooks/useEngines";

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
  const engines = useEngines();
  const deletedProduct = useProduct();

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
    { field: "description", header: "Описание" },
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

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  useDebounce(
    () => {
      products.setSearch(searchTerm); // Передаем новое значение поиска в хук
    },
    800,
    [searchTerm]
  );

  return (
    <CrmLayout>
      {products.error && <div>Ошибка продуктов: {products.error}</div>}
      {engines.error && <div>Ошибка двигателей: {engines.error}</div>}
      <DataTableFilters
        filtersConfig={filtersConfig}
        initialFilters={initialFilters}
        onFilterChange={products.setFilters}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange} // Передаем обработчик изменений поиска
      />
      <DataTable
        columns={columns}
        data={products.products}
        pagination={products.pagination}
        loading={products.loading || deletedProduct.loading}
        onPageChange={products.setPage}
        onRowsPerPageChange={products.setLimit}
        onDelete={setSelectedForDelete}
      />
      <ConfirmationDialog
        open={!!selectedForDelete}
        onClose={() => setSelectedForDelete(null)}
        onConfirm={() => {
          deletedProduct.deleteProduct(selectedForDelete?.id, () => {
            toast.success("Продукт удалён");
            products.refetch();
          });
          setSelectedForDelete(null);
        }}
        contentText={`Вы уверены, что хотите удалить продукт "${getSelectedProductString(selectedForDelete)}"?`}
      />
    </CrmLayout>
  );
};

export default ProductsPage;
