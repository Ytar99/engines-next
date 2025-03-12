// pages/crm/users/index.js

import { useState } from "react";
import CrmLayout from "@/components/layouts/CrmLayout";
import { DataTableFilters } from "@/components/crm/common/DataTableFilters";
import { DataTable } from "@/components/crm/common/DataTable";
import { ConfirmationDialog } from "@/components/crm/common/ConfirmationDialog";
import { useProducts } from "@/lib/hooks/useProducts";
import { useProduct } from "@/lib/hooks/useProduct";
import { useDebounce } from "react-use";
import { toast } from "react-toastify";

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

  const { products, pagination, loading, error, setPage, setLimit, setFilters, setSearch, refetch } = useProducts();
  const deletedProduct = useProduct();

  const filtersConfig = [
    {
      type: "select",
      name: "engineId",
      label: "Двигатель",
      options: [
        { value: "", label: "Все" },
        { value: "1", label: "2_8" },
        { value: "2", label: "BT" },
        { value: "3", label: "3_8" },
        { value: "4", label: "ISBe" },
      ],
    },
  ];

  const columns = [
    { field: "article", header: "Артикул" },
    { field: "name", header: "Название" },
    { field: "description", header: "Описание" },
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
      setSearch(searchTerm); // Передаем новое значение поиска в хук
    },
    800,
    [searchTerm]
  );

  return (
    <CrmLayout>
      {error && <div>{error}</div>} {/* Отображение ошибки, если есть */}
      <DataTableFilters
        filtersConfig={filtersConfig}
        initialFilters={initialFilters}
        onFilterChange={setFilters}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange} // Передаем обработчик изменений поиска
      />
      <DataTable
        columns={columns}
        data={products}
        pagination={pagination}
        loading={loading || deletedProduct.loading}
        onPageChange={setPage}
        onRowsPerPageChange={setLimit}
        onDelete={setSelectedForDelete}
      />
      <ConfirmationDialog
        open={!!selectedForDelete}
        onClose={() => setSelectedForDelete(null)}
        onConfirm={() => {
          deletedProduct.deleteProduct(selectedForDelete?.id, () => {
            toast.success("Продукт удалён");
            refetch();
          });
          setSelectedForDelete(null);
        }}
        contentText={`Вы уверены, что хотите удалить продукт "${getSelectedProductString(selectedForDelete)}"?`}
      />
    </CrmLayout>
  );
};

export default ProductsPage;
